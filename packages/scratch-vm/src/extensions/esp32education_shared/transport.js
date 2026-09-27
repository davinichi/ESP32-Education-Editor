/**
 * Scratch ESP32 Education v0.4 development
 * 7個の拡張カテゴリーから共用する Web Serial 通信モジュール。
 *
 * 1台のESP32に対して複数カテゴリーが別々のシリアルポートを開かないよう、
 * Scratch runtime ごとに Transport を1つだけ生成して共有します。
 */

/** runtimeごとの共通Transportを保持します。 */
const transports = new WeakMap();

/**
 * 指定時間だけ非同期で待機します。
 * @param {number} ms 待機時間（ミリ秒）。
 * @returns {Promise<void>} 待機終了時に解決するPromise。
 */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * ESP32とのUSB/Web Serial通信を管理します。
 */
class ESP32EducationTransport {
    /**
     * シリアル通信に必要な変数を初期化します。
     */
    constructor () {
        // 利用者が選択したWeb Serialポート。未接続時はnullです。
        this.port = null;
        // 受信用reader。受信ループ中だけ値を持ちます。
        this.reader = null;
        // 送信用writer。接続中だけ値を持ちます。
        this.writer = null;
        // Web Serialポートを現在開いているかを示します。
        this.connected = false;
        // 受信ループを継続するかを示します。
        this.keepReading = false;
        // 改行まで届いていない受信文字列を保持します。
        this.readBuffer = '';
        // 送信文字列をUTF-8へ変換するエンコーダです。
        this.encoder = new TextEncoder();
        // 各機能拡張へ受信1行を通知する関数の集合です。
        this.listeners = new Set();
        // SYS:READY:で受信した最新のESP32状態です。
        this.ready = '';
        // SYS:MAC:で受信したESP32自身のMACアドレスです。
        this.mac = '';
        // SYS:CH:で受信したWi-Fiチャンネルです。
        this.channel = '';
        // 接続・送信などで発生した最後のエラー文字列です。
        this.lastError = '';
        // Prevent duplicate cleanup when multiple disconnect signals arrive together.
        this._cleanupPromise = null;
        // Register the browser-level disconnect event only once.
        this._serialDisconnectListenerInstalled = false;
        this._serialDisconnectHandler = event => {
            const eventPort = event && (event.target || event.port);
            if (!this.port) return;
            if (eventPort && eventPort !== this.port &&
                (typeof navigator === 'undefined' || eventPort !== navigator.serial)) return;
            void this.handleUnexpectedDisconnect('USB cable disconnected. Connect the ESP32 again manually.');
        };
    }

    /**
     * 受信行を通知する関数を登録します。
     * @param {Function} callback 受信1行を受け取る関数。
     * @returns {Function} 登録解除関数。
     */
    addListener (callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * 登録済みの全機能へ受信1行を通知します。
     * @param {string} line 改行処理済みの受信行。
     */
    notify (line) {
        for (const callback of this.listeners) {
            try {
                callback(line);
            } catch (error) {
                // 1つの拡張で例外が起きても他の拡張への通知を続けます。
                console.error(error);
            }
        }
    }

    /** Register the Web Serial physical-disconnect event once. */
    installDisconnectListener () {
        if (this._serialDisconnectListenerInstalled) return;
        if (typeof navigator === 'undefined' || !navigator.serial ||
            typeof navigator.serial.addEventListener !== 'function') return;
        navigator.serial.addEventListener('disconnect', this._serialDisconnectHandler);
        this._serialDisconnectListenerInstalled = true;
    }

    /** Clear values that belong to the previously connected ESP32. */
    clearDeviceState () {
        this.ready = '';
        this.mac = '';
        this.channel = '';
        this.readBuffer = '';
    }

    /** Release stream locks and the selected port. */
    async cleanupConnection (reason = '') {
        if (reason) this.lastError = reason;
        this.connected = false;
        this.keepReading = false;
        this.clearDeviceState();

        if (this._cleanupPromise) {
            await this._cleanupPromise;
            return;
        }

        const port = this.port;
        const reader = this.reader;
        const writer = this.writer;
        this.port = null;
        this.reader = null;
        this.writer = null;

        this._cleanupPromise = (async () => {
            if (reader) {
                try { await reader.cancel(); } catch (error) { /* already closed */ }
                try { reader.releaseLock(); } catch (error) { /* already released */ }
            }
            if (writer) {
                try { writer.releaseLock(); } catch (error) { /* already released */ }
            }
            if (port) {
                try { await port.close(); } catch (error) { /* unplugged ports can already be closed */ }
            }
        })();

        try {
            await this._cleanupPromise;
        } finally {
            this._cleanupPromise = null;
        }
    }

    /** Handle an unexpected USB/Web Serial disconnect without reconnecting automatically. */
    async handleUnexpectedDisconnect (reason) {
        await this.cleanupConnection(reason || 'USB communication disconnected. Connect the ESP32 again manually.');
    }

    /**
     * Web Serialのポート選択画面を開き、115200bpsでESP32へ接続します。
     * ESP32の自動リセットを考慮して1.5秒待った後に状態を要求します。
     * @returns {Promise<void>} 接続処理完了時に解決します。
     */
    async connect () {
        this.lastError = '';
        if (typeof navigator === 'undefined' || !('serial' in navigator)) {
            this.lastError = 'このブラウザはWeb Serialに対応していません。';
            throw new Error(this.lastError);
        }
        if (this.connected) return;
        if (this._cleanupPromise) await this._cleanupPromise;

        this.installDisconnectListener();

        try {
            const selectedPort = await navigator.serial.requestPort();
            this.port = selectedPort;
            await selectedPort.open({
                baudRate: 115200,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                bufferSize: 1024,
                flowControl: 'none'
            });
            if (!selectedPort.writable) throw new Error('Serial port is not writable.');
            this.writer = selectedPort.writable.getWriter();
            this.connected = true;
            this.keepReading = true;
            void this.readLoop();
            await sleep(1500);
            if (!this.connected) throw new Error(this.lastError || 'USB communication disconnected.');
            await this.sendLine('SYS:STATUS');
        } catch (error) {
            const message = this.lastError || (error && error.message ? error.message : String(error));
            if (this.port || this.reader || this.writer || this.connected) {
                await this.cleanupConnection(message);
            } else {
                this.lastError = message;
            }
            throw error;
        }
    }

    /**
     * 受信を止め、reader/writerのロックとシリアルポートを解放します。
     * @returns {Promise<void>} 切断完了時に解決します。
     */
    async disconnect () {
        this.lastError = '';
        await this.cleanupConnection('');
    }

    /**
     * USBから届くバイト列を改行単位で取り出し、状態を保存して各拡張へ通知します。
     * @returns {Promise<void>} 受信ループ終了時に解決します。
     */
    async readLoop () {
        if (!this.port || !this.port.readable) return;
        const decoder = new TextDecoder();
        const reader = this.port.readable.getReader();
        this.reader = reader;
        let unexpectedDisconnect = false;

        try {
            while (this.keepReading) {
                const {value, done} = await reader.read();
                if (done) {
                    if (this.keepReading && this.connected) unexpectedDisconnect = true;
                    break;
                }
                if (!value) continue;
                this.readBuffer += decoder.decode(value, {stream: true});
                let index;
                while ((index = this.readBuffer.indexOf('\n')) >= 0) {
                    let line = this.readBuffer.slice(0, index);
                    this.readBuffer = this.readBuffer.slice(index + 1);
                    line = line.replace(/\r/g, '').trim();
                    if (!line) continue;
                    if (line.startsWith('SYS:READY:')) this.ready = line.substring(10);
                    else if (line.startsWith('SYS:MAC:')) this.mac = line.substring(8);
                    else if (line.startsWith('SYS:CH:')) this.channel = line.substring(7);
                    this.notify(line);
                }
            }
        } catch (error) {
            if (this.keepReading && this.connected) {
                unexpectedDisconnect = true;
                this.lastError = 'USB cable disconnected. Connect the ESP32 again manually.';
            }
        } finally {
            try { reader.releaseLock(); } catch (error) { /* already released */ }
            if (this.reader === reader) this.reader = null;
            if (unexpectedDisconnect) {
                await this.handleUnexpectedDisconnect(this.lastError);
            }
        }
    }

    /**
     * 改行を除いたコマンド文字列をESP32へ送信します。
     * @param {string} text 送信するコマンド。
     * @returns {Promise<void>} 書き込み完了時に解決します。
     */
    async sendLine (text) {
        if (!this.connected || !this.writer) {
            this.lastError = '先に「ESP32 接続」を追加してESP32へ接続してください。';
            throw new Error(this.lastError);
        }
        const normalized = String(text).replace(/[\r\n]+/g, '');
        try {
            await this.writer.write(this.encoder.encode(`${normalized}\n`));
            await sleep(10);
        } catch (error) {
            const message = 'USB communication failed. Connect the ESP32 again manually.';
            await this.handleUnexpectedDisconnect(message);
            throw error;
        }
    }

    /**
     * ESP32へ現在状態の送信を要求します。
     * @returns {Promise<void>} 送信完了時に解決します。
     */
    async refreshStatus () {
        await this.sendLine('SYS:STATUS');
    }
}

/**
 * Scratch runtimeごとに共通Transportを取得します。
 * @param {object} runtime Scratch VM runtime。
 * @returns {ESP32EducationTransport} 共有Transport。
 */
const getTransport = runtime => {
    if (!transports.has(runtime)) transports.set(runtime, new ESP32EducationTransport());
    return transports.get(runtime);
};

module.exports = {
    getTransport,
    sleep
};

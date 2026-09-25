/**
 * Scratch ESP32 Education v0.2
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

    /**
     * Web Serialのポート選択画面を開き、115200bpsでESP32へ接続します。
     * ESP32の自動リセットを考慮して1.5秒待った後に状態を要求します。
     * @returns {Promise<void>} 接続処理完了時に解決します。
     */
    async connect () {
        this.lastError = '';
        if (!('serial' in navigator)) {
            this.lastError = 'このブラウザはWeb Serialに対応していません。';
            throw new Error(this.lastError);
        }
        if (this.connected) return;

        try {
            this.port = await navigator.serial.requestPort();
            await this.port.open({
                baudRate: 115200,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                bufferSize: 1024,
                flowControl: 'none'
            });
            this.writer = this.port.writable.getWriter();
            this.connected = true;
            this.keepReading = true;
            this.readLoop();
            await sleep(1500);
            await this.sendLine('SYS:STATUS');
        } catch (error) {
            this.lastError = error && error.message ? error.message : String(error);
            throw error;
        }
    }

    /**
     * 受信を止め、reader/writerのロックとシリアルポートを解放します。
     * @returns {Promise<void>} 切断完了時に解決します。
     */
    async disconnect () {
        this.keepReading = false;
        if (this.reader) {
            try {
                await this.reader.cancel();
            } catch (error) {
                // 既にストリームが終了している場合などは切断を続けます。
            }
        }
        await sleep(50);
        if (this.writer) {
            try {
                this.writer.releaseLock();
            } catch (error) {
                // ロック解放済みでも切断を続けます。
            }
            this.writer = null;
        }
        if (this.port) {
            try {
                await this.port.close();
            } catch (error) {
                // ポートが既に閉じていても状態を未接続へ戻します。
            }
            this.port = null;
        }
        this.connected = false;
    }

    /**
     * USBから届くバイト列を改行単位で取り出し、状態を保存して各拡張へ通知します。
     * @returns {Promise<void>} 受信ループ終了時に解決します。
     */
    async readLoop () {
        if (!this.port || !this.port.readable) return;
        const decoder = new TextDecoder();
        try {
            this.reader = this.port.readable.getReader();
            while (this.keepReading) {
                const {value, done} = await this.reader.read();
                if (done) break;
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
            this.lastError = error && error.message ? error.message : String(error);
        } finally {
            if (this.reader) {
                try {
                    this.reader.releaseLock();
                } catch (error) {
                    // 解放済みの場合は無視します。
                }
                this.reader = null;
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
        await this.writer.write(this.encoder.encode(`${normalized}\n`));
        await sleep(10);
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

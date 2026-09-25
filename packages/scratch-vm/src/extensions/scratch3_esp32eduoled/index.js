/** Scratch ESP32 Education v0.2 - SSD1306 OLED */
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const {getTransport, sleep} = require('../esp32education_shared/transport');

/** SSD1306 128x64 OLEDを扱う拡張です。 */
class Scratch3ESP32OLEDBlocks {
    /** @param {object} runtime Scratch VM runtime。 */
    constructor (runtime) {
        // 全ESP32カテゴリーで共有する通信オブジェクトです。
        this.transport = getTransport(runtime);
        // OLEDから受信したREADY/ERRORです。
        this.statusValue = '';
        // OLED:ACK:で受信した最後の応答です。
        this.lastAck = '';
        // OLED状態とACKを受信したときに保存します。
        this.transport.addListener(line => {
            if (line === 'OLED:READY') this.statusValue = 'READY';
            else if (line === 'OLED:ERROR') this.statusValue = 'ERROR';
            else if (line.startsWith('OLED:ACK:')) this.lastAck = line.substring(9);
        });
    }

    /** Scratchへカテゴリー・色・ブロックを通知します。 */
    getInfo () {
        return {
            id: 'esp32eduoled',
            name: formatMessage({id: 'esp32eduoled.name', default: 'ESP32 OLED', description: 'ESP32 OLED extension name'}),
            color1: '#9966FF',
            color2: '#774DCB',
            color3: '#5E3DA3',
            blocks: [
                {opcode: 'init', blockType: BlockType.COMMAND, text: 'OLEDを初期化'},
                {opcode: 'clear', blockType: BlockType.COMMAND, text: 'OLED画面を消去'},
                {opcode: 'fillBlack', blockType: BlockType.COMMAND, text: 'OLEDの X [X] Y [Y] 幅 [W] 高さ [H] を黒で塗りつぶす', arguments: {
                    X: {type: ArgumentType.NUMBER, defaultValue: 0}, Y: {type: ArgumentType.NUMBER, defaultValue: 0},
                    W: {type: ArgumentType.NUMBER, defaultValue: 60}, H: {type: ArgumentType.NUMBER, defaultValue: 12}
                }},
                {opcode: 'cursor', blockType: BlockType.COMMAND, text: 'OLEDカーソルを X [X] Y [Y] に設定', arguments: {
                    X: {type: ArgumentType.NUMBER, defaultValue: 0}, Y: {type: ArgumentType.NUMBER, defaultValue: 0}
                }},
                {opcode: 'size', blockType: BlockType.COMMAND, text: 'OLED文字サイズを [SIZE] に設定', arguments: {
                    SIZE: {type: ArgumentType.NUMBER, defaultValue: 1}
                }},
                {opcode: 'text', blockType: BlockType.COMMAND, text: 'OLEDに [TEXT] を表示', arguments: {
                    TEXT: {type: ArgumentType.STRING, defaultValue: 'Hello'}
                }},
                {opcode: 'test', blockType: BlockType.COMMAND, text: 'OLED表示テスト'},
                {opcode: 'status', blockType: BlockType.REPORTER, text: 'OLEDの状態'},
                {opcode: 'ack', blockType: BlockType.REPORTER, text: 'OLED最後の応答'}
            ]
        };
    }

    /** OLEDを初期化します。 */
    async init () { this.lastAck = ''; await this.transport.sendLine('OLED:INIT'); await sleep(150); }
    /** OLED画面全体を黒で消去します。 */
    async clear () { this.lastAck = ''; await this.transport.sendLine('OLED:CLEAR'); }
    /** 指定矩形を黒で塗りつぶします。 */
    async fillBlack (args) {
        const x0 = Math.round(Number(args.X));
        const y0 = Math.round(Number(args.Y));
        const w0 = Math.round(Number(args.W));
        const h0 = Math.round(Number(args.H));
        const x = Number.isFinite(x0) ? Math.max(0, Math.min(127, x0)) : 0;
        const y = Number.isFinite(y0) ? Math.max(0, Math.min(63, y0)) : 0;
        const w = Number.isFinite(w0) ? Math.max(0, Math.min(128 - x, w0)) : 0;
        const h = Number.isFinite(h0) ? Math.max(0, Math.min(64 - y, h0)) : 0;
        this.lastAck = '';
        await this.transport.sendLine(`OLED:FILLBLACK:${x},${y},${w},${h}`);
    }
    /** 次に表示する文字のカーソル座標を指定します。 */
    async cursor (args) {
        const x0 = Math.round(Number(args.X));
        const y0 = Math.round(Number(args.Y));
        const x = Number.isFinite(x0) ? Math.max(0, Math.min(127, x0)) : 0;
        const y = Number.isFinite(y0) ? Math.max(0, Math.min(63, y0)) : 0;
        this.lastAck = '';
        await this.transport.sendLine(`OLED:CURSOR:${x},${y}`);
    }
    /** OLED文字サイズを1～8の範囲で設定します。 */
    async size (args) {
        let size = Math.round(Number(args.SIZE));
        if (!Number.isFinite(size)) size = 1;
        size = Math.max(1, Math.min(8, size));
        this.lastAck = '';
        await this.transport.sendLine(`OLED:SIZE:${size}`);
    }
    /** 現在のカーソル位置へ文字列を表示します。 */
    async text (args) {
        this.lastAck = '';
        await this.transport.sendLine(`OLED:TEXT:${String(args.TEXT).replace(/[\r\n]+/g, ' ')}`);
    }
    /** OLED表示テストを実行します。 */
    async test () { this.lastAck = ''; await this.transport.sendLine('OLED:TEST'); await sleep(100); }
    /** OLEDの状態を返します。 */
    status () { return this.statusValue; }
    /** OLEDの最後のACK内容を返します。 */
    ack () { return this.lastAck; }
}

module.exports = Scratch3ESP32OLEDBlocks;

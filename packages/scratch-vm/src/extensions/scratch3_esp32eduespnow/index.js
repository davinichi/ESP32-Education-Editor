/** Scratch ESP32 Education v0.2 - ESP-NOW */
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const {getTransport} = require('../esp32education_shared/transport');

/** ESP-NOWによる文字列送受信を扱う拡張です。 */
class Scratch3ESP32ESPNowBlocks {
    /** @param {object} runtime Scratch VM runtime。 */
    constructor (runtime) {
        // 全ESP32カテゴリーで共有する通信オブジェクトです。
        this.transport = getTransport(runtime);
        // 最後に受信したESP-NOW本文です。
        this.receivedData = '';
        // 新着データが未読かを示します。
        this.newData = false;
        // 最後の送信結果です。
        this.txResult = '';
        // ESP-NOWの受信本文と送信結果を保存します。
        this.transport.addListener(line => {
            if (line.startsWith('ESPNOW:RX:')) {
                this.receivedData = line.substring(10);
                this.newData = true;
            } else if (line === 'ESPNOW:TX:OK') {
                this.txResult = 'OK';
            } else if (line === 'ESPNOW:TX:FAIL') {
                this.txResult = 'FAIL';
            } else if (line.startsWith('ESPNOW:TX:ERROR:')) {
                this.txResult = line.substring(16);
            }
        });
    }

    /** Scratchへカテゴリー・色・ブロックを通知します。 */
    getInfo () {
        return {
            id: 'esp32eduespnow',
            name: formatMessage({id: 'esp32eduespnow.name', default: 'ESP32 ESP-NOW', description: 'ESP32 ESP-NOW extension name'}),
            color1: '#0FBD8C',
            color2: '#0B8E69',
            color3: '#087052',
            blocks: [
                {opcode: 'send', blockType: BlockType.COMMAND, text: '送信先MAC [MAC] に [MESSAGE] を送信', arguments: {
                    MAC: {type: ArgumentType.STRING, defaultValue: ''},
                    MESSAGE: {type: ArgumentType.STRING, defaultValue: 'こんにちは'}
                }},
                {opcode: 'received', blockType: BlockType.REPORTER, text: 'ESP-NOWで受信したデータ'},
                {opcode: 'hasNew', blockType: BlockType.BOOLEAN, text: 'ESP-NOWの新しいデータを受信した？'},
                {opcode: 'result', blockType: BlockType.REPORTER, text: 'ESP-NOWの送信結果'}
            ]
        };
    }

    /** MAC指定時はユニキャスト、空欄時はブロードキャストで送信します。 */
    async send (args) {
        this.txResult = '';
        const mac = String(args.MAC).trim();
        const message = String(args.MESSAGE).replace(/[\r\n]+/g, ' ');
        await this.transport.sendLine(`ESPNOW:SENDTO:${mac},${message}`);
    }
    /** 最新受信本文を返し、新着フラグを消します。 */
    received () { const value = this.receivedData; this.newData = false; return value; }
    /** 未読の新着データがあるかを返します。 */
    hasNew () { return this.newData; }
    /** 最後のESP-NOW送信結果を返します。 */
    result () { return this.txResult; }
}

module.exports = Scratch3ESP32ESPNowBlocks;

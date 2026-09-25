/** Scratch ESP32 Education v0.2 - ESP32 接続 */
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const {getTransport} = require('../esp32education_shared/transport');

/** Web Serial接続とESP32本体情報を扱う拡張です。 */
class Scratch3ESP32ConnectionBlocks {
    /**
     * @param {object} runtime Scratch VM runtime。
     */
    constructor (runtime) {
        // 他のESP32拡張と共有する通信オブジェクトです。
        this.transport = getTransport(runtime);
    }

    /** Scratchへカテゴリー・色・ブロックを通知します。 */
    getInfo () {
        return {
            id: 'esp32educonnection',
            name: formatMessage({id: 'esp32educonnection.name', default: 'ESP32 接続', description: 'ESP32 connection extension name'}),
            color1: '#4C97FF',
            color2: '#3373CC',
            color3: '#2E64A1',
            blocks: [
                {opcode: 'connect', blockType: BlockType.COMMAND, text: 'ESP32に接続'},
                {opcode: 'disconnect', blockType: BlockType.COMMAND, text: 'ESP32から切断'},
                {opcode: 'isConnected', blockType: BlockType.BOOLEAN, text: 'ESP32は接続済み？'},
                {opcode: 'refresh', blockType: BlockType.COMMAND, text: 'ESP32の状態を更新'},
                {opcode: 'status', blockType: BlockType.REPORTER, text: 'ESP32の状態'},
                {opcode: 'mac', blockType: BlockType.REPORTER, text: 'ESP32のMACアドレス'},
                {opcode: 'channel', blockType: BlockType.REPORTER, text: 'ESP32のWi-Fiチャンネル'}
            ]
        };
    }

    /** Web SerialでESP32へ接続します。 */
    async connect () { await this.transport.connect(); }
    /** ESP32とのWeb Serial接続を閉じます。 */
    async disconnect () { await this.transport.disconnect(); }
    /** 接続状態を返します。 */
    isConnected () { return this.transport.connected; }
    /** ESP32へ状態送信を要求します。 */
    async refresh () { await this.transport.refreshStatus(); }
    /** ESP32から受信した状態文字列を返します。 */
    status () { return this.transport.ready; }
    /** ESP32自身のMACアドレスを返します。 */
    mac () { return this.transport.mac; }
    /** ESP32が使用中のWi-Fiチャンネルを返します。 */
    channel () { return this.transport.channel; }
}

module.exports = Scratch3ESP32ConnectionBlocks;

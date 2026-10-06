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
            name: formatMessage({
                id: 'esp32educonnection.name',
                default: 'ESP32 Connection',
                description: 'ESP32 connection extension name'
            }),
            color1: '#4C97FF',
            color2: '#3373CC',
            color3: '#2E64A1',
            blocks: [
                {
                    opcode: 'connect',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'esp32educonnection.connect',
                        default: 'connect to ESP32',
                        description: 'ESP32 Connection block'
                    })
                },
                {
                    opcode: 'disconnect',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'esp32educonnection.disconnect',
                        default: 'disconnect from ESP32',
                        description: 'ESP32 Connection block'
                    })
                },
                {
                    opcode: 'isConnected',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'esp32educonnection.isConnected',
                        default: 'ESP32 connected?',
                        description: 'ESP32 Connection block'
                    })
                },
                {
                    opcode: 'refresh',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'esp32educonnection.refresh',
                        default: 'refresh ESP32 status',
                        description: 'ESP32 Connection block'
                    })
                },
                {
                    opcode: 'status',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32educonnection.status',
                        default: 'ESP32 status',
                        description: 'ESP32 Connection block'
                    })
                },
                {
                    opcode: 'mac',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32educonnection.mac',
                        default: 'ESP32 MAC address',
                        description: 'ESP32 Connection block'
                    })
                },
                {
                    opcode: 'channel',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32educonnection.channel',
                        default: 'ESP32 Wi-Fi channel',
                        description: 'ESP32 Connection block'
                    })
                }
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

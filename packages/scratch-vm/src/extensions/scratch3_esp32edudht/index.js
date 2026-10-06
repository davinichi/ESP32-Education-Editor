/** Scratch ESP32 Education v0.2 - DHT11/DHT22 */
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const {getTransport, sleep} = require('../esp32education_shared/transport');

/** DHT11/DHT22の温度・湿度を扱う拡張です。 */
class Scratch3ESP32DHTBlocks {
    /** @param {object} runtime Scratch VM runtime。 */
    constructor (runtime) {
        // 全ESP32カテゴリーで共有する通信オブジェクトです。
        this.transport = getTransport(runtime);
        // 最後に受信した温度（℃）。未受信はNaNです。
        this.temperature = NaN;
        // 最後に受信した相対湿度（％）。未受信はNaNです。
        this.humidity = NaN;
        // DHTの最後の状態文字列です。
        this.statusValue = '';
        // DHTの測定値・状態を受信したときに保存します。
        this.transport.addListener(line => {
            if (line.startsWith('DHT:DATA:')) {
                const parts = line.split(':');
                if (parts.length >= 4) {
                    this.temperature = Number(parts[2]);
                    this.humidity = Number(parts[3]);
                    this.statusValue = 'OK';
                }
            } else if (line.startsWith('DHT:STATUS:')) {
                this.statusValue = line.substring(11);
            }
        });
    }

    /** Scratchへカテゴリー・色・ブロック・メニューを通知します。 */
    getInfo () {
        return {
            id: 'esp32edudht',
            name: formatMessage({
                id: 'esp32edudht.name',
                default: 'ESP32 DHT',
                description: 'ESP32 DHT extension name'
            }),
            color1: '#5CB1D6',
            color2: '#3E8FB0',
            color3: '#32718C',
            blocks: [
                {
                    opcode: 'init',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'esp32edudht.init',
                        default: 'initialize [TYPE] on GPIO [PIN]',
                        description: 'ESP32 DHT block'
                    }),
                    arguments: {
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: 'types',
                            defaultValue: 'DHT22'
                        },
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: '25'
                        }
                    }
                },
                {
                    opcode: 'temp',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32edudht.temp',
                        default: 'DHT temperature (°C)',
                        description: 'ESP32 DHT block'
                    })
                },
                {
                    opcode: 'humi',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32edudht.humi',
                        default: 'DHT humidity (%)',
                        description: 'ESP32 DHT block'
                    })
                },
                {
                    opcode: 'status',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32edudht.status',
                        default: 'DHT status',
                        description: 'ESP32 DHT block'
                    })
                }
            ],
            menus: {
                types: {
                    acceptReporters: false,
                    items: ['DHT11', 'DHT22']
                },
                pins: {
                    acceptReporters: false,
                    items: [
                        '2',
                        '4',
                        '5',
                        '12',
                        '13',
                        '14',
                        '15',
                        '16',
                        '17',
                        '18',
                        '19',
                        '21',
                        '22',
                        '23',
                        '25',
                        '26',
                        '27',
                        '32',
                        '33'
                    ]
                }
            }
        };
    }

    /** DHT種類とGPIO番号をESP32へ設定します。 */
    async init (args) {
        this.statusValue = '';
        await this.transport.sendLine(`DHT:INIT:${args.TYPE},${args.PIN}`);
        await sleep(100);
    }
    /** ESP32へDHT読み取りを要求します。 */
    async readDHT () {
        await this.transport.sendLine('DHT:READ');
        await sleep(150);
    }
    /** DHT読み取り後の温度（℃）を返します。 */
    async temp () {
        await this.readDHT();
        return Number.isFinite(this.temperature) ? this.temperature : 0;
    }
    /** DHT読み取り後の相対湿度（％）を返します。 */
    async humi () {
        await this.readDHT();
        return Number.isFinite(this.humidity) ? this.humidity : 0;
    }
    /** DHTの最後の状態を返します。 */
    status () { return this.statusValue; }
}

module.exports = Scratch3ESP32DHTBlocks;

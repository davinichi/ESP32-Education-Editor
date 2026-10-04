/** Scratch ESP32 Education v0.6 - Ultrasonic Sensor */
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const {getTransport} = require('../esp32education_shared/transport');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/** ESP32へ接続したHC-SR04超音波距離センサを使用する拡張です。 */
class Scratch3ESP32UltrasonicBlocks {
    /** @param {object} runtime Scratch VM runtime。 */
    constructor (runtime) {
        // 全ESP32カテゴリーで共有する通信オブジェクトです。
        this.transport = getTransport(runtime);

        // 最後に受信した距離(cm)。未受信または測定失敗時は-1です。
        this.distanceValue = -1;

        // ファームウェアから返された距離データを保存します。
        this.transport.addListener(line => {
            if (line.startsWith('HCSR04:DISTANCE:')) {
                const value = Number(line.substring(16));
                this.distanceValue = Number.isFinite(value) ? value : -1;
            } else if (line.startsWith('HCSR04:ERROR:')) {
                this.distanceValue = -1;
            }
        });
    }

    /** Scratchへカテゴリー色ブロックを通知します。 */
    getInfo () {
        return {
            id: 'esp32eduultrasonic',
            name: formatMessage({
                id: 'esp32eduultrasonic.name',
                default: 'ESP32 超音波',
                description: 'ESP32 ultrasonic sensor extension name'
            }),
            color1: '#4C97FF',
            color2: '#3373CC',
            color3: '#285AA3',
            blocks: [
                {
                    opcode: 'attach',
                    blockType: BlockType.COMMAND,
                    text: '超音波センサを TRIG [TRIG] ECHO [ECHO] に接続',
                    arguments: {
                        TRIG: {
                            type: ArgumentType.STRING,
                            menu: 'trigPins',
                            defaultValue: '26'
                        },
                        ECHO: {
                            type: ArgumentType.STRING,
                            menu: 'echoPins',
                            defaultValue: '34'
                        }
                    }
                },
                {
                    opcode: 'distance',
                    blockType: BlockType.REPORTER,
                    text: '超音波センサの距離（cm）'
                }
            ],
            menus: {
                trigPins: {
                    acceptReporters: false,
                    items: [
                        '13','14','16','17','18','19',
                        '21','22','23','25','26','27','32','33'
                    ]
                },
                echoPins: {
                    acceptReporters: false,
                    items: [
                        '13','14','16','17','18','19',
                        '21','22','23','25','26','27',
                        '32','33','34','35','36','39'
                    ]
                }
            }
        };
    }

    /** HC-SR04のTRIGECHO GPIOを設定します。 */
    async attach (args) {
        await this.transport.sendLine(`HCSR04:ATTACH:${args.TRIG},${args.ECHO}`);
        await sleep(50);
    }

    /** HC-SR04から距離(cm)を取得します。測定失敗時は-1を返します。 */
    async distance () {
        this.distanceValue = -1;
        await this.transport.sendLine('HCSR04:DISTANCE?');
        await sleep(120);
        return Number.isFinite(this.distanceValue) ? this.distanceValue : -1;
    }
}

module.exports = Scratch3ESP32UltrasonicBlocks;
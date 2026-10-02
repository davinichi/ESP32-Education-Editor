/** Scratch ESP32 Education v0.5 - Servo */
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const {getTransport} = require('../esp32education_shared/transport');

/** ESP32へ直接接続したサーボモーターを制御する拡張です。 */
class Scratch3ESP32ServoBlocks {
    /** @param {object} runtime Scratch VM runtime。 */
    constructor (runtime) {
        // 全ESP32カテゴリーで共有する通信オブジェクトです。
        this.transport = getTransport(runtime);
    }

    /** Scratchへカテゴリー色ブロックを通知します。 */
    getInfo () {
        return {
            id: 'esp32eduservo',
            name: formatMessage({
                id: 'esp32eduservo.name',
                default: 'ESP32 Servo',
                description: 'ESP32 Servo extension name'
            }),
            color1: '#FF6680',
            color2: '#E64D68',
            color3: '#CC3D58',
            blocks: [
                {
                    opcode: 'attach',
                    blockType: BlockType.COMMAND,
                    text: 'サーボを GPIO [PIN] に接続',
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'servoPins',
                            defaultValue: '13'
                        }
                    }
                },
                {
                    opcode: 'angle',
                    blockType: BlockType.COMMAND,
                    text: 'サーボの角度を [ANGLE] 度にする',
                    arguments: {
                        ANGLE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        }
                    }
                },
                {
                    opcode: 'detach',
                    blockType: BlockType.COMMAND,
                    text: 'サーボを切断する'
                }
            ],
            menus: {
                servoPins: {
                    acceptReporters: false,
                    items: [
                        '13','14','16','17','18','19',
                        '21','22','23','25','26','27','32','33'
                    ]
                }
            }
        };
    }

    /** 指定GPIOへサーボを接続します。 */
    async attach (args) {
        await this.transport.sendLine(`SERVO:ATTACH:${args.PIN}`);
    }

    /** サーボ角度を0～180度で指定します。 */
    async angle (args) {
        let angle = Math.round(Number(args.ANGLE));
        if (!Number.isFinite(angle)) angle = 90;
        angle = Math.max(0, Math.min(180, angle));
        await this.transport.sendLine(`SERVO:ANGLE:${angle}`);
    }

    /** サーボ出力を停止してGPIOから切り離します。 */
    async detach () {
        await this.transport.sendLine('SERVO:DETACH');
    }
}

module.exports = Scratch3ESP32ServoBlocks;
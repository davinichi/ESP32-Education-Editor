/** Scratch ESP32 Education v0.2 - GPIO */
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const {getTransport, sleep} = require('../esp32education_shared/transport');

/** ESP32 GPIOのデジタル入出力を扱う拡張です。 */
class Scratch3ESP32GPIOBlocks {
    /** @param {object} runtime Scratch VM runtime。 */
    constructor (runtime) {
        // 全ESP32カテゴリーで共有する通信オブジェクトです。
        this.transport = getTransport(runtime);
        // ピン番号ごとの最後のデジタル入力値です。
        this.values = Object.create(null);
        // GPIO:READ応答を受信したときに値を保存します。
        this.transport.addListener(line => {
            if (line.startsWith('GPIO:READ:')) {
                const parts = line.split(':');
                if (parts.length >= 4) this.values[parts[2]] = Number(parts[3]) ? 1 : 0;
            }
        });
    }

    /** Scratchへカテゴリー・色・ブロック・メニューを通知します。 */
    getInfo () {
        return {
            id: 'esp32edugpio',
            name: formatMessage({id: 'esp32edugpio.name', default: 'ESP32 GPIO', description: 'ESP32 GPIO extension name'}),
            color1: '#FFAB19',
            color2: '#CF8B17',
            color3: '#A66F12',
            blocks: [
                {opcode: 'mode', blockType: BlockType.COMMAND, text: 'GPIO [PIN] を [MODE] に設定', arguments: {
                    PIN: {type: ArgumentType.STRING, menu: 'pins', defaultValue: '23'},
                    MODE: {type: ArgumentType.STRING, menu: 'modes', defaultValue: 'OUTPUT'}
                }},
                {opcode: 'write', blockType: BlockType.COMMAND, text: 'GPIO [PIN] に [STATE] を出力', arguments: {
                    PIN: {type: ArgumentType.STRING, menu: 'pins', defaultValue: '23'},
                    STATE: {type: ArgumentType.STRING, menu: 'states', defaultValue: 'HIGH'}
                }},
                {opcode: 'pwmWrite', blockType: BlockType.COMMAND, text: 'GPIO [PIN] のPWM出力を [PERCENT] % にする', arguments: {
                    PIN: {type: ArgumentType.STRING, menu: 'pwmPins', defaultValue: '23'},
                    PERCENT: {type: ArgumentType.NUMBER, defaultValue: 50}
                }},
                {opcode: 'pwmStop', blockType: BlockType.COMMAND, text: 'GPIO [PIN] のPWM出力を停止する', arguments: {
                    PIN: {type: ArgumentType.STRING, menu: 'pwmPins', defaultValue: '23'}
                }},
                {opcode: 'read', blockType: BlockType.REPORTER, text: 'GPIO [PIN] のデジタル入力', arguments: {
                    PIN: {type: ArgumentType.STRING, menu: 'pins', defaultValue: '23'}
                }}
            ],
            menus: {
                pins: {acceptReporters: false, items: ['2','4','5','12','13','14','15','16','17','18','19','21','22','23','25','26','27','32','33','34','35','36','39']},
                pwmPins: {acceptReporters: false, items: ['13','14','16','17','18','19','21','22','23','25','26','27','32','33']},
                modes: {acceptReporters: false, items: [
                    {text: '出力', value: 'OUTPUT'},
                    {text: '入力', value: 'INPUT'},
                    {text: '入力（プルアップ）', value: 'INPUT_PULLUP'},
                    {text: '入力（プルダウン）', value: 'INPUT_PULLDOWN'}
                ]},
                states: {acceptReporters: false, items: ['HIGH', 'LOW']}
            }
        };
    }

    /** 指定GPIOの入出力モードを設定します。 */
    async mode (args) { await this.transport.sendLine(`GPIO:MODE:${args.PIN},${args.MODE}`); }
    /** 指定GPIOへHIGH/LOWを出力します。 */
    async write (args) { await this.transport.sendLine(`GPIO:WRITE:${args.PIN},${args.STATE}`); }
    /** 指定GPIOへ0～100%のPWMを出力します。 */
    async pwmWrite (args) {
        let percent = Math.round(Number(args.PERCENT));
        if (!Number.isFinite(percent)) percent = 0;
        percent = Math.max(0, Math.min(100, percent));

        await this.transport.sendLine(`PWM:WRITE:${args.PIN},${percent}`);
    }

    /** 指定GPIOのPWM出力を停止します。 */
    async pwmStop (args) {
        await this.transport.sendLine(`PWM:STOP:${args.PIN}`);
    }
    /** 指定GPIOのデジタル値を要求し、最後に受信した0/1を返します。 */
    async read (args) {
        const pin = String(args.PIN);
        await this.transport.sendLine(`GPIO:READ:${pin}`);
        await sleep(40);
        return this.values[pin] ?? 0;
    }
}

module.exports = Scratch3ESP32GPIOBlocks;

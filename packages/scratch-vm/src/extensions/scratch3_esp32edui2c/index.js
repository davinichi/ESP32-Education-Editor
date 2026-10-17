const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const {getTransport} = require('../esp32education_shared/transport');
const {parseAddress} = require('../esp32education_shared/i2c');

class Scratch3I2CBlocks {
    constructor (runtime) {
        this.transport = getTransport(runtime);
        this.addresses = [];
        this.resultValue = '';
        this.transport.addListener(line => {
            if (line === 'SYS:DISCONNECTED') {
                this.addresses = [];
                this.resultValue = '';
            }
        });
    }

    getInfo () {
        return {
            id: 'esp32edui2c',
            name: formatMessage({
                id: 'esp32edui2c.name',
                default: 'ESP32 I2C Scanner',
                description: 'ESP32 Education block'
            }),
            color1: '#5CB1D6',
            color2: '#3E8FB0',
            color3: '#32718C',
            blocks: [
                {
                    opcode: 'scan',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'esp32edui2c.scan',
                        default: 'scan I2C devices',
                        description: 'ESP32 Education block'
                    })
                },
                {
                    opcode: 'result',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32edui2c.result',
                        default: 'I2C scan results',
                        description: 'ESP32 Education block'
                    })
                },
                {
                    opcode: 'found',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'esp32edui2c.found',
                        default: 'I2C address [ADDRESS] found?',
                        description: 'ESP32 Education block'
                    }),
                    arguments: {ADDRESS: {type: ArgumentType.STRING, defaultValue: '0x40'}}
                }
            ]
        };
    }

    async scan () {
        this.addresses = [];
        this.resultValue = '';
        try {
            const line = await this.transport.request('I2C:SCAN', value =>
                value.startsWith('I2C:SCAN:') || value.startsWith('I2C:ERROR:'));
            this.addresses = [];
            if (line.startsWith('I2C:ERROR:')) {
                this.resultValue = line.substring(10);
                return;
            }
            const text = line.substring(9);
            const fields = text ? text.split(',') : [];
            if (fields.some(value => !/^0x[0-9a-f]{2}$/i.test(value) || parseAddress(value) === null)) {
                this.resultValue = 'READ_ERROR';
                return;
            }
            this.addresses = fields.map(parseAddress);
            this.resultValue = fields.join(',');
        } catch (error) {
            this.addresses = [];
            this.resultValue = error.message;
        }
    }

    result () {
        return this.resultValue;
    }
    found (args) {
        return this.addresses.includes(parseAddress(args.ADDRESS));
    }
}

module.exports = Scratch3I2CBlocks;

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const {I2CSensor} = require('../esp32education_shared/i2c');

class Scratch3INA219Blocks extends I2CSensor {
    constructor (runtime) {
        super(runtime, 'INA219', 4);
    }

    getInfo () {
        return {
            id: 'esp32eduina219',
            name: formatMessage({
                id: 'esp32eduina219.name',
                default: 'ESP32 INA219',
                description: 'ESP32 Education block'
            }),
            color1: '#5CB1D6',
            color2: '#3E8FB0',
            color3: '#32718C',
            blocks: [
                {
                    opcode: 'init',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'esp32eduina219.init',
                        default: 'initialize INA219 at address [ADDRESS]',
                        description: 'ESP32 Education block'
                    }),
                    arguments: {
                        ADDRESS: {type: ArgumentType.STRING, menu: 'addresses', defaultValue: '0x40'}
                    }
                },
                {
                    opcode: 'voltage',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32eduina219.voltage',
                        default: 'INA219 bus voltage (V)',
                        description: 'ESP32 Education block'
                    })
                },
                {
                    opcode: 'current',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32eduina219.current',
                        default: 'INA219 current (mA)',
                        description: 'ESP32 Education block'
                    })
                },
                {
                    opcode: 'power',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32eduina219.power',
                        default: 'INA219 power (mW)',
                        description: 'ESP32 Education block'
                    })
                },
                {
                    opcode: 'shunt',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32eduina219.shunt',
                        default: 'INA219 shunt voltage (mV)',
                        description: 'ESP32 Education block'
                    })
                },
                {
                    opcode: 'status',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32eduina219.status',
                        default: 'INA219 status',
                        description: 'ESP32 Education block'
                    })
                }
            ],
            menus: {
                addresses: {
                    acceptReporters: true,
                    items: [
                        '0x40', '0x41', '0x42', '0x43', '0x44', '0x45', '0x46', '0x47',
                        '0x48', '0x49', '0x4A', '0x4B', '0x4C', '0x4D', '0x4E', '0x4F'
                    ]
                }
            }
        };
    }

    voltage () {
        return this.readValue(0);
    }
    current () {
        return this.readValue(1);
    }
    power () {
        return this.readValue(2);
    }
    shunt () {
        return this.readValue(3);
    }
}

module.exports = Scratch3INA219Blocks;

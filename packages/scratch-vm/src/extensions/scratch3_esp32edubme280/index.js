const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const {I2CSensor} = require('../esp32education_shared/i2c');

class Scratch3BME280Blocks extends I2CSensor {
    constructor (runtime) {
        super(runtime, 'BME280', 3);
    }

    getInfo () {
        return {
            id: 'esp32edubme280',
            name: formatMessage({
                id: 'esp32edubme280.name',
                default: 'ESP32 BME280',
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
                        id: 'esp32edubme280.init',
                        default: 'initialize BME280 at address [ADDRESS]',
                        description: 'ESP32 Education block'
                    }),
                    arguments: {
                        ADDRESS: {type: ArgumentType.STRING, menu: 'addresses', defaultValue: '0x76'}
                    }
                },
                {
                    opcode: 'temperature',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32edubme280.temperature',
                        default: 'BME280 temperature (°C)',
                        description: 'ESP32 Education block'
                    })
                },
                {
                    opcode: 'humidity',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32edubme280.humidity',
                        default: 'BME280 humidity (%)',
                        description: 'ESP32 Education block'
                    })
                },
                {
                    opcode: 'pressure',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32edubme280.pressure',
                        default: 'BME280 pressure (hPa)',
                        description: 'ESP32 Education block'
                    })
                },
                {
                    opcode: 'status',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32edubme280.status',
                        default: 'BME280 status',
                        description: 'ESP32 Education block'
                    })
                }
            ],
            menus: {
                addresses: {acceptReporters: true, items: ['0x76', '0x77']}
            }
        };
    }

    temperature () {
        return this.readValue(0);
    }
    humidity () {
        return this.readValue(1);
    }
    pressure () {
        return this.readValue(2);
    }
}

module.exports = Scratch3BME280Blocks;

const {getTransport} = require('./transport');

// Scratch inputs may be decimal numbers or 0x-prefixed address strings.
const parseAddress = value => {
    const text = String(value).trim();
    if (!/^(?:0x[0-9a-f]+|[0-9]+)$/i.test(text)) return null;
    const address = Number(text);
    return Number.isInteger(address) && address >= 0x08 && address <= 0x77 ? address : null;
};

/** Shared request and error handling for the BME280 and INA219 categories. */
class I2CSensor {
    constructor (runtime, sensor, count) {
        this.transport = getTransport(runtime);
        this.sensor = sensor;
        this.count = count;
        this.statusValue = '';
        this.transport.addListener(line => {
            if (line === 'SYS:DISCONNECTED') this.statusValue = '';
        });
    }

    async init (args) {
        const address = parseAddress(args.ADDRESS);
        if (address === null) {
            this.statusValue = 'INVALID_ADDRESS';
            return;
        }
        await this.exchange(`${this.sensor}:INIT:0x${address.toString(16)}`);
    }

    async exchange (command) {
        this.statusValue = '';
        try {
            const line = await this.transport.request(command, value =>
                value.startsWith(`${this.sensor}:DATA:`) || value.startsWith(`${this.sensor}:STATUS:`));
            if (line.startsWith(`${this.sensor}:STATUS:`)) {
                this.statusValue = line.split(':').slice(2)
                    .join(':');
                return null;
            }
            const fields = line.split(':').slice(2);
            const values = fields.map(Number);
            if (fields.length !== this.count || fields.some(value => !value.trim()) ||
                !values.every(Number.isFinite)) {
                this.statusValue = 'READ_ERROR';
                return null;
            }
            this.statusValue = 'OK';
            return values;
        } catch (error) {
            this.statusValue = error.message;
            return null;
        }
    }

    async readValue (index) {
        const values = await this.exchange(`${this.sensor}:READ`);
        // An empty reporter distinguishes unavailable readings from a measured zero.
        return values ? values[index] : '';
    }

    status () {
        return this.statusValue;
    }
}

module.exports = {parseAddress, I2CSensor};

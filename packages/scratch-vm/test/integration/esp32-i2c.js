const test = require('tap').test;
const {getTransport} = require('../../src/extensions/esp32education_shared/transport');
const {parseAddress} = require('../../src/extensions/esp32education_shared/i2c');
const Scanner = require('../../src/extensions/scratch3_esp32edui2c');
const BME280 = require('../../src/extensions/scratch3_esp32edubme280');
const INA219 = require('../../src/extensions/scratch3_esp32eduina219');

test('I2C inputs accept complete decimal/hex addresses and reject malformed/reserved inputs', t => {
    for (const [input, expected] of [['0x40', 64], ['0X76', 118], ['64', 64], [119, 119],
        ['0x40junk', null], ['', null], ['8.5', null], ['0x78', null], ['0x07', null], ['Infinity', null]]) {
        t.equal(parseAddress(input), expected);
    }
    t.end();
});

test('scanner waits for replies, handles empty/error results and clears addresses on disconnect', async t => {
    const runtime = {};
    const scanner = new Scanner(runtime);
    const transport = getTransport(runtime);
    let reply = 'I2C:SCAN:0x3C,0x40,0x76';
    transport.sendLine = async command => {
        t.equal(command, 'I2C:SCAN');
        setTimeout(() => transport.notify(reply), 25);
    };
    await scanner.scan();
    t.equal(scanner.result(), '0x3C,0x40,0x76');
    t.ok(scanner.found({ADDRESS: '64'}));
    t.ok(scanner.found({ADDRESS: '0X76'}));
    t.notOk(scanner.found({ADDRESS: '0x77'}));
    t.notOk(scanner.found({ADDRESS: '0x40junk'}));
    for (const response of ['I2C:SCAN:', 'I2C:ERROR:SCAN_FAILED', 'I2C:SCAN:garbage', 'SYS:UNKNOWN:I2C:SCAN']) {
        reply = response;
        await scanner.scan();
        t.notOk(scanner.found({ADDRESS: '0x40'}));
    }
    reply = 'I2C:SCAN:0x40';
    await scanner.scan();
    let responseIndex = 0;
    transport.sendLine = async () => {
        const line = responseIndex++ === 0 ? 'I2C:SCAN:0x40' : 'I2C:ERROR:SCAN_FAILED';
        setTimeout(() => transport.notify(line), 10);
    };
    await Promise.all([scanner.scan(), scanner.scan()]);
    t.equal(scanner.result(), 'SCAN_FAILED');
    t.notOk(scanner.found({ADDRESS: '0x40'}));
    await transport.cleanupConnection();
    t.equal(scanner.result(), '');
    t.notOk(scanner.found({ADDRESS: '0x40'}));
});

for (const [Sensor, prefix, data, values] of [
    [BME280, 'BME280', '23.50:61.25:1008.75', [23.5, 61.25, 1008.75]],
    [INA219, 'INA219', '3.300:-12.500:41.250:-1.250', [3.3, -12.5, 41.25, -1.25]]
]) {
    test(`${prefix} initializes selected address and never returns stale values on errors`, async t => {
        const sensor = new Sensor({});
        let reply = `${prefix}:STATUS:READY`;
        const commands = [];
        sensor.transport.sendLine = async command => {
            commands.push(command);
            setTimeout(() => sensor.transport.notify(reply), 10);
        };
        const address = prefix === 'BME280' ? '0x77' : '0x44';
        await sensor.init({ADDRESS: address});
        t.equal(commands[0], `${prefix}:INIT:${address}`);
        t.equal(sensor.status(), 'READY');
        reply = `${prefix}:DATA:${data}`;
        const opcodes = sensor.getInfo().blocks.filter(block =>
            block.blockType === 'reporter' && block.opcode !== 'status').map(block => block.opcode);
        t.same(await Promise.all(opcodes.map(opcode => sensor[opcode]())), values);
        for (const line of [`${prefix}:STATUS:READ_ERROR`, `${prefix}:STATUS:NOT_INITIALIZED`,
            `${prefix}:DATA:NaN:2:3`, `${prefix}:DATA::2:3`, `SYS:UNKNOWN:${prefix}:READ`]) {
            reply = line;
            t.equal(await sensor[opcodes[0]](), '');
            t.not(sensor.status(), 'OK');
        }
        await sensor.transport.cleanupConnection();
        t.equal(sensor.status(), '');
        const count = commands.length;
        await sensor.init({ADDRESS: '0x40junk'});
        t.equal(commands.length, count);
        t.equal(sensor.status(), 'INVALID_ADDRESS');
    });
}

test('BME280 rejects finite out-of-range readings but accepts 100 percent humidity', async t => {
    const sensor = new BME280({});
    let reply;
    sensor.transport.sendLine = async () => {
        setTimeout(() => sensor.transport.notify(reply), 1);
    };
    for (const data of ['180.25:100:-132.03', '180.25:50:1013.25', '23.5:100:-132.03',
        '-40.01:50:1013.25', '85.01:50:1013.25', '23.5:-0.01:1013.25', '23.5:100.01:1013.25',
        '23.5:50:299.99', '23.5:50:1100.01']) {
        reply = `BME280:DATA:${data}`;
        t.equal(await sensor.temperature(), '', data);
        t.equal(sensor.status(), 'READ_ERROR', data);
    }
    for (const data of ['-40:0:300', '85:100:1100', '23.5:100:1013.25']) {
        reply = `BME280:DATA:${data}`;
        t.equal(await sensor.humidity(), Number(data.split(':')[1]), data);
        t.equal(sensor.status(), 'OK', data);
    }
});

test('request queue serializes concurrent scripts, removes timed-out listeners and survives disconnect', async t => {
    const transport = getTransport({});
    const commands = [];
    transport.sendLine = async command => {
        commands.push(command);
        if (command !== 'NO_REPLY') setTimeout(() => transport.notify(`${command}:OK`), 15);
    };
    t.same(await Promise.all(['FIRST', 'SECOND'].map(command =>
        transport.request(command, line => line === `${command}:OK`))), ['FIRST:OK', 'SECOND:OK']);
    t.same(commands, ['FIRST', 'SECOND']);
    const listeners = transport.listeners.size;
    await t.rejects(transport.request('NO_REPLY', () => false, 20), /TIMEOUT/);
    t.equal(transport.listeners.size, listeners);
    const pending = transport.request('NO_REPLY', () => false);
    setTimeout(() => transport.cleanupConnection(), 10);
    await t.rejects(pending, /DISCONNECTED/);
    t.equal(transport.listeners.size, listeners);
    t.equal(await transport.request('AFTER', line => line === 'AFTER:OK'), 'AFTER:OK');
});

test('transport parses fragmented version replies and clears identity after disconnect', async t => {
    const transport = getTransport({});
    let index = 0;
    const chunks = ['SYS:VER', 'SION:1.0.0\r\nSYS:READY:OK\n'];
    transport.port = {readable: {getReader: () => ({
        read: async () => index < chunks.length ?
            {value: new TextEncoder().encode(chunks[index++]), done: false} : {done: true},
        releaseLock: () => {}
    })}};
    transport.keepReading = true;
    await transport.readLoop();
    t.equal(transport.firmwareVersion, '1.0.0');
    t.equal(transport.ready, 'OK');
    const commands = [];
    transport.sendLine = async command => commands.push(command);
    await transport.refreshStatus();
    t.same(commands, ['SYS:STATUS', 'SYS:VERSION']);
    await transport.cleanupConnection();
    t.equal(transport.firmwareVersion, '');
});

test('connecting requests version automatically without waiting for old Firmware to support it', async t => {
    const descriptor = Object.getOwnPropertyDescriptor(global, 'navigator');
    const commands = [];
    const port = {
        open: async options => t.equal(options.baudRate, 115200),
        writable: {getWriter: () => ({
            write: async bytes => commands.push(new TextDecoder().decode(bytes)
                .trim()),
            releaseLock: () => {}
        })},
        close: async () => {}
    };
    Object.defineProperty(global, 'navigator', {
        configurable: true,
        value: {serial: {requestPort: async () => port, addEventListener: () => {}}}
    });
    t.teardown(() => {
        if (descriptor) Object.defineProperty(global, 'navigator', descriptor);
        else delete global.navigator;
    });
    const transport = getTransport({});
    await transport.connect();
    t.ok(transport.connected);
    t.same(commands, ['SYS:STATUS', 'SYS:VERSION']);
    t.equal(transport.firmwareVersion, '');
    await transport.disconnect();
});

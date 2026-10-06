const test = require('tap').test;
const VirtualMachine = require('../../src/virtual-machine');

test('ESP32 warning level stays defined but is hidden from the palette', async t => {
    const vm = new VirtualMachine();
    t.teardown(() => vm.quit());
    vm.extensionManager.loadExtensionIdSync('esp32eduenvironment');

    const checkPalette = () => {
        const category = vm.runtime.getBlocksXML().find(item => item.id === 'esp32eduenvironment');
        t.notMatch(category.xml, 'type="esp32eduenvironment_level"');
        t.match(category.xml, 'type="esp32eduenvironment_index"');
        t.ok(vm.runtime.getBlocksJSON().some(block => block.type === 'esp32eduenvironment_level'));
    };

    checkPalette();
    await vm.extensionManager.refreshBlocks();
    checkPalette();
});

test('saved ESP32 warning level blocks retain their opcode, input and return values', async t => {
    const vm = new VirtualMachine();
    t.teardown(() => vm.quit());
    const project = {
        targets: [{
            isStage: true,
            name: 'Stage',
            variables: {},
            lists: {},
            broadcasts: {},
            blocks: {
                legacyLevel: {
                    opcode: 'esp32eduenvironment_level',
                    next: null,
                    parent: null,
                    inputs: {WBGT: [1, [4, '25']]},
                    fields: {},
                    shadow: false,
                    topLevel: true,
                    x: 0,
                    y: 0
                }
            },
            comments: {},
            currentCostume: 0,
            costumes: [{
                assetId: 'cd21514d0531fdffb22204e0ec5ed84a',
                name: 'backdrop1',
                dataFormat: 'svg'
            }],
            sounds: [],
            volume: 100
        }],
        monitors: [],
        extensions: ['esp32eduenvironment'],
        meta: {semver: '3.0.0'}
    };

    await vm.loadProject(JSON.stringify(project));
    const savedBlock = JSON.parse(vm.toJSON()).targets[0].blocks.legacyLevel;
    t.equal(savedBlock.opcode, 'esp32eduenvironment_level');
    t.same(savedBlock.inputs, project.targets[0].blocks.legacyLevel.inputs);

    const level = vm.runtime.getOpcodeFunction('esp32eduenvironment_level');
    t.type(level, 'function');
    for (const [wbgt, expected] of [
        [20.9, 'ほぼ安全'], [21, '注意'], [24.9, '注意'], [25, '警戒'],
        [27.9, '警戒'], [28, '厳重警戒'], [30.9, '厳重警戒'], [31, '危険']
    ]) {
        t.equal(level({WBGT: wbgt}), expected);
    }
});

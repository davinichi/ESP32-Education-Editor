const test = require('tap').test;
const formatMessage = require('format-message');
const VirtualMachine = require('../../src/virtual-machine');
const fixture = require('../fixtures/esp32-i18n.json');

const makeVM = t => {
    const settings = formatMessage.setup();
    formatMessage.setup({locale: 'en', translations: {}, missingTranslation: 'ignore'});
    const vm = new VirtualMachine();
    t.teardown(() => {
        vm.quit();
        formatMessage.setup(settings);
    });
    return vm;
};

test('ESP32 labels follow ja -> en -> ja without changing extension metadata', async t => {
    const vm = makeVM(t);
    for (const id of Object.keys(fixture.specs)) vm.extensionManager.loadExtensionIdSync(id);

    for (const locale of ['ja', 'en', 'ja']) {
        await vm.setLocale(locale, locale === 'ja' ? {...fixture.japanese} : {});
        const definitions = vm.runtime.getBlocksJSON();
        for (const [id, original] of Object.entries(fixture.baseline)) {
            const Extension = require(`../../src/extensions/scratch3_${id}`);
            const info = new Extension(vm.runtime).getInfo();
            const spec = fixture.specs[id];
            t.equal(info.id, original.id);
            t.equal(info.name, locale === 'ja' ? original.name : spec.name);
            const palette = vm.runtime.getBlocksXML().find(category => category.id === id).xml;
            t.match(palette, `name="${info.name}"`);

            info.blocks.forEach((block, index) => {
                if (typeof block === 'string') {
                    t.equal(block, original.blocks[index]);
                    return;
                }
                const baseline = original.blocks[index];
                const expected = locale === 'ja' || block.hideFromPalette ? baseline.text : spec.blocks[block.opcode];
                t.equal(block.text, expected);
                t.same(Object.assign({}, block, {text: baseline.text}), baseline);
                const definition = definitions.find(item => item && item.type === `${id}_${block.opcode}`);
                let argumentIndex = 0;
                t.equal(definition.message0, expected.replace(/\[[A-Z]+\]/g, () => `%${++argumentIndex}`));
            });

            for (const [name, menu] of Object.entries(info.menus || {})) {
                const baselineItems = original.menus[name].items;
                menu.items.forEach((item, index) => {
                    const baseline = baselineItems[index];
                    if (typeof item === 'string') {
                        t.equal(item, baseline);
                    } else {
                        t.equal(item.value, baseline.value);
                        t.equal(item.text, locale === 'ja' ? baseline.text : spec.menus[item.value]);
                    }
                });
            }
        }
        const environment = vm.runtime.getBlocksXML().find(category => category.id === 'esp32eduenvironment');
        t.notMatch(environment.xml, 'type="esp32eduenvironment_level"');
    }
    const japanese = require('../../../scratch-gui/src/lib/esp32-messages/ja.json');
    const extensionMessages = Object.fromEntries(Object.entries(japanese).filter(([id]) =>
        id.startsWith('esp32') || id.startsWith('gui.extension.esp32')
    ));
    t.same(extensionMessages, fixture.japanese);
});

const makeProject = () => {
    const blocks = {};
    for (const [id, info] of Object.entries(fixture.baseline)) {
        for (const block of info.blocks.filter(item => typeof item === 'object')) {
            const opcode = `${id}_${block.opcode}`;
            const inputs = {};
            const fields = {};
            for (const [name, argument] of Object.entries(block.arguments || {})) {
                if (argument.menu) {
                    const shadowId = opcode + '_' + name;
                    inputs[name] = [1, shadowId];
                    blocks[shadowId] = {
                        opcode: id + '_menu_' + argument.menu,
                        inputs: {},
                        fields: {[argument.menu]: [argument.defaultValue, null]},
                        next: null,
                        parent: opcode,
                        shadow: true,
                        topLevel: false
                    };
                } else {
                    inputs[name] = [1, [argument.type === 'number' ? 4 : 10, String(argument.defaultValue)]];
                }
            }
            blocks[opcode] = {
                opcode, inputs, fields, next: null, parent: null, shadow: false, topLevel: true, x: 0, y: 0
            };
        }
    }
    return {
        targets: [{
            isStage: true,
            name: 'Stage',
            variables: {},
            lists: {},
            broadcasts: {},
            blocks,
            costumes: [{assetId: 'cd21514d0531fdffb22204e0ec5ed84a', name: 'backdrop1', dataFormat: 'svg'}],
            sounds: [],
            currentCostume: 0,
            volume: 100
        }],
        monitors: [],
        extensions: Object.keys(fixture.specs),
        meta: {semver: '3.0.0'}
    };
};

for (const [sourceLocale, destinationLocale] of [['ja', 'en'], ['en', 'ja']]) {
    test(`ESP32 project created in ${sourceLocale} loads in ${destinationLocale}`, async t => {
        const vm = makeVM(t);
        await vm.setLocale(sourceLocale, sourceLocale === 'ja' ? {...fixture.japanese} : {});
        const project = makeProject();
        await vm.loadProject(JSON.stringify(project));
        const saved = JSON.parse(vm.toJSON());
        t.same(saved.targets[0].blocks, project.targets[0].blocks);
        await vm.setLocale(destinationLocale, destinationLocale === 'ja' ? {...fixture.japanese} : {});
        await vm.loadProject(JSON.stringify(saved));
        const reloaded = JSON.parse(vm.toJSON());
        t.same(reloaded.targets[0].blocks, saved.targets[0].blocks);
        t.same(reloaded.extensions.sort(), saved.extensions.sort());
        const level = vm.runtime.getOpcodeFunction('esp32eduenvironment_level');
        t.equal(level({WBGT: 31}), '危険');
        t.equal(level({WBGT: 28}), '厳重警戒');
        t.equal(level({WBGT: 25}), '警戒');
        t.equal(level({WBGT: 21}), '注意');
        t.equal(level({WBGT: 20}), 'ほぼ安全');
        const palette = vm.runtime.getBlocksXML().find(category => category.id === 'esp32eduenvironment').xml;
        t.notMatch(palette, 'type="esp32eduenvironment_level"');
    });
}

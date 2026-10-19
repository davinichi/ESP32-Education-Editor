const path = require('path');
const {ESLint} = require('eslint');
const tap = require('tap');

// Loading ESLint and its plugins under coverage is slower than VM unit tests.
tap.setTimeout(120000);

tap.test('message lint accepts modern syntax and still rejects invalid messages', async t => {
    const eslint = new ESLint({cwd: path.resolve(__dirname, '../..')});
    const lint = async source => {
        const [result] = await eslint.lintText(source, {filePath: 'src/message-lint-check.js'});
        return result.messages.filter(message => message.severity === 2);
    };
    const prefix = "const formatMessage = require('format-message');\n";
    t.same(await lint(`${prefix}const value = {}?.name ?? 'World';\n` +
        "formatMessage('Hello {name}', {name: value});\n"), []);
    const invalid = await lint(`${prefix}formatMessage('Hello {');\n`);
    t.ok(invalid.some(message => message.ruleId === 'format-message/no-invalid-pattern'));
    const missing = await lint(`${prefix}formatMessage('Hello {name}');\n`);
    t.ok(missing.some(message => message.ruleId === 'format-message/no-missing-params'));
});

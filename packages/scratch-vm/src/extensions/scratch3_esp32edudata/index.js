/** Scratch ESP32 Education v0.4 development - データ処理 */
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');

/** CSV分解と文字列処理を行う拡張です。ESP32接続は不要です。 */
class Scratch3ESP32DataBlocks {
    /** CSV処理結果を初期化します。 */
    constructor () {
        // 最後に分解したCSV項目の配列です。
        this.csv = [];
        // 最後のCSV分解が成功したかを保持します。
        this.ok = false;
    }

    /** Scratchへカテゴリー・色・ブロックを通知します。 */
    getInfo () {
        return {
            id: 'esp32edudata',
            name: formatMessage({id: 'esp32edudata.name', default: 'データ処理', description: 'ESP32 education data processing extension name'}),
            color1: '#FF8C1A',
            color2: '#D96F00',
            color3: '#B45B00',
            blocks: [
                {opcode: 'splitCsv', blockType: BlockType.COMMAND, text: 'CSVデータ [CSV] を分ける', arguments: {CSV: {type: ArgumentType.STRING, defaultValue: '25.6,60,28.3'}}},
                {opcode: 'csvText', blockType: BlockType.REPORTER, text: 'CSVの [INDEX] 番目の文字', arguments: {INDEX: {type: ArgumentType.NUMBER, defaultValue: 1}}},
                {opcode: 'csvNumber', blockType: BlockType.REPORTER, text: 'CSVの [INDEX] 番目の数値', arguments: {INDEX: {type: ArgumentType.NUMBER, defaultValue: 1}}},
                {opcode: 'csvCount', blockType: BlockType.REPORTER, text: 'CSVの項目数'},
                {opcode: 'csvSucceeded', blockType: BlockType.BOOLEAN, text: 'CSVの分解は成功した？'},
                '---',
                {opcode: 'formatFixed', blockType: BlockType.REPORTER, text: '\u6570\u5024 [VALUE] \u3092\u5c0f\u6570\u70b9\u4ee5\u4e0b [DIGITS] \u6841\u3067\u8868\u793a', arguments: {VALUE: {type: ArgumentType.NUMBER, defaultValue: 25.376}, DIGITS: {type: ArgumentType.NUMBER, defaultValue: 2}}},
                '---',
                {opcode: 'left', blockType: BlockType.REPORTER, text: '文字列 [TEXT] の左から [COUNT] 文字を取り出す', arguments: {TEXT: {type: ArgumentType.STRING, defaultValue: 'ABC富山県'}, COUNT: {type: ArgumentType.NUMBER, defaultValue: 3}}},
                {opcode: 'right', blockType: BlockType.REPORTER, text: '文字列 [TEXT] の右から [COUNT] 文字を取り出す', arguments: {TEXT: {type: ArgumentType.STRING, defaultValue: 'ABC富山県'}, COUNT: {type: ArgumentType.NUMBER, defaultValue: 3}}},
                {opcode: 'length', blockType: BlockType.REPORTER, text: '文字列 [TEXT] の文字数', arguments: {TEXT: {type: ArgumentType.STRING, defaultValue: 'ABC富山県'}}},
                {opcode: 'fromPosition', blockType: BlockType.REPORTER, text: '文字列 [TEXT] の左から [START] 文字目以降を取り出す', arguments: {TEXT: {type: ArgumentType.STRING, defaultValue: '2026/08/01'}, START: {type: ArgumentType.NUMBER, defaultValue: 6}}},
                {opcode: 'substring', blockType: BlockType.REPORTER, text: '文字列 [TEXT] の左から [START] 文字目から [COUNT] 文字を取り出す', arguments: {TEXT: {type: ArgumentType.STRING, defaultValue: 'ABCDEFG'}, START: {type: ArgumentType.NUMBER, defaultValue: 3}, COUNT: {type: ArgumentType.NUMBER, defaultValue: 2}}},
                {opcode: 'joinWith', blockType: BlockType.REPORTER, text: '文字列 [A] と [B] を [SEP] でつなぐ', arguments: {A: {type: ArgumentType.STRING, defaultValue: '25.6'}, B: {type: ArgumentType.STRING, defaultValue: '60'}, SEP: {type: ArgumentType.STRING, defaultValue: ','}}}
            ]
        };
    }

    /** 引用符を考慮して1行のCSV文字列を分解します。 */
    parseCSV (text) {
        const input = String(text); const result = [];
        let current = ''; let inQuotes = false;
        for (let i = 0; i < input.length; i++) {
            const ch = input[i];
            if (ch === '"') {
                if (inQuotes && input[i + 1] === '"') { current += '"'; i++; } else inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                result.push(current); current = '';
            } else current += ch;
        }
        if (inQuotes) return {success: false, values: []};
        result.push(current);
        return {success: true, values: result};
    }
    /** CSVを分解して結果を保存します。 */
    splitCsv (args) { const parsed = this.parseCSV(args.CSV); this.ok = parsed.success; this.csv = parsed.values; }
    /** 指定した1始まりのCSV項目を文字列で返します。 */
    csvText (args) { const i = Math.max(1, Math.floor(Number(args.INDEX))) - 1; return i < this.csv.length ? this.csv[i] : ''; }
    /** 指定CSV項目を数値へ変換して返します。 */
    csvNumber (args) { const n = Number(this.csvText(args)); return Number.isFinite(n) ? n : 0; }
    /** CSV項目数を返します。 */
    csvCount () { return this.csv.length; }
    /** 最後のCSV分解が成功したかを返します。 */
    csvSucceeded () { return this.ok; }
    /** Convert a number to a display string with a fixed number of decimal places. */
    formatFixed (args) {
        const value = Number(args.VALUE);
        if (!Number.isFinite(value)) return '';
        const requestedDigits = Number(args.DIGITS);
        const digits = Number.isFinite(requestedDigits) ?
            Math.max(0, Math.min(10, Math.floor(requestedDigits))) : 0;
        return value.toFixed(digits);
    }
    /** 左から指定文字数を取り出します。 */
    left (args) { const c = Math.max(0, Math.floor(Number(args.COUNT))); return Array.from(String(args.TEXT)).slice(0, c).join(''); }
    /** 右から指定文字数を取り出します。 */
    right (args) { const c = Math.max(0, Math.floor(Number(args.COUNT))); return c === 0 ? '' : Array.from(String(args.TEXT)).slice(-c).join(''); }
    /** Unicodeコードポイント単位の文字数を返します。 */
    length (args) { return Array.from(String(args.TEXT)).length; }
    /** 左から1始まりの指定位置以降を返します。 */
    fromPosition (args) { const s = Math.max(1, Math.floor(Number(args.START))) - 1; return Array.from(String(args.TEXT)).slice(s).join(''); }
    /** 左から1始まりの指定位置から指定文字数を返します。 */
    substring (args) { const s = Math.max(1, Math.floor(Number(args.START))) - 1; const c = Math.max(0, Math.floor(Number(args.COUNT))); return Array.from(String(args.TEXT)).slice(s, s + c).join(''); }
    /** 2つの値を指定区切り文字で連結します。 */
    joinWith (args) { return `${String(args.A)}${String(args.SEP)}${String(args.B)}`; }
}

module.exports = Scratch3ESP32DataBlocks;

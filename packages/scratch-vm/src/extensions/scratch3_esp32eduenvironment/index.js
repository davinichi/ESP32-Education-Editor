/** Scratch ESP32 Education v0.2 - 環境指数 */
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');

/** 温度と湿度から10種類の環境指数を計算する拡張です。ESP32接続は不要です。 */
class Scratch3ESP32EnvironmentBlocks {
    /** Scratchへカテゴリー・色・ブロック・メニューを通知します。 */
    getInfo () {
        return {
            id: 'esp32eduenvironment',
            name: formatMessage({
                id: 'esp32eduenvironment.name',
                default: 'ESP32 Environmental Indices',
                description: 'ESP32 environment index extension name'
            }),
            color1: '#2EAF7D',
            color2: '#23875F',
            color3: '#1A684A',
            blocks: [
                {
                    opcode: 'index',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'esp32eduenvironment.index',
                        default: 'calculate [INDEX] from temperature [TEMP] °C and humidity [HUM] %',
                        description: 'ESP32 Environmental Indices block'
                    }),
                    arguments: {
                        TEMP: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 25
                        },
                        HUM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 60
                        },
                        INDEX: {
                            type: ArgumentType.STRING,
                            menu: 'indices',
                            defaultValue: 'WBGT'
                        }
                    }
                },
                {
                    opcode: 'level',
                    blockType: BlockType.REPORTER,
                    text: 'WBGT [WBGT] の警戒レベル',
                    hideFromPalette: true,
                    arguments: {
                        WBGT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 25
                        }
                    }
                }
            ],
            menus: {
                indices: {
                    acceptReporters: false,
                    items: [
                        {
                            text: formatMessage({
                                id: 'esp32eduenvironment.menu.DI',
                                default: 'Discomfort Index (DI)',
                                description: 'ESP32 Environmental Indices menu item'
                            }),
                            value: 'DI'
                        },
                        {
                            text: formatMessage({
                                id: 'esp32eduenvironment.menu.HEAT_INDEX',
                                default: 'Heat Index',
                                description: 'ESP32 Environmental Indices menu item'
                            }),
                            value: 'HEAT_INDEX'
                        },
                        {
                            text: formatMessage({
                                id: 'esp32eduenvironment.menu.HUMIDEX',
                                default: 'Humidex',
                                description: 'ESP32 Environmental Indices menu item'
                            }),
                            value: 'HUMIDEX'
                        },
                        {
                            text: formatMessage({
                                id: 'esp32eduenvironment.menu.DEW_POINT',
                                default: 'Dew Point (Td)',
                                description: 'ESP32 Environmental Indices menu item'
                            }),
                            value: 'DEW_POINT'
                        },
                        {
                            text: formatMessage({
                                id: 'esp32eduenvironment.menu.ABS_HUM',
                                default: 'Absolute Humidity (AH)',
                                description: 'ESP32 Environmental Indices menu item'
                            }),
                            value: 'ABS_HUM'
                        },
                        {
                            text: formatMessage({
                                id: 'esp32eduenvironment.menu.WET_BULB',
                                default: 'Wet-Bulb Temperature (Tw)',
                                description: 'ESP32 Environmental Indices menu item'
                            }),
                            value: 'WET_BULB'
                        },
                        {
                            text: formatMessage({
                                id: 'esp32eduenvironment.menu.VPD',
                                default: 'Vapor Pressure Deficit (VPD)',
                                description: 'ESP32 Environmental Indices menu item'
                            }),
                            value: 'VPD'
                        },
                        {
                            text: formatMessage({
                                id: 'esp32eduenvironment.menu.VP',
                                default: 'Vapor Pressure (VP)',
                                description: 'ESP32 Environmental Indices menu item'
                            }),
                            value: 'VP'
                        },
                        {
                            text: formatMessage({
                                id: 'esp32eduenvironment.menu.THI',
                                default: 'Temperature-Humidity Index (THI)',
                                description: 'ESP32 Environmental Indices menu item'
                            }),
                            value: 'THI'
                        },
                        {
                            text: formatMessage({
                                id: 'esp32eduenvironment.menu.WBGT',
                                default: 'Estimated WBGT (simplified)',
                                description: 'ESP32 Environmental Indices menu item'
                            }),
                            value: 'WBGT'
                        }
                    ]
                }
            }
        };
    }

    /** 相対湿度を0～100%に制限します。 */
    clamp (h) { return Math.max(0, Math.min(100, Number(h))); }
    /** 飽和水蒸気圧（hPa）を近似計算します。 */
    svp (t) { return 6.112 * Math.exp((17.67 * t) / (t + 243.5)); }
    /** 不快指数DIを計算します。 */
    di (t, h) { h = this.clamp(h); return 0.81 * t + 0.01 * h * (0.99 * t - 14.3) + 46.3; }
    /** 露点温度（℃）を近似計算します。 */
    dp (t, h) {
        h = this.clamp(h); if (h < 0.1) h = 0.1;
        const g = Math.log(h / 100) + (17.67 * t) / (243.5 + t);
        return (243.5 * g) / (17.67 - g);
    }
    /** 湿球温度（℃）を近似計算します。 */
    wb (t, h) {
        h = this.clamp(h);
        return t * Math.atan(0.151977 * Math.sqrt(h + 8.313659)) + Math.atan(t + h) - Math.atan(h - 1.676331) + 0.00391838 * Math.pow(h, 1.5) * Math.atan(0.023101 * h) - 4.686035;
    }
    /** 簡易推定WBGT（℃）を計算します。 */
    wbgt (t, h) { const w = this.wb(t, h); return 0.7 * w + 0.3 * t; }
    /** 絶対湿度（g/m3）を計算します。 */
    ah (t, h) { h = this.clamp(h); const e = this.svp(t) * (h / 100); return (216.7 * e) / (t + 273.15); }
    /** 水蒸気圧（kPa）を計算します。 */
    vp (t, h) { h = this.clamp(h); return (this.svp(t) * (h / 100)) / 10; }
    /** VPD（kPa）を計算します。 */
    vpd (t, h) { h = this.clamp(h); return (this.svp(t) / 10) * (1 - h / 100); }
    /** Humidexを計算します。 */
    humidex (t, h) { const d = this.dp(t, h); const k = d + 273.15; const e = 6.11 * Math.exp(5417.753 * (1 / 273.15 - 1 / k)); return t + 0.5555 * (e - 10); }
    /** Heat Index（℃）を計算します。 */
    hi (t, h) {
        h = this.clamp(h); const f = t * 9 / 5 + 32;
        let hi = 0.5 * (f + 61 + (f - 68) * 1.2 + h * 0.094); hi = (hi + f) * 0.5;
        if (hi >= 80) {
            const f2 = f * f; const h2 = h * h;
            hi = -42.379 + 2.04901523 * f + 10.14333127 * h - 0.22475541 * f * h - 0.00683783 * f2 - 0.05481717 * h2 + 0.00122874 * f2 * h + 0.00085282 * f * h2 - 0.00000199 * f2 * h2;
        }
        return (hi - 32) * 5 / 9;
    }
    /** THIを計算します。 */
    thi (t, h) { return t + 0.36 * this.dp(t, h) + 41.2; }
    /** 選択された環境指数を計算して返します。 */
    index (args) {
        const t = Number(args.TEMP); const h = Number(args.HUM);
        switch (String(args.INDEX)) {
        case 'DI': return this.di(t, h);
        case 'HEAT_INDEX': return this.hi(t, h);
        case 'HUMIDEX': return this.humidex(t, h);
        case 'DEW_POINT': return this.dp(t, h);
        case 'ABS_HUM': return this.ah(t, h);
        case 'WET_BULB': return this.wb(t, h);
        case 'VPD': return this.vpd(t, h);
        case 'VP': return this.vp(t, h);
        case 'THI': return this.thi(t, h);
        default: return this.wbgt(t, h);
        }
    }
    /** WBGT値から現行7JS版と同じ日本語警戒レベルを返します。 */
    level (args) {
        const w = Number(args.WBGT);
        if (w >= 31) return '危険';
        if (w >= 28) return '厳重警戒';
        if (w >= 25) return '警戒';
        if (w >= 21) return '注意';
        return 'ほぼ安全';
    }
}

module.exports = Scratch3ESP32EnvironmentBlocks;

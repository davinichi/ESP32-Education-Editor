# ESP32 Education Editor

**ESP32 Education Editor** 縺ｯ縲・SP32繧剃ｽｿ縺｣縺溘・繝ｭ繧ｰ繝ｩ繝溘Φ繧ｰ繝ｻ髮ｻ蟄仙ｷ･菴懈蕗閧ｲ縺ｮ縺溘ａ縺ｮWeb繧ｨ繝・ぅ繧ｿ縺ｧ縺吶・
- Brand: **Davinichi**
- ESP32 Education additions: **Copyright (c) 2026 Toshikazu Shimada**
- Base project: **Scratch Editor** (Scratch Foundation)
- Current preview: **v0.4 / USB disconnect safety + fixed-decimal data formatting**
- Web: **https://davinichi.github.io/**

> This project is based on the open-source Scratch Editor. It is not affiliated with, sponsored by, or endorsed by the Scratch Foundation.

## v0.4

v0.4では、学校や実習環境での使いやすさを高めるため、次の2点を改善しました。

### USBケーブル切断時の安全な処理

ESP32との通信中にUSBケーブルが抜かれた場合、Web Serialの接続状態を安全に未接続へ戻します。

- USB切断を検出
- 読み取り・書き込みに使っていた接続情報を整理
- `ESP32は接続中？` を未接続状態へ更新
- USBを挿し直しても自動再接続しない
- 利用者がもう一度「ESP32に接続する」を実行して再接続

教育用途では、接続と切断を利用者自身が意識できることを重視し、自動再接続は行わない設計としています。

### データ処理：小数点以下の表示桁数指定

データ処理に、数値を指定した小数点以下の桁数で表示するレポーターブロックを追加しました。

```text
数値 25.376 を 小数点以下 2 桁で表示 -> 25.38
数値 25     を 小数点以下 2 桁で表示 -> 25.00
```

結果は表示用文字列として返すため、末尾の `0` も保持できます。OLED表示、ESP-NOW送信文字列、CSVなどで表示形式を揃える用途に利用できます。

v0.4の追加機能は実機で動作確認済みです。

変更履歴：`CHANGELOG_ESP32_EDUCATION_EDITOR.md`

## v0.3.3縺ｮ繝悶Λ繝ｳ繝芽｡ｨ遉ｺ譁ｹ驥・
騾壼ｸｸ蛻ｩ逕ｨ譎ゅ↓陬ｽ蜩√ヶ繝ｩ繝ｳ繝峨→縺励※隕九∴繧狗ｮ・園繧・**ESP32 Education Editor / Davinichi** 縺ｫ謨ｴ逅・＠縺ｾ縺吶・
- 陬ｽ蜩√・繝・ム繝ｼ・哘SP32 Education Editor迢ｬ閾ｪ繝ｯ繝ｼ繝峨・繝ｼ繧ｯ
- 繝悶Λ繧ｦ繧ｶ繧ｿ繧､繝医Ν・哘SP32 Education Editor
- favicon・夂峡閾ｪ繧｢繧､繧ｳ繝ｳ
- 繝倥ャ繝繝ｼ繝ｭ繧ｴ・壹け繝ｪ繝・け縺吶ｋ縺ｨ譛ｬ繝励Ο繧ｸ繧ｧ繧ｯ繝医・About / 繝ｩ繧､繧ｻ繝ｳ繧ｹ隱ｬ譏弱ｒ髢九￥

v0.3.3縺ｧ繧ゅヾcratch Editor縺ｮReact繝｡繝九Η繝ｼ繝舌・譛ｬ菴・(`menu-bar.jsx`) 繧貞､画峩縺励∪縺帙ｓ縲ょｷｦ荳翫Ο繧ｴ縺ｯ蟆ら畑About繝壹・繧ｸ繧呈眠縺励＞繧ｿ繝悶〒髢九″縺ｾ縺吶ゅ∪縺溘：ile繝｡繝九Η繝ｼ縺ｮ荳ｻ隕√↑闍ｱ隱櫁｡ｨ遉ｺ繧呈律譛ｬ隱槭↓陬懈ｭ｣縺励∪縺吶ゅ％繧後ｉ縺ｮ陬懷勧蜃ｦ逅・・繝悶Λ繧ｦ繧ｶ逕ｨ繝・Φ繝励Ξ繝ｼ繝亥・縺ｫ髯仙ｮ壹＠縺ｾ縺吶・
Scratch縺ｮ蜷咲ｧｰ縲√Ο繧ｴ縲ヾcratch Cat遲峨・蝠・ｨ吶・Scratch Foundation縺ｫ蟶ｰ螻槭＠縺ｾ縺吶よ悽繝励Ο繧ｸ繧ｧ繧ｯ繝医〒縺ｯ縲√◎繧後ｉ繧脱SP32 Education Editor縺ｮ陬ｽ蜩√Ο繧ｴ繧Дavinichi縺ｮ繝励Ο繝｢繝ｼ繧ｷ繝ｧ繝ｳ繝悶Λ繝ｳ繝峨→縺励※菴ｿ逕ｨ縺励∪縺帙ｓ縲・
## ESP32蜷代￠7諡｡蠑ｵ

| 諡｡蠑ｵ | 荳ｻ縺ｪ讖溯・ |
|---|---|
| ESP32 謗･邯・| Web Serial謗･邯壹・蛻・妙繝ｻ迥ｶ諷九・MAC繝ｻWi-Fi繝√Ε繝ｳ繝阪Ν |
| ESP32 GPIO | 繝・ず繧ｿ繝ｫ蜈･蜃ｺ蜉・|
| ESP32 DHT | DHT11 / DHT22 貂ｩ蠎ｦ繝ｻ貉ｿ蠎ｦ |
| ESP32 OLED | SSD1306 OLED 陦ｨ遉ｺ繝ｻ蜈ｨ豸亥悉繝ｻ驛ｨ蛻・ｶ亥悉 |
| ESP32 ESP-NOW | MAC謖・ｮ壹・繝悶Ο繝ｼ繝峨く繝｣繧ｹ繝医・騾∝女菫｡ |
| ESP32 迺ｰ蠅・欠謨ｰ | 貂ｩ蠎ｦ繝ｻ貉ｿ蠎ｦ縺九ｉ10遞ｮ鬘槭・迺ｰ蠅・欠謨ｰ繧定ｨ育ｮ・|
| 繝・・繧ｿ蜃ｦ逅・| CSV蛻・ｧ｣繝ｻ譁・ｭ怜・蜃ｦ逅・|

GPIO / DHT / OLED / ESP-NOW 縺ｯ蜀・Κ縺ｧ1縺､縺ｮWeb Serial謗･邯壹ｒ蜈ｱ譛峨＠縺ｾ縺吶・
## v0.2讖溯・遒ｺ隱・
2026-09-25縺ｫ縲；itHub Pages蜈ｬ髢狗沿縺九ｉChrome / Web Serial邨檎罰縺ｧESP32螳滓ｩ溘ｒ謗･邯壹＠縲∽ｸｻ隕・讖溯・繧堤｢ｺ隱阪＠縺ｾ縺励◆縲・
- ESP32 謗･邯・ OK
- GPIO: OK
- DHT: OK
- OLED: OK
- ESP-NOW: OK
- 迺ｰ蠅・欠謨ｰ: OK
- 繝・・繧ｿ蜃ｦ逅・ OK

隧ｳ邏ｰ・啻docs/esp32-education-editor/TEST_RESULTS_V0_2_JA.md`

## 髢狗匱蜈・→闡嶺ｽ懈ｨｩ

ESP32 Education Editor縺ｨ縺励※霑ｽ蜉縺励◆ESP32諡｡蠑ｵ縲∫ｵｱ蜷医さ繝ｼ繝峨√ヵ繧｡繝ｼ繝繧ｦ繧ｧ繧｢縲・未騾｣譁・嶌縺ｯ縲．avinichi繝悶Λ繝ｳ繝峨・繧ゅ→縺ｧToshikazu Shimada縺碁幕逋ｺ縺励※縺・∪縺吶・
**Copyright (c) 2026 Toshikazu Shimada**

縺薙・陦ｨ遉ｺ縺ｯScratch Editor譛ｬ菴薙♀繧医・譌｢蟄倥さ繝ｳ繝昴・繝阪Φ繝亥・菴薙・闡嶺ｽ懈ｨｩ繧堤ｽｮ縺肴鋤縺医ｋ繧ゅ・縺ｧ縺ｯ縺ゅｊ縺ｾ縺帙ｓ縲よ里蟄倬Κ蛻・・闡嶺ｽ懈ｨｩ縺ｯ縺昴ｌ縺槭ｌ縺ｮ讓ｩ蛻ｩ閠・↓蟶ｰ螻槭＠縺ｾ縺吶・
## 繝ｩ繧､繧ｻ繝ｳ繧ｹ縺ｨScratch Foundation縺ｨ縺ｮ髢｢菫・
縺薙・繝ｪ繝昴ず繝医Μ縺ｯScratch Editor繧偵・繝ｼ繧ｹ縺ｫ縺励◆豢ｾ逕溘た繝ｼ繧ｹ繧貞性繧縺溘ａ縲ヾcratch Editor縺ｮ **GNU Affero General Public License v3.0 only (AGPL-3.0-only)** 縺ｮ譚｡莉ｶ繧堤ｶｭ謖√＠縺ｾ縺吶・
荳頑ｵ√・ `LICENSE` 縺ｨ `TRADEMARK` 繧堤ｶｭ謖√＠縲仝eb蜈ｬ髢狗沿縺ｫ蟇ｾ蠢懊☆繧九た繝ｼ繧ｹ繧ｳ繝ｼ繝峨ｒ縺薙・繝ｪ繝昴ず繝医Μ縺ｧ謠蝉ｾ帙＠縺ｾ縺吶・
隧ｳ縺励￥縺ｯ谺｡繧貞盾辣ｧ縺励※縺上□縺輔＞縲・
- `docs/esp32-education-editor/ABOUT_JA.md`
- `docs/esp32-education-editor/BRANDING_AND_LICENSE_JA.md`
- `NOTICE.md`
- `LICENSE`
- `TRADEMARK`

## 繝ｭ繝ｼ繧ｫ繝ｫ髢狗匱

```powershell
cd C:\scratch-editor
npm start
```

繝ｭ繝ｼ繧ｫ繝ｫ髢狗匱逕ｻ髱｢・・
```text
http://localhost:8601/
```

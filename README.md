# ESP32 Education Editor

**ESP32 Education Editor** は、ESP32を使ったプログラミング・電子工作教育のためのWebエディタです。

- Brand: **Davinichi**
- ESP32 Education additions: **Copyright (c) 2026 Toshikazu Shimada**
- Base project: **Scratch Editor** (Scratch Foundation)
- Current preview: **v0.3.3 / About + Japanese File menu update based on verified v0.2 functions**
- Web: **https://davinichi.github.io/**

> This project is based on the open-source Scratch Editor. It is not affiliated with, sponsored by, or endorsed by the Scratch Foundation.

## v0.3.3のブランド表示方針

通常利用時に製品ブランドとして見える箇所を **ESP32 Education Editor / Davinichi** に整理します。

- 製品ヘッダー：ESP32 Education Editor独自ワードマーク
- ブラウザタイトル：ESP32 Education Editor
- favicon：独自アイコン
- ヘッダーロゴ：クリックすると本プロジェクトのAbout / ライセンス説明を開く

v0.3.3でも、Scratch EditorのReactメニューバー本体 (`menu-bar.jsx`) を変更しません。左上ロゴは専用Aboutページを新しいタブで開きます。また、Fileメニューの主要な英語表示を日本語に補正します。これらの補助処理はブラウザ用テンプレート側に限定します。

Scratchの名称、ロゴ、Scratch Cat等の商標はScratch Foundationに帰属します。本プロジェクトでは、それらをESP32 Education Editorの製品ロゴやDavinichiのプロモーションブランドとして使用しません。

## ESP32向け7拡張

| 拡張 | 主な機能 |
|---|---|
| ESP32 接続 | Web Serial接続・切断・状態・MAC・Wi-Fiチャンネル |
| ESP32 GPIO | デジタル入出力 |
| ESP32 DHT | DHT11 / DHT22 温度・湿度 |
| ESP32 OLED | SSD1306 OLED 表示・全消去・部分消去 |
| ESP32 ESP-NOW | MAC指定・ブロードキャスト・送受信 |
| ESP32 環境指数 | 温度・湿度から10種類の環境指数を計算 |
| データ処理 | CSV分解・文字列処理 |

GPIO / DHT / OLED / ESP-NOW は内部で1つのWeb Serial接続を共有します。

## v0.2機能確認

2026-09-25に、GitHub Pages公開版からChrome / Web Serial経由でESP32実機を接続し、主要7機能を確認しました。

- ESP32 接続: OK
- GPIO: OK
- DHT: OK
- OLED: OK
- ESP-NOW: OK
- 環境指数: OK
- データ処理: OK

詳細：`docs/esp32-education-editor/TEST_RESULTS_V0_2_JA.md`

## 開発元と著作権

ESP32 Education Editorとして追加したESP32拡張、統合コード、ファームウェア、関連文書は、DavinichiブランドのもとでToshikazu Shimadaが開発しています。

**Copyright (c) 2026 Toshikazu Shimada**

この表示はScratch Editor本体および既存コンポーネント全体の著作権を置き換えるものではありません。既存部分の著作権はそれぞれの権利者に帰属します。

## ライセンスとScratch Foundationとの関係

このリポジトリはScratch Editorをベースにした派生ソースを含むため、Scratch Editorの **GNU Affero General Public License v3.0 only (AGPL-3.0-only)** の条件を維持します。

上流の `LICENSE` と `TRADEMARK` を維持し、Web公開版に対応するソースコードをこのリポジトリで提供します。

詳しくは次を参照してください。

- `docs/esp32-education-editor/ABOUT_JA.md`
- `docs/esp32-education-editor/BRANDING_AND_LICENSE_JA.md`
- `NOTICE.md`
- `LICENSE`
- `TRADEMARK`

## ローカル開発

```powershell
cd C:\scratch-editor
npm start
```

ローカル開発画面：

```text
http://localhost:8601/
```

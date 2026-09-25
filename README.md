# ESP32 Education Editor

**ESP32 Education Editor** は、ESP32を使ったプログラミング・電子工作教育のためのWebエディタです。

- Brand: **Davinichi**
- ESP32 Education additions: **Copyright (c) 2026 Toshikazu Shimada**
- Base project: **Scratch Editor** (Scratch Foundation)
- Current prototype: **v0.2 / 7 individually selectable extensions**

> This project is based on the open-source Scratch Editor. It is not affiliated with, sponsored by, or endorsed by the Scratch Foundation.

## 特徴

ESP32向け機能を7つの拡張として個別に追加できます。

| 拡張 | 主な機能 |
|---|---|
| ESP32 接続 | Web Serial接続・切断・状態・MAC・Wi-Fiチャンネル |
| ESP32 GPIO | デジタル入出力 |
| ESP32 DHT | DHT11 / DHT22 温度・湿度 |
| ESP32 OLED | SSD1306 OLED 表示・全消去・部分消去 |
| ESP32 ESP-NOW | MAC指定・ブロードキャスト・送受信 |
| ESP32 環境指数 | 温度・湿度から10種類の環境指数を計算 |
| データ処理 | CSV分解・文字列処理 |

GPIO / DHT / OLED / ESP-NOW は、内部で1つのWeb Serial接続を共有します。

## 対象環境

開発・実機確認環境：

- Windows 11
- Chrome
- Node.js 24系
- ESP32-WROOM系
- Web Serial

最終的には、ChromebookからHTTPSのWeb版を開き、USB/Web SerialでESP32へ接続する構成を目標としています。

## ESP32ファームウェア

`firmware/esp32_education_editor_firmware_v0_2.ino` をESP32へ書き込みます。

主なUSBシリアルコマンド：

- `SYS:*`
- `GPIO:*`
- `DHT:*`
- `OLED:*`
- `ESPNOW:*`

## 開発元と著作権

ESP32 Education Editorとして追加したESP32拡張・統合コード・ファームウェア・ドキュメントは、DavinichiブランドのもとでToshikazu Shimadaが開発しています。

**Copyright (c) 2026 Toshikazu Shimada**

Scratch Editor本体および既存コンポーネントの著作権は、それぞれの権利者に帰属します。本プロジェクトの著作権表示は、それら既存部分の権利を置き換えるものではありません。

詳細は `NOTICE.md`、既存の `LICENSE`、`TRADEMARK` を参照してください。

## ライセンス

このリポジトリはScratch Editorをベースにした派生ソースを含むため、Scratch Editorの **GNU Affero General Public License v3.0 only (AGPL-3.0-only)** の条件を維持します。

公開Web版を提供する場合も、その版を生成・変更するための対応するソースコードを利用者が入手できる状態にしてください。

## Scratch Foundationとの関係

Scratchの名称、ロゴ、Scratch Cat等の商標はScratch Foundationに帰属します。

ESP32 Education EditorはScratch Foundationの公式製品ではなく、同財団による承認・推奨・スポンサーを受けたものではありません。

プロジェクト独自のロゴやGitHubのソーシャルプレビューには、ScratchのロゴやScratch Catを使用しない方針です。

## 開発方法

Scratch Editorのソースを取得して依存関係を準備した後、ESP32 Education拡張を組み込んで使用します。

```powershell
cd C:\scratch-editor
npm install
npm run build
npm start
```

ローカル開発画面：

```text
http://localhost:8601/
```

## GitHub公開

公開手順は `docs/GITHUB_PUBLISH_JA.md` を参照してください。

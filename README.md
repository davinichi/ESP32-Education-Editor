# ESP32 Education Editor

日本語 | [English](README_EN.md)

ESP32 Education Editorは、ESP32-WROOM-32をブラウザからブロックで操作するための教育向けプログラミング環境です。ブラウザのWeb Serial APIでUSB接続し、GPIO、センサー、ディスプレイ、ESP-NOWなどを扱えます。

## 現行バージョン

- Editor: **v0.6**
- Firmware: **v0.1.7**
- EditorとFirmwareは別々にバージョン管理しています。
- EditorとFirmware Installerは日本語／英語を切り替えて利用できます。

## 公開リンク

- 公開Editor: https://davinichi.github.io/
- Firmware Installer: https://davinichi.github.io/firmware/
- GitHubリポジトリ: https://github.com/davinichi/ESP32-Education-Editor
- Releases: https://github.com/davinichi/ESP32-Education-Editor/releases
- Firmware v0.1.7 Release: https://github.com/davinichi/ESP32-Education-Editor/releases/tag/firmware-v0.1.7

## 主な機能

- Scratchに似たブロックプログラミング環境
- EditorからWeb Serial経由でESP32へUSB接続
- 9カテゴリーに分かれた拡張と49個の公開ブロック
- GPIOデジタル入出力とPWM
- DHT11 / DHT22温湿度センサー、SSD1306 OLED、HC-SR04超音波距離センサー、サーボモーター
- ESP-NOWによるESP32間通信
- 環境指数の計算とデータ処理
- ブラウザ上のFirmware Installer

## 対応ハードウェアとブラウザ

対象ボードは**ESP32-WROOM-32**です。Arduino IDEのボード選択では**ESP32 Dev Module**を使用します。Firmware Installerの対象もESP32-WROOM-32です。他のESP32ボードはこのFirmwareの対象として案内していません。

EditorとInstallerはWeb Serialを利用します。ChromeまたはEdgeなど、Web Serialに対応するChromium系ブラウザを使ってください。InstallerはHTTPSまたはlocalhostで開く必要があります。公開サイトはHTTPSで配信されています。

## はじめ方

困ったときは[FAQ / トラブルシューティング](docs/esp32-education-editor/FAQ_JA.md)を参照してください。

Firmwareの機能と書き込み方法は[Firmwareガイド](docs/esp32-education-editor/FIRMWARE_GUIDE_JA.md)を参照してください。

詳細な手順は[Getting Startedガイド](docs/esp32-education-editor/GETTING_STARTED_JA.md)を参照してください。


1. ESP32-WROOM-32をUSBでPCまたはChromebookへ接続します。
2. [Firmware Installer](https://davinichi.github.io/firmware/)を開き、画面の案内に従ってFirmware v0.1.7を書き込みます。Installerから完成済みFirmwareを書き込めるため、Arduino IDEや追加ライブラリを利用者側で準備する必要はありません。
3. [公開Editor](https://davinichi.github.io/)を開き、ESP32 Connection拡張からWeb Serial接続を開始します。
4. 使用する拡張カテゴリーを追加し、ブロックを組んで実行します。

シリアルポートをArduino IDEのシリアルモニターや別のEditorが使用している場合は、接続前に切断してください。書き込み後はEditorから接続し、必要に応じて`SYS:STATUS`の応答を確認できます。

## 拡張カテゴリー

| カテゴリー | 内容 |
|---|---|
| ESP32 Connection | ESP32との接続・通信 |
| ESP32 GPIO | GPIOデジタル入出力・PWM |
| ESP32 DHT | DHT11 / DHT22による温度・湿度の取得 |
| ESP32 OLED | SSD1306 OLED表示 |
| ESP32 ESP-NOW | ESP32間の無線通信 |
| ESP32 Servo | サーボモーター制御 |
| ESP32 Ultrasonic | HC-SR04による距離測定 |
| ESP32 Environmental Indices | 温度・湿度を用いた環境指数の計算 |
| Data Processing | データの処理 |

合計9カテゴリー、49個の公開ブロックです。

既存プロジェクトとの互換性のため、`WBGT [WBGT] の警戒レベル`ブロックが非表示の互換ブロックとして内部に1個残っています。このブロックはパレットには表示されません。

## Firmware概要

Firmware v0.1.7は、GPIOデジタル入出力、PWM、サーボ、HC-SR04、DHT11 / DHT22、SSD1306 OLED、ESP-NOWに対応します。PWMは5 kHz、8-bitで、指定可能な出力範囲は0～100%です。ESP-NOWの起動時チャンネルは1で、設定したチャンネルは再起動後に1へ戻ります。BLE UARTは含まれていません。

HC-SR04のECHO出力は約5 Vです。ESP32のGPIOへ接続する前に、抵抗分圧などを使って3.3 V以下にしてください。詳しい変更内容は[Firmware v0.1.7 Release](https://github.com/davinichi/ESP32-Education-Editor/releases/tag/firmware-v0.1.7)を参照してください。

## ESP-NOWと学校ネットワーク

ESP-NOWによるESP32同士の通信には、学校Wi-Fi、校内LAN、インターネット接続は必要ありません。公開EditorとFirmware InstallerをWebから読み込む際にはインターネット接続が必要です。EditorとESP32の接続にはUSB / Web Serialを使用します。

授業での活用例は[授業・教育利用ガイド](docs/esp32-education-editor/LESSON_GUIDE_JA.md)を参照してください。

## 教育利用

本プロジェクトは、ESP32を使ったプログラミングや電子工作の学習に利用できるブロックプログラミング環境です。接続、GPIO、センサー、表示、無線通信などのカテゴリーから、扱う機能を選んでプログラムを作成できます。

## About、ライセンス、Scratchとの関係

ESP32 Education Editorは、Scratch Foundationが公開するオープンソースのScratch Editorを基に開発された**独立プロジェクト**です。Scratch Foundationの公式製品ではなく、同財団による承認、推奨、スポンサーを意味するものではありません。Scratchおよび関連商標の権利はそれぞれの権利者に帰属します。

ベースとなるScratch Editorのライセンス条件およびプロジェクトの表示については、リポジトリ内の[LICENSE](LICENSE)、[NOTICE.md](NOTICE.md)、[TRADEMARK](TRADEMARK)を参照してください。プロジェクトの詳細は[About](docs/esp32-education-editor/ABOUT_JA.md)を参照してください。

## 開発者向け

```bash
npm ci
npm run build
```

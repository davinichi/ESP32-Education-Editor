# ESP32 Education Editor v1.0 マニュアル

[English](V1_MANUAL_EN.md) · [README](../../README.md)

対象: Editor v1.0 / Firmware v1.0.0、ESP32-WROOM-32（ESP32 Dev Module）。実機検証前のリリース候補です。

## 接続と互換性

1. Firmware v1.0.0をソースからコンパイルし、ESP32へ書き込みます。
2. Editorの「ESP32 接続」を追加し、「ESP32に接続」を実行します。
3. 「ESP32のFirmwareバージョン」は接続時に自動取得され、`1.0.0`を表示します。「ESP32の状態を更新」でも再取得できます。モニター表示にも対応します。
4. 必要な拡張を追加します。全12カテゴリー・公開64ブロックです。

v0.1.8以前のFirmwareが`SYS:VERSION`に対応しない場合、接続は継続し、バージョンは「不明（Firmware v1.0.0を推奨）」と表示します。新しいセンサー機能にはv1.0.0が必要です。旧GPIO/PWM、DHT、OLED、ESP-NOW、Servo、HC-SR04の命令と応答、既存ブロックID・引数は維持します。非表示のWBGT互換ブロックも維持します。

## 共通I2C配線

SDA=GPIO21、SCL=GPIO22、GNDを共通にします。ESP32の信号電圧は3.3 Vです。モジュールの電源仕様を確認し、SDA/SCLのプルアップを3.3 Vにしてください。OLED（0x3C）、BME280（通常0x76/0x77）、INA219（既定0x40）は同じWireを共有します。同一アドレスの機器を同時には使用できません。

I2C使用中はGPIO21/22をGPIO・PWM・Servo・他センサーへ割り当てないでください。各センサーは1個ずつ管理し、再初期化すると対象アドレスを切り替えます。

## I2C Scanner

- 「I2Cデバイスをスキャンする」を実行します（0x08～0x77、予約アドレスは除外）。
- 「I2Cスキャン結果」は例として`0x3C,0x40,0x76`を返します。検出なしは空文字です。
- 「I2Cアドレス [0x40] は見つかった？」は直前の成功したスキャン結果を調べます。16進表記・10進表記の両方を使えます。機種判定ではありません。
- スキャン失敗・未対応Firmware・タイムアウトでは結果にエラーコードを表示し、検出一覧を消去します。切断時にも消去します。

## BME280

「BME280 をアドレス [0x76] で初期化」を実行します。0x76/0x77を選択できます。「BME280 温度（℃）」「BME280 湿度（％）」「BME280 気圧（hPa）」で測定します。気圧はPaからhPaへ変換します。BMP280は湿度センサーを持たず、このカテゴリーの対象外です。

## INA219

「INA219 をアドレス [0x40] で初期化」を実行します。0x40～0x4Fを選択できます。ブロックはバス電圧V（VIN−側とGND間）、電流mA、電力mW、シャント電圧mVを返します。電源側電圧が必要なら、バス電圧 + シャント電圧/1000で計算できます。

Adafruitライブラリの既定32V/2A校正（0.1Ωシャントを前提）を使用します。実際のモジュールのシャント抵抗と測定定格を確認してください。電圧・電流・電力は各レポーターの実行時に取得し、複数レポーターの値は同時サンプルではありません。

## 測定失敗

新しいセンサーの測定失敗時は数値の代わりに空文字を返し、過去の値を返しません。各「状態」ブロックで`READY`、`OK`、`INVALID_ADDRESS`、`INIT_FAILED`、`NOT_INITIALIZED`、`READ_ERROR`、`TIMEOUT`、`UNSUPPORTED_FIRMWARE`などを確認してください。数値として計算する前に状態が`OK`であることを確認します。USB切断後は手動で再接続・再初期化してください。

## USB通信仕様（115200 bps、LF終端）

| 命令 | 応答例 |
|---|---|
| `I2C:SCAN` | `I2C:SCAN:0x3C,0x40,0x76`（なし: `I2C:SCAN:`） |
| `BME280:INIT:0x76` | `BME280:STATUS:READY` |
| `BME280:READ` | `BME280:DATA:23.50:60.00:1013.25`（℃:％:hPa） |
| `INA219:INIT:0x40` | `INA219:STATUS:READY` |
| `INA219:READ` | `INA219:DATA:3.300:10.000:33.000:1.000`（V:mA:mW:mV） |
| `SYS:VERSION` | `SYS:VERSION:1.0.0` |

初期化命令のアドレスは必須です。Editorの既定値はBME280=0x76、INA219=0x40です。アドレスは10進数も使用可能です。I2Cエラーは`I2C:ERROR:INIT_FAILED`または`I2C:ERROR:SCAN_FAILED`、センサーエラーは`<センサー名>:STATUS:<コード>`です。

## ビルドと公開前確認

Arduinoライブラリ: DHT sensor library、Adafruit Unified Sensor、Adafruit GFX Library、Adafruit SSD1306、Adafruit BusIO、Adafruit BME280 Library、Adafruit INA219。Arduino-ESP32 3.2.1を基準とします。

```sh
arduino-cli compile --fqbn esp32:esp32:esp32 firmware/esp32-education-editor/esp32_education_editor_firmware_v1_0_0
npm ci
npm run build
```

[リリース候補情報と実機確認項目](RELEASE_NOTES_V1.md)を参照してください。公開Installer、manifest、配布バイナリーの更新は別リポジトリの配信作業です。この変更だけでは公開されません。従来PDFは旧版の資料として扱い、このマニュアルをv1.0の追加仕様としてください。

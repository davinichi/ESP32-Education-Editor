# ESP32 Education Editor v1.0 マニュアル

[English](V1_MANUAL_EN.md) · [README](../../README.md)

対象: Editor v1.0 / Firmware v1.0.0、ESP32-WROOM-32（ESP32 Dev Module）。2026年10月20日に正式公開されました。[公開Editor](https://davinichi.github.io/)と[Firmware Installer](https://davinichi.github.io/firmware/)から利用できます。

## 接続と互換性

1. [はじめ方](GETTING_STARTED_JA.md)に従い、ChromebookではChrome、WindowsではChromeまたはEdgeで[Firmware Installer](https://davinichi.github.io/firmware/)を開き、完成済みFirmware v1.0.0を書き込みます。Arduino IDEや追加ライブラリは不要です。データ通信対応USBケーブルを使い、Web Serialのポート選択画面でESP32を選んで許可します。
2. Installerを切断し、ポートを解放してから[公開Editor](https://davinichi.github.io/)を開きます。
3. Editorの「ESP32 接続」を追加し、「ESP32に接続」を実行し、ESP32のポートを選んで許可します。
4. 次の手順でFirmwareバージョンを確認します。
5. 必要な拡張を追加します。全12カテゴリー・公開64ブロックです。

v0.1.8以前のFirmwareが`SYS:VERSION`に対応しない場合、接続は継続し、バージョンは「不明（Firmware v1.0.0を推奨）」と表示します。新しいセンサー機能にはv1.0.0が必要です。旧GPIO/PWM、DHT、OLED、ESP-NOW、Servo、HC-SR04の命令と応答、既存ブロックID・引数は維持します。非表示のWBGT互換ブロックも維持します。

### Firmwareバージョンを確認する

接続後、ESP32 Connectionの「ESP32のFirmwareバージョン」をクリックするか、チェックを入れてモニター表示し、`1.0.0`であることを確認します。接続時に自動取得され、「ESP32の状態を更新」でも再取得できます。「ESP32の状態」が`OK`であることも確認してください。

「不明（Firmware v1.0.0を推奨）」や古いバージョンが表示される場合は、Editorを切断し、Installerでv1.0.0を書き込んでから再接続します。`SYS:READY:OK`だけではバージョンは判定できません。通信仕様上の確認は`SYS:VERSION`への応答`SYS:VERSION:1.0.0`です（通常はブロックで確認でき、コマンドの手入力は不要です）。

学校管理端末の制限やWindowsでのポート認識は[はじめ方](GETTING_STARTED_JA.md)を参照してください。

## 共通I2C配線

SDA=GPIO21、SCL=GPIO22、GNDを共通にします。ESP32の信号電圧は3.3 Vです。モジュールの電源仕様を確認し、SDA/SCLのプルアップを3.3 Vにしてください。OLED（0x3C）、BME280（通常0x76/0x77）、INA219（既定0x40）は同じWireを共有します。同一アドレスの機器を同時には使用できません。

I2C使用中はGPIO21/22をGPIO・PWM・Servo・他センサーへ割り当てないでください。各センサーは1個ずつ管理し、再初期化すると対象アドレスを切り替えます。

## I2C Scanner

- 「I2Cデバイスをスキャンする」を実行します（0x08～0x77、予約アドレスは除外）。
- 「I2Cスキャン結果」は例として`0x3C,0x40,0x76`を返します。検出なしは空文字です。
- 「I2Cアドレス [0x40] は見つかった？」は直前の成功したスキャン結果を調べます。16進表記・10進表記の両方を使えます。機種判定ではありません。
- スキャン失敗・未対応Firmware・タイムアウトでは結果にエラーコードを表示し、検出一覧を消去します。切断時にも消去します。

## BME280

### 秋月電子 AE-BME280の接続（0x76）

この基板の電源範囲は1.71～3.6Vです。ESP32では3.3Vを使用し、5Vを接続しないでください。

| AE-BME280端子 | 接続先 |
|---|---|
| VDD | 3.3V |
| GND | ESP32と共通のGND |
| CSB | J3をはんだ接続してVDDへ固定（I2Cモード） |
| SDI | GPIO21（SDA） |
| SDO | GND（アドレス0x76） |
| SCK | GPIO22（SCL） |

J3の接続とSDOのアドレス設定は別です。SDOは未接続にせず、0x76ならGND、0x77なら3.3Vに固定します。配線変更時はUSBと外部電源を外してください。基板のJ1/J2はプルアップ抵抗の選択用で、他のI2C基板を含む回路全体に合わせます。

参照: [AE-BME280公式説明書（1ページ目）](https://akizukidenshi.com/goodsaffix/AE-BME280_manu_v1.1.pdf)。SDO接続・両センサーの本体電源3.3Vの条件で、BME280・INA219・内蔵OLED併用の診断プロジェクト600回完了をユーザー確認済みです。

「BME280 をアドレス [0x76] で初期化」を実行します。0x76/0x77を選択できます。「BME280 温度（℃）」「BME280 湿度（％）」「BME280 気圧（hPa）」で測定します。気圧はPaからhPaへ変換します。BMP280は湿度センサーを持たず、このカテゴリーの対象外です。

## INA219

ESP32とのI2C信号電圧を3.3Vにそろえます。今回の確認済みモジュールの本体VCCは3.3Vへ接続します。本体VCCと測定端子Vin＋/Vin－を混同しないでください。LED負荷を測る例は、GPIO25 → Vin＋ → Vin－ → 330Ω → LEDアノード → LEDカソード → GNDの直列回路です。Vin＋/Vin－をLEDの両端へ並列接続しないでください。

「INA219 をアドレス [0x40] で初期化」を実行します。0x40～0x4Fを選択できます。ブロックはバス電圧V（VIN−側とGND間）、電流mA、電力mW、シャント電圧mVを返します。電源側電圧が必要なら、バス電圧 + シャント電圧/1000で計算できます。

Adafruitライブラリの既定32V/2A校正（0.1Ωシャントを前提）を使用します。実際のモジュールのシャント抵抗と測定定格を確認してください。電圧・電流・電力は各レポーターの実行時に取得し、複数レポーターの値は同時サンプルではありません。

## 測定失敗

BME280は同梱の`BME280Checked.h`で、初期化時の通信と校正データの受信を確認します。測定時は温度・湿度・気圧の元データ8バイトを1回の連続転送で取得し、送信・受信の成否と受信バイト数を確認してから計算します。通信失敗・データ不足では`READ_ERROR`を返し、その回の値を返しません。次の読み取りが成功すれば、再初期化せず測定を再開します。自動再試行で失敗した回を隠すことはしません。

BME280はメーカー仕様範囲（温度−40～85℃、湿度0～100％、気圧300～1100hPa）を外れた値も`READ_ERROR`として扱います。範囲外の値を上限・下限へ丸めたり、前回の正常値で置き換えたりしません。湿度100％は範囲内なので、それだけでは異常と判定しません。これは不正な測定を正常扱いしないための判定であり、通信や個体の不具合を解消したことを保証するものではありません。

参照: [Bosch BME280データシート](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf)。

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

## 電源と測定の確認

### 電源と測定の進め方

ブレッドボードは3.3V用と5V用の電源ラインを分け、3.3Vと5Vを直結しません。GNDは共通にします。AE-BME280と今回のINA219は3.3V、一般的なHC-SR04は5V（ECHOをESP32へ入れる前に分圧）、SG90は確認済みの外部5V電源を使用します。サーボをESP32の3.3V端子から給電しません。DHT11/DHT22は購入した基板の電圧仕様・プルアップ回路を確認します。

センサーの状態は、測定直後に保存して確認します。モニター表示も測定要求を発生させるため、切り分け時は不要な数値モニターを隠します。チェック状態と表示が一致しない場合はステージのモニターを右クリックして隠し、プロジェクトを保存してください。OLED命令の実行完了は表示成功の保証ではなく、「OLED最後の応答」も確認します。

連続試験はEditorを前面に表示し、PCをスリープさせず実施します。今回の600回試験は前面表示の条件です。背面表示中の一定周期動作や、配線修正前に発生した応答停止の原因特定までは確認していません。USB切断後は手動で接続・各機器の初期化を行います。測定回数だけでなく、状態・失敗回数・OLED応答を記録してください。

<a id="developer-build"></a>

## 開発者向け：ソースからのビルド

以下はFirmwareやEditorを改変する開発者向けです。通常利用には公開Installerを使用してください。Arduino IDEを使用する場合のボード選択はESP32 Dev Moduleです。

Arduinoライブラリ: DHT sensor library、Adafruit Unified Sensor、Adafruit GFX Library、Adafruit SSD1306、Adafruit BusIO、Adafruit INA219。Arduino-ESP32 3.2.1を基準とします。BME280用ドライバーは同梱です。スケッチの`.ino`と`BME280Checked.h`を同じフォルダーに置いてください。Adafruit BME280 Libraryは別途提供した単独診断スケッチで使用します。

```sh
arduino-cli compile --fqbn esp32:esp32:esp32 firmware/esp32-education-editor/esp32_education_editor_firmware_v1_0_0
npm ci
npm run build
```

[正式リリース情報と実機確認項目](RELEASE_NOTES_V1.md)を参照してください。公開Installerのmanifestとバイナリーは別リポジトリで配信されています。ローカルでビルドしても公開配信は更新されません。[日本語v1.0 PDF](https://davinichi.github.io/manuals/ESP32_Education_Editor_v1.0_JA.pdf)・[English v1.0 PDF](https://davinichi.github.io/manuals/ESP32_Education_Editor_v1.0_EN.pdf)も公開済みです。旧版の[導入資料](history/v0.6/GETTING_STARTED_JA.md)・[Firmwareガイド](history/v0.6/FIRMWARE_GUIDE_JA.md)・[FAQ](history/v0.6/FAQ_JA.md)は履歴として保持しています。

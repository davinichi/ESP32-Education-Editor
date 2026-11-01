# Firmwareガイド — v1.0.0

日本語 | [English](FIRMWARE_GUIDE_EN.md)

[README](../../README.md) · [はじめ方](GETTING_STARTED_JA.md) · [FAQ](FAQ_JA.md)

## 現行版と標準の導入方法

2026年10月20日正式公開の **Editor v1.0 / Firmware v1.0.0** を使用します。対象は **ESP32-WROOM-32** です。他のESP32ボードへ書き込まないでください。

FirmwareはESP32本体で動作する共通プログラムで、EditorからUSB / Web Serialで受け取る命令を実行します。Editorのプロジェクトファイルとは別のものです。プロジェクトの保存・読み込みはEditorで行います。

1. データ通信対応USBケーブルでボードを接続します。ChromebookではChrome、WindowsではWeb Serial対応のChromeまたはEdgeを使います。
2. [Firmware Installer](https://davinichi.github.io/firmware/)を開き、表示がv1.0.0であることを確認します。日本語／Englishを選択できます。
3. 「ESP32に接続して v1.0.0 を書き込む」を押し、ブラウザのポート選択画面でESP32のUSBシリアルポートを選び、画面の案内に従って書き込みます。
4. Installerを切断し、必要ならタブを閉じてポートを解放します。[公開Editor](https://davinichi.github.io/)のESP32 Connection拡張から「ESP32に接続」を実行し、ポートを選んで許可します。

完成済みFirmwareを書き込むため、Arduino IDE・追加ライブラリ・ソースのコンパイルは不要です。更新も同じ手順で手動実行します。Installerによる自動更新はありません。

### Chromebook・WindowsとWeb Serial

- **Chromebook**: Chromeで公開InstallerとEditorを開きます。Linux環境やArduino IDEの設定は不要です。学校管理の端末でUSBシリアルの利用やサイトへのアクセスが制限されている場合は、学校の管理者に許可設定を確認してください。
- **Windows**: Web Serial対応のChromeまたはEdgeを使います。デバイス マネージャーの「ポート（COMとLPT）」でUSBシリアル機器を確認できます。認識されない場合はボードのUSBシリアルチップを確認し、ボードメーカーの案内する対応ドライバーを使用してください。
- **共通**: データ通信対応USBケーブルを使い、ブラウザのポート選択画面で接続したESP32を選んで許可します。Web SerialはHTTPSなどの安全なコンテキストと利用者の許可が必要です。公開HTTPSリンクを使ってください。充電専用ケーブルでは接続できません。
- Installer、Editor、シリアルモニターで同じポートを同時に使えません。切り替える前に切断し、必要なら前のタブを閉じてください。USBを抜いた後はEditorから手動で再接続します。

### Firmwareバージョンを確認する

接続後、ESP32 Connectionの「ESP32のFirmwareバージョン」をクリックするか、チェックを入れてモニター表示し、`1.0.0`であることを確認します。接続時に自動取得され、「ESP32の状態を更新」でも再取得できます。「ESP32の状態」が`OK`であることも確認してください。

「不明（Firmware v1.0.0を推奨）」や古いバージョンが表示される場合は、Editorを切断し、Installerでv1.0.0を書き込んでから再接続します。`SYS:READY:OK`だけではバージョンは判定できません。通信仕様上の確認は`SYS:VERSION`への応答`SYS:VERSION:1.0.0`です（通常はブロックで確認でき、コマンドの手入力は不要です）。

## 機能と通信

Firmware v1.0.0は従来のGPIO/PWM、DHT11/DHT22、SSD1306 OLED、ESP-NOW、サーボ、HC-SR04を継承し、I2C Scanner・BME280・INA219と`SYS:VERSION`を追加しています。BLE UARTは含みません。環境指数計算やCSV・文字列処理はEditor側の機能です。Editorには12カテゴリー・64個の公開ブロックがあります。

I2CはSDA=GPIO21、SCL=GPIO22を共有します。配線・電源条件、旧版との互換性、測定失敗時の扱い、115200 bps・LF終端の通信仕様は[v1.0マニュアル](V1_MANUAL_JA.md)を参照してください。HC-SR04のECHOは約5 VのためESP32入力へ入れる前に3.3 V以下に下げます。

「ESP32の状態を更新」は状態とバージョンを再取得します。「ESP32の状態」は`OK`、MACアドレス／Wi-Fiチャンネルの各ブロックは受信値を表示します。通信上は`SYS:STATUS`に対して`SYS:READY:OK`、`SYS:MAC:`、`SYS:CH:`を含む応答が返ります。これはセンサーの配線や測定精度を検査するものではありません。

ESP-NOWのボード間通信には学校Wi-Fi・校内LAN・インターネットは不要です。通信するボードは同じチャンネルを使います。起動時は1で、変更しても再起動すると1へ戻ります。公開ページの読み込みにはインターネット接続が必要です。読み込み後の完全オフライン動作は保証していません。

## 開発者向け・履歴

改変のためにソースからビルドする場合のみ、[開発者向け手順](V1_MANUAL_JA.md#developer-build)を参照してください。Arduino IDEのボード選択名はESP32 Dev Moduleです。

[旧Firmwareガイド（Editor v0.6 / Firmware v0.1.8）](history/v0.6/FIRMWARE_GUIDE_JA.md)は履歴として保持しています。現在の導入には使用しないでください。[Firmware v1.0.0 Release](https://github.com/davinichi/ESP32-Education-Editor/releases/tag/firmware-v1.0.0)も参照できます。

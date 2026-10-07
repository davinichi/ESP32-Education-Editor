# Firmwareガイド

日本語 | [English](FIRMWARE_GUIDE_EN.md)

[README](../../README.md) · [はじめ方](GETTING_STARTED_JA.md) · [FAQ / トラブルシューティング](FAQ_JA.md)

## 1. Firmwareとは

FirmwareはESP32本体で動作する共通プログラムです。EditorからUSB / Web Serialで送られるコマンドを受け取り、GPIO、対応センサー、ディスプレイ、サーボ、ESP-NOWなどを制御します。Editorはブロックを組み立てて指示を送り、Firmwareがボード上で実際の入出力を行います。

## 2. 現在のFirmwareバージョン

現在のFirmwareは **v0.1.7** です。**Editor v0.6** と組み合わせて使用します。EditorとFirmwareは別々にバージョン管理されています。

## 3. 対象ボード

正式な対象は **ESP32-WROOM-32** です。Arduino IDEでボードを選ぶ必要がある場合のボード選択名は **ESP32 Dev Module** です。Firmware InstallerはESP32-WROOM-32向けです。他のボードに書き込まないでください。

## 4. Firmwareを書き込む

標準の方法は[Firmware Installer](https://davinichi.github.io/firmware/)を使うことです。

1. ESP32-WROOM-32をUSBでPCまたはChromebookに接続します。
2. Firmware Installerを開きます。必要に応じてページ上部で日本語またはEnglishを選びます。
3. 書き込みボタンを押し、ブラウザの一覧からESP32のUSBシリアルポートを選択します。
4. 画面の案内に従ってFirmware v0.1.7を書き込みます。

Installerは完成済みFirmwareをブラウザから書き込むため、Arduino IDEや追加ライブラリを準備する必要はありません。 Editorも日本語／英語に対応しており、Editor内の **Settings → Language** から切り替えられます。

## 5. ブラウザと接続条件

InstallerとEditorには、Chrome / EdgeなどWeb Serialに対応するブラウザを使います。Installerは **HTTPSまたはlocalhost** から開く必要があります。公開InstallerとEditorはHTTPSで配信されています。ESP32はUSB接続し、InstallerやEditorが使うシリアルポートをArduino IDEのSerial Monitorなど別のアプリが使用していない状態にしてください。

## 6. Firmware v0.1.7の主な機能

| 機能 | Firmwareでできること |
|---|---|
| GPIO | デジタル入力・出力 |
| PWM | GPIOへの汎用PWM出力と停止 |
| DHT | DHT11 / DHT22から温度・湿度を取得 |
| OLED | SSD1306 OLEDへの表示と指定範囲の消去 |
| ESP-NOW | ESP32間の送受信、チャンネル設定 |
| Servo | サーボ出力の接続、角度指定、切断 |
| HC-SR04 | TRIG / ECHOを使った距離測定 |
| システム情報 | READY状態、MACアドレス、Wi-Fiチャンネルを確認 |

環境指数の計算やCSV・文字列処理はEditorの **ESP32 Environmental Indices** / **Data Processing** カテゴリー側の機能です。これらの計算・処理をFirmwareのセンサー制御機能と混同しないでください。

## 7. GPIOとPWM

FirmwareはGPIOのデジタル入力・出力に対応します。EditorのESP32 GPIOカテゴリーで選択できるピンを使ってください。

PWMは周波数 **5 kHz**、分解能 **8-bit** で、Editorから指定する出力値は **0〜100%** です。PWM出力の停止ブロックもあります。v0.1.7 Release Notesで示されているPWM対応GPIOは次のとおりです。

`13, 14, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33`

PWM停止後に同じ出力を再開できる修正もv0.1.7で確認されています。詳細は[Firmware v0.1.7 Release Notes](https://davinichi.github.io/firmware/RELEASE_NOTES_firmware-v0.1.7.md)を参照してください。

## 8. Servo

ESP32 Servoカテゴリーから、ServoをGPIOへ接続する、角度を指定する、出力を切断する操作を行えます。Editorの角度指定範囲は **0〜180度** です。配線や電源条件は使用するServoの資料を確認してください。このガイドでは未確認の配線・電源仕様を指定しません。

## 9. HC-SR04 Ultrasonic

ESP32 Ultrasonicカテゴリーでは、TRIG / ECHOのGPIOを指定して距離をcm単位で取得できます。v0.1.7 Release Notesに記載された試験構成はTRIGがGPIO26、ECHOがGPIO34です。

HC-SR04のECHO出力は約5 Vです。**ECHOをESP32へ5 Vのまま直接入力しないでください。ESP32入力を3.3 V以下にしてください。**リリースノートには、ECHOと入力の間に1 kΩ、入力とGNDの間に2 kΩを接続する分圧例があります。詳細は[Release Notes](https://davinichi.github.io/firmware/RELEASE_NOTES_firmware-v0.1.7.md)を確認してください。

## 10. ESP-NOW

ESP-NOWではESP32同士が直接通信します。学校のWi-Fiアクセスポイントや校内LANは不要で、ボード間のESP-NOW通信にインターネット接続も必要ありません。通信するボードは同じチャンネルを使用してください。Firmwareは起動時にチャンネル1を使用し、Editorから1〜13を選択できます。再起動するとチャンネルは1に戻ります。

EditorのESP32 ConnectionカテゴリーからボードのMACアドレスと現在のWi-Fiチャンネルを確認できます。ESP-NOWカテゴリーでは宛先MACアドレスを指定した送信、チャンネル設定、受信データの確認ができます。

公開EditorとFirmware InstallerをWebから読み込むにはインターネット接続が必要です。これはESP-NOW通信に必要なネットワークとは別の条件です。

## 11. EditorとFirmwareの通信

EditorとFirmwareはUSB / Web Serialで通信します。Firmware Installerで書き込んだ後、[公開Editor](https://davinichi.github.io/)からESP32 Connectionカテゴリーを使って接続します。接続状態の確認には`SYS:STATUS`を実行し、応答に`SYS:READY:OK`が含まれることを確認します。

## 12. 書き込み後の確認

Firmware Installerの案内に従ってEditorから接続し、ESP32 Connectionの状態更新を実行します。状態応答に次の情報が含まれることを確認してください。

- `SYS:READY:OK`：FirmwareのREADY応答
- `SYS:MAC:`に続く値：ESP32のMACアドレス
- `SYS:CH:`に続く値：現在のWi-Fiチャンネル

EditorのMACアドレス／チャンネル表示ブロックからも値を確認できます。これらは通信状態の確認情報であり、個々のセンサーや周辺機器の配線動作まで検査するものではありません。

## 13. Firmwareを更新するとき

新しいFirmwareが公開された場合は、Firmware Installerで対象バージョンを確認し、画面の案内に従ってESP32-WROOM-32へ書き込んでください。InstallerがFirmwareを自動更新する機能はありません。更新後はEditorから接続し、`SYS:STATUS`の応答を確認してください。

## 14. Firmwareとプロジェクトファイル

Editorで作成したプロジェクトファイルと、ESP32へ書き込むFirmwareは別のものです。プロジェクトの保存・読み込みはEditorで行い、Firmwareの書き込み・更新はInstallerで行います。Firmwareの更新は、プロジェクトを保存または読み込む操作ではありません。

## 15. トラブルシューティング

接続、シリアルポート、ブラウザ、書き込みの問題は[FAQ / トラブルシューティング](FAQ_JA.md)を参照してください。

BLE UARTはFirmware v0.1.7に含まれていません。機能や互換性の詳細は[公式v0.1.7 Release Notes](https://davinichi.github.io/firmware/RELEASE_NOTES_firmware-v0.1.7.md)を参照してください。

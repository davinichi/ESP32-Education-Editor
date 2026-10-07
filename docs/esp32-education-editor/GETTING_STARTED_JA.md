# はじめ方

このガイドでは、ESP32 Education Editor v0.6とFirmware v0.1.7を使い、ESP32-WROOM-32を接続してGPIOでLEDを点滅させます。

## 1. 必要なもの

- ESP32-WROOM-32（Arduino IDEでファームウェアを扱う場合のボード選択名は **ESP32 Dev Module**）
- データ通信に対応したUSBケーブルと、USBポートのあるPCまたはChromebook
- Web Serialに対応したGoogle ChromeまたはMicrosoft EdgeなどのChromium系ブラウザ
- GPIO23に接続する外付けLEDと電流制限抵抗、または抵抗内蔵のLEDモジュール
- LEDとESP32のGNDをつなぐ配線

Firmware Installerの対象はESP32-WROOM-32です。他のESP32ボードには書き込まないでください。

## 2. Firmwareの書き込み

1. USBケーブルでESP32-WROOM-32をPCまたはChromebookに接続します。
2. [Firmware Installer](https://davinichi.github.io/firmware/)をChromeまたはEdgeで開きます。公開ページはHTTPSで配信されています。
3. 「ESP32に接続して v0.1.7 を書き込む」を押し、一覧からESP32のUSBシリアルポートを選びます。
4. 画面の案内に従ってFirmware v0.1.7の書き込みを完了します。

Installerは完成済みFirmwareをブラウザから書き込むため、Arduino IDEや追加ライブラリを準備する必要はありません。書き込み中はArduino IDEのシリアルモニターやEditorなど、ESP32のUSBポートを使う別のアプリを閉じてください。

## 3. Editorを開く

[公開Editor](https://davinichi.github.io/)をChromeまたはEdgeで開きます。EditorはWeb Serialを使ってUSB経由でESP32と通信します。

## 4. 表示言語の選択

Editor上部の **Settings → Language** メニューから日本語またはEnglishを選びます。Firmware Installerにもページ上部の日本語／English切り替えがあります。

## 5. ESP32を接続する

1. 拡張カテゴリーから **ESP32 Connection** を追加します。
2. 「ESP32に接続」ブロックをワークスペースに置いて実行します。
3. ブラウザのポート選択画面で、接続したESP32のUSBシリアルポートを選び、接続を許可します。

シリアルポートが選択肢に出ない場合は、USB接続を確認し、Arduino IDEのシリアルモニターなどポートを使っているアプリを閉じてから、もう一度接続してください。

## 6. 最初のプログラムを作る

ここではGPIO23に接続したLEDを1秒ごとに点灯・消灯するプログラムを作ります。ESP32 GPIO拡張のピンメニューにGPIO23があり、Firmware v0.1.7はGPIOデジタル出力に対応しています。

### LEDの接続

外付けLEDには必ず電流制限抵抗を直列に入れてください。抵抗内蔵のLEDモジュールを使う場合は、そのモジュールの接続表示に従います。リポジトリでは抵抗値を指定していないため、裸のLEDを使う場合はLEDの仕様に合う抵抗を選んでください。

```text
ESP32 GPIO23 ── 電流制限抵抗 ── LEDのアノード（＋、長い側）
ESP32 GND   ───────────────── LEDのカソード（－、短い側）
```

### ブロックを組む

1. **ESP32 GPIO** カテゴリーを追加します。
2. 次のブロックを順につなぎます。

```text
[緑の旗がクリックされたとき]
  [GPIO 23 のモードを OUTPUT にする]
  [10 回繰り返す]
    [GPIO 23 を HIGH にする]
    [1 秒待つ]
    [GPIO 23 を LOW にする]
    [1 秒待つ]
```

3. 緑の旗をクリックして実行します。LEDが点灯と消灯を繰り返します。

GPIO拡張のデジタル出力ブロックは、指定ピンを出力モードにしてからHIGHまたはLOWを書き込みます。上の例では動作を読み取りやすくするため、最初にモード設定ブロックも置いています。

## 7. ESP32拡張カテゴリーの概要

Editorには9カテゴリー、49個の公開ブロックがあります。既存プロジェクトとの互換性のため、`WBGT [WBGT] の警戒レベル`という非表示ブロックが1個内部に残っています。このブロックはパレットには表示されません。

| カテゴリー | 主な用途 |
|---|---|
| ESP32 Connection | USB / Web Serial接続、状態やMACアドレスの確認 |
| ESP32 GPIO | デジタル入出力、PWM |
| ESP32 DHT | DHT11 / DHT22の温度・湿度取得 |
| ESP32 OLED | SSD1306 OLEDへの表示 |
| ESP32 ESP-NOW | ESP32同士の無線通信 |
| ESP32 Servo | サーボモーター制御 |
| ESP32 Ultrasonic | HC-SR04による距離測定 |
| ESP32 Environmental Indices | 温度・湿度を使った環境指数の計算 |
| Data Processing | CSVや文字列などのデータ処理 |

## 8. ESP-NOWについて

ESP-NOWを使ったESP32同士の通信には、学校Wi-Fi、校内LAN、インターネット接続は必要ありません。通信するESP32同士は同じESP-NOWチャンネルを使用してください。Firmware v0.1.7の起動時チャンネルは1で、チャンネル設定は再起動すると1に戻ります。

公開EditorとFirmware InstallerをWebから読み込むにはインターネット接続が必要です。EditorとESP32の間はUSB / Web Serialで接続します。Webページを開いた後の完全なオフライン動作については、このガイドでは保証しません。

## 9. 接続できない場合

- **Web Serial非対応のブラウザ**：ChromeまたはEdgeなど、Web Serialに対応したChromium系ブラウザで開いてください。
- **USBケーブル・ポートが見つからない**：ESP32-WROOM-32がUSBで接続されているか確認し、ブラウザのポート選択画面をもう一度開いてください。充電専用のケーブルではデータ通信できません。
- **シリアルポートが他アプリで使用中**：Arduino IDEのシリアルモニターや別のEditorを閉じ、再度接続します。同じUSBポートを複数のアプリから同時に使わないでください。
- **Firmwareが未書き込み、または古い**：[Firmware Installer](https://davinichi.github.io/firmware/)からESP32-WROOM-32へFirmware v0.1.7を書き込み、その後Editorから接続します。書き込み後の確認には、接続から`SYS:STATUS`を実行し、`SYS:READY:OK`を含む応答を確認します。
- **Installerを開けない／書き込みを開始できない**：InstallerはHTTPSまたはlocalhostで開く必要があります。公開InstallerのURLを使ってください。Web Serial非対応ブラウザでは書き込みできません。
- **対象ボードが異なる**：このInstallerが対象とするのはESP32-WROOM-32です。ESP32 Dev ModuleはArduino IDEで使用するボード選択名であり、別のESP32ボードへの対応を示すものではありません。

## 10. 次に試すこと

- **ESP32 GPIO** でデジタル入力やPWMを試す
- **ESP32 DHT** でDHT11 / DHT22の温度・湿度を読む
- **ESP32 OLED** でSSD1306 OLEDに文字を表示する
- **ESP32 Ultrasonic** でHC-SR04の距離を測る（ECHO信号はESP32に入れる前に3.3 V以下へ下げてください）
- **ESP32 ESP-NOW** で別のESP32と送受信する
- [Firmware v0.1.7リリースノート](https://github.com/davinichi/ESP32-Education-Editor/releases/tag/firmware-v0.1.7)と[README](../../README.md)を確認する

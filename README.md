# ESP32 Education Editor

**ESP32 Education Editor** は、ESP32を学校教育で扱いやすくするための、Scratch系ブロックプログラミング環境です。

ChromebookやWindows PCのブラウザから、ESP32-WROOM-32をUSBで接続し、GPIO、温湿度センサ、OLED、ESP-NOW、環境指数などをブロックで扱うことを目的としています。

- 公開版 Editor: https://davinichi.github.io/
- Firmware Web Installer: https://davinichi.github.io/firmware/
- GitHub Repository: https://github.com/davinichi/ESP32-Education-Editor
- Releases: https://github.com/davinichi/ESP32-Education-Editor/releases
- Firmware v0.1.5: https://github.com/davinichi/ESP32-Education-Editor/releases/tag/firmware-v0.1.5

> **Version note**
>
> ESP32 Education Editor本体とESP32共通ファームウェアは、別々のバージョンで管理しています。
>
> - Editor: **v0.4**
> - Common Firmware: **v0.1.5**

---

## 1. このプロジェクトについて

学校のChromebookなどでESP32を利用する場合、Arduino IDEなどの開発環境を端末へインストールすることが難しいことがあります。

ESP32 Education Editorでは、ESP32側へあらかじめ共通ファームウェアを書き込んでおき、ブラウザからWeb Serialでコマンドを送る方式を採用しています。

```text
Scratch系ブロック
      ↓
ESP32 Education Editor
      ↓
Web Serial
      ↓
USB
      ↓
ESP32 共通ファームウェア
      ↓
センサ・OLED・GPIO・ESP-NOW
```

この方式により、授業中に児童・生徒が毎回Arduinoスケッチをコンパイルして書き込む必要がなく、ブロックを組んで実行する学習に集中できます。

---

## 2. 主な特徴

- Scratchに近いブロックプログラミング環境
- Chromebookからブラウザで利用可能
- Web SerialによるESP32とのUSB通信
- ESP32側の共通ファームウェア方式
- GPIO入出力
- DHT11 / DHT22 温湿度センサ
- SSD1306 OLED
- ESP-NOW
- 温度・湿度を利用した環境指数
- データ処理
- GitHub Pagesから利用可能
- Web InstallerからESP32-WROOM-32へファームウェアを書き込み可能

---

## 3. ESP32拡張

現在、ESP32 Education Editorでは機能を次のカテゴリに分けています。

| 拡張 | 内容 |
|---|---|
| ESP32 接続 | ESP32との接続・通信 |
| ESP32 GPIO | デジタル入出力などのGPIO制御 |
| ESP32 DHT | DHT11 / DHT22 温湿度センサ |
| ESP32 OLED | SSD1306 OLED表示 |
| ESP32 ESP-NOW | ESP32同士の無線通信 |
| ESP32 環境指数 | 温度・湿度を利用した環境値の計算 |
| データ処理 | 取得したデータの処理 |

各機能を別々の拡張に分けることで、授業で必要な機能だけを選択しやすい構成にしています。

---

## 4. 対応・確認済みハードウェア

### 実機確認済み

- **ESP32-WROOM-32**
- DHT11
- DHT22
- SSD1306 OLED

ESP32-WROOM-32では、EditorからのUSB / Web Serial接続と主要拡張の動作を確認しています。

### その他のESP32

XIAO ESP32-C3 / ESP32-S3などについては、現時点の正式ファームウェア release `firmware-v0.1.5` の動作保証対象には含めていません。

---

## 5. はじめ方

### Step 1: ESP32へ共通ファームウェアを書き込む

ESP32-WROOM-32をUSBケーブルでPCまたはChromebookへ接続します。

次のWeb Installerを開きます。

https://davinichi.github.io/firmware/

画面の案内に従ってESP32を選択し、共通ファームウェアを書き込みます。

現在の正式ファームウェアは **v0.1.5** です。

ファームウェアファイルを手動で選択する必要はありません。

### Step 2: ESP32 Education Editorを開く

https://davinichi.github.io/

### Step 3: ESP32を接続する

ESP32接続拡張からWeb Serial接続を実行し、ブラウザに表示されるシリアルポート選択画面でESP32を選択します。

### Step 4: 必要な拡張を追加する

授業や実験に合わせて、GPIO、DHT、OLED、ESP-NOW、環境指数などの拡張を追加します。

### Step 5: ブロックを組んで実行する

ESP32側には共通ファームウェアが入っているため、通常の利用ではブロックを変更するたびにファームウェアを書き直す必要はありません。

---

## 6. Firmware v0.1.5

正式版:

https://github.com/davinichi/ESP32-Education-Editor/releases/tag/firmware-v0.1.5

対象:

- ESP32-WROOM-32

主な機能:

- Web SerialによるUSB通信
- GPIO入出力
- DHT11 / DHT22
- SSD1306 OLED
- OLED指定範囲消去（FILLBLACK）
- ESP-NOW
  - Wi-Fiチャンネル1
  - ブロードキャスト送信
  - MACアドレス指定送信
  - 受信

v0.1.5ではESP-NOWの安定動作を優先し、実機で確認済みの安定構成を採用しています。

BLE UART機能は、本バージョンでは一時的に含めていません。

Release Assetsには、Web Installerで使用するmerged binaryを公開しています。

### v0.1.5で実機確認した内容

ESP32-WROOM-32で次の動作を確認しています。

- 公開Web Installerからのファームウェア書き込み
- USB / Web Serial接続
- GPIO
- DHT11 / DHT22
- OLED
- ESP-NOW
- merged binaryから書き込んだ状態でのESP-NOW通信

---

## 7. ESP-NOWと学校ネットワーク

ESP32 Education Editorでは、ESP32同士の通信にESP-NOWを利用できます。

```text
Chromebook
   │
   │ USB / Web Serial
   ↓
 ESP32 A
   ↕
 ESP-NOW
   ↕
 ESP32 B
```

ESP32 AとESP32 BのESP-NOW通信では、学校Wi-Fiや校内LANを使用しません。

そのため、ESP32を学校Wi-Fiへ登録せずに、次のような通信学習を行うことができます。

- MACアドレス
- 送信と受信
- ブロードキャスト
- ユニキャスト
- RSSI
- 通信距離
- データ欠損
- センサネットワーク

GitHub Pages版を最初に読み込む際にはインターネット接続が必要ですが、ESP-NOW通信そのものは学校Wi-Fiを経由しません。

---

## 8. 対応ブラウザ

Web Serialを利用するため、Chromium系ブラウザを推奨します。

主な利用環境:

- Google Chrome
- ChromeOS / Chromebook
- Microsoft Edge

ブラウザやOSのWeb Serial対応状況によっては利用できない場合があります。

---

## 9. 開発者向け

このリポジトリはESP32 Education Editorのソースコードを管理しています。

基本的なビルド:

```bash
npm ci
npm run build
```

GitHub Actionsでビルドし、GitHub Pagesへ公開しています。

開発では、原則として次の流れで変更を管理しています。

```text
main
  ↓
作業ブランチ
  ↓
Pull Request
  ↓
GitHub Actions
  ↓
mainへMerge
  ↓
GitHub PagesへDeploy
```

---

## 10. バージョン管理

EditorとFirmwareは別々に管理します。

| 種類 | バージョン例 |
|---|---|
| ESP32 Education Editor | `v0.4` |
| ESP32共通Firmware | `firmware-v0.1.5` |

Firmwareのタグには `firmware-` を付け、Editor本体のバージョンと区別します。

---

## 11. 開発状況

ESP32 Education Editorは、教育現場での利用を想定して継続開発中です。

現在はESP32-WROOM-32を中心に実機確認を行っています。

今後は、実際の授業や教材での利用結果をもとに、操作性、対応機器、通信機能などを改善していく予定です。

---

## 12. Scratchについて

ESP32 Education Editorは、Scratch Foundationが公開しているオープンソースのScratch Editorをベースに開発しています。

本プロジェクトはScratch Foundationの公式製品ではありません。

ScratchおよびScratchロゴ等の権利は、それぞれの権利者に帰属します。

---

## 13. License

ライセンスについては、このリポジトリの `LICENSE` を参照してください。

---

## 14. Author

**Davinichi**

GitHub:

https://github.com/davinichi

---

# English Summary

**ESP32 Education Editor** is an educational Scratch-style block programming environment for ESP32.

It is designed to let students use ESP32-WROOM-32 from a Chromebook or PC browser without installing a traditional Arduino development environment.

Main features include:

- USB communication via Web Serial
- Common ESP32 firmware
- GPIO
- DHT11 / DHT22
- SSD1306 OLED
- ESP-NOW
- Environmental calculations
- Data processing
- Browser-based firmware installation

Public Editor:

https://davinichi.github.io/

Firmware Installer:

https://davinichi.github.io/firmware/

Repository:

https://github.com/davinichi/ESP32-Education-Editor

Latest official common firmware:

https://github.com/davinichi/ESP32-Education-Editor/releases/tag/firmware-v0.1.5

The current official firmware release has been verified on ESP32-WROOM-32.

Firmware v0.1.5 prioritizes stable ESP-NOW operation. BLE UART is temporarily excluded from this release.

This project is based on the open-source Scratch Editor and is not an official Scratch Foundation product.

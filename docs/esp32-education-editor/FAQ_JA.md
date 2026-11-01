# FAQ / トラブルシューティング

日本語 | [English](FAQ_EN.md)

[README](../../README.md) · [はじめ方](GETTING_STARTED_JA.md)

このページはESP32 Education Editor v1.0、Firmware v1.0.0、ESP32-WROOM-32を対象にしています。Editorには12カテゴリー、64個の公開ブロックがあり、既存プロジェクト互換用の非表示ブロックが1個内部に残っています。

## まず確認すること

問題が起きたら、上から順に確認してください。

1. ボードが対象の **ESP32-WROOM-32** である。
2. **Firmware v1.0.0** を書き込んでいる。
3. **Chrome / Edge** など、Web Serial対応ブラウザを使っている。
4. ボードがUSBで接続されている。
5. Arduino IDEのSerial Monitorなど、別のアプリが同じシリアルポートを使用していない。

### Chromebook・WindowsとWeb Serial

- **Chromebook**: Chromeで公開InstallerとEditorを開きます。Linux環境やArduino IDEの設定は不要です。学校管理の端末でUSBシリアルの利用やサイトへのアクセスが制限されている場合は、学校の管理者に許可設定を確認してください。
- **Windows**: Web Serial対応のChromeまたはEdgeを使います。デバイス マネージャーの「ポート（COMとLPT）」でUSBシリアル機器を確認できます。認識されない場合はボードのUSBシリアルチップを確認し、ボードメーカーの案内する対応ドライバーを使用してください。
- **共通**: データ通信対応USBケーブルを使い、ブラウザのポート選択画面で接続したESP32を選んで許可します。Web SerialはHTTPSなどの安全なコンテキストと利用者の許可が必要です。公開HTTPSリンクを使ってください。充電専用ケーブルでは接続できません。
- Installer、Editor、シリアルモニターで同じポートを同時に使えません。切り替える前に切断し、必要なら前のタブを閉じてください。USBを抜いた後はEditorから手動で再接続します。

### Firmwareバージョンを確認する

接続後、ESP32 Connectionの「ESP32のFirmwareバージョン」をクリックするか、チェックを入れてモニター表示し、`1.0.0`であることを確認します。接続時に自動取得され、「ESP32の状態を更新」でも再取得できます。「ESP32の状態」が`OK`であることも確認してください。

「不明（Firmware v1.0.0を推奨）」や古いバージョンが表示される場合は、Editorを切断し、Installerでv1.0.0を書き込んでから再接続します。`SYS:READY:OK`だけではバージョンは判定できません。通信仕様上の確認は`SYS:VERSION`への応答`SYS:VERSION:1.0.0`です（通常はブロックで確認でき、コマンドの手入力は不要です）。

## よくある質問

### 1. ESP32 Education Editorを使うには何が必要ですか？

ESP32-WROOM-32、USB接続、Web Serialに対応するブラウザ（ChromeまたはEdgeなど）、Firmware v1.0.0が必要です。公開Editorは[こちら](https://davinichi.github.io/)です。EditorとボードはUSB / Web Serialで通信します。

### 2. Arduino IDEは必要ですか？

Firmware Installerを使う場合、Firmwareを書き込むためにArduino IDEや追加ライブラリを準備する必要はありません。[Firmware Installer](https://davinichi.github.io/firmware/)を開き、画面の案内に従ってください。

詳しい機能と確認方法は[Firmwareガイド](FIRMWARE_GUIDE_JA.md)を参照してください。

### 3. ESP32がEditorに接続できません

次の順に確認してください。

1. 対象ボードがESP32-WROOM-32か確認します。
2. USBケーブルで接続されているか確認します。
3. Firmware v1.0.0を書き込んだか確認します。必要ならInstallerから書き込み直します。
4. Chrome / EdgeなどWeb Serial対応ブラウザで公開Editorを開きます。
5. 接続時にブラウザのポート選択画面でESP32のシリアルポートを選びます。
6. Arduino IDEのSerial Monitorなど、ポートを使う他のアプリを閉じてから再接続します。

### 4. シリアルポートが表示されません

Web Serial対応ブラウザを使っているか、ESP32-WROOM-32がUSB接続されているか確認してください。USBケーブルはデータ通信に対応したものを使ってください。充電専用ケーブルではデータ通信できません。Arduino IDEのSerial Monitorや別のEditorなど、ポートを使用中のアプリがあれば閉じてから、ポート選択画面を開き直してください。

### 5. Firmware Installerが動きません

Chrome / EdgeなどWeb Serial対応ブラウザで、InstallerをHTTPSまたはlocalhostから開いてください。公開Installerは[HTTPSで配信](https://davinichi.github.io/firmware/)されています。USBでESP32-WROOM-32を接続し、ポートを選択してください。Installerの対象はESP32-WROOM-32です。

### 6. Firmwareを書き込んでもEditorに接続できません

対象ボードがESP32-WROOM-32で、Firmware v1.0.0が書き込まれていることを確認してください。EditorはChrome / EdgeなどWeb Serial対応ブラウザからUSB接続します。書き込み後は、同じポートを使うSerial Monitorなどのアプリを閉じてEditorから接続してください。接続後は「ESP32の状態を更新」を実行し、状態`OK`とFirmwareバージョン`1.0.0`を確認します。

### 7. Arduino IDEのSerial MonitorとEditorを同時に使えますか？

同じシリアルポートをSerial MonitorとEditorから同時に使うことはできません。接続または書き込みの前に、ポートを使用している他のアプリを閉じてください。

### 8. 学校のWi-FiにESP32を接続する必要がありますか？

ESP-NOWでESP32同士が直接通信するために、学校のWi-Fiアクセスポイントや校内LANへ接続する必要はありません。インターネット接続も不要です。

### 9. インターネット接続は必要ですか？

公開EditorとFirmware InstallerをWebから読み込むにはインターネット接続が必要です。一方、ESP-NOWによるESP32同士の通信自体にはインターネットは必要ありません。このページでは、Webページを読み込んだ後に完全オフラインで利用できるとは保証していません。

### 10. ESP32-WROOM-32以外のESP32でも使えますか？

現在の正式な対象はESP32-WROOM-32です。Arduino IDEでFirmwareを扱う場合のボード選択名はESP32 Dev Moduleです。これは別のESP32ボードへの対応を示すものではありません。

### 11. ESP-NOWで通信できません

送信ブロックで宛先MACアドレスを指定している場合、相手のMACアドレスが正しいか確認してください。宛先MAC欄を空にするとブロードキャストになります。通信するボード同士が同じWi-Fiチャンネルを使っているかも確認してください。Firmware v1.0.0はチャンネル1で起動し、設定したチャンネルは再起動後に1へ戻ります。また、ESP-NOW拡張を使ったプログラムになっているか確認してください。

### 12. センサーや周辺機器が動きません

接続線、ブロックで選択したGPIO、電源接続を確認してください。また、機器に対応する拡張カテゴリーのブロックを使っているか確認します（例：DHTはESP32 DHT、OLEDはESP32 OLED、HC-SR04はESP32 Ultrasonic）。機器ごとの配線は、その機器と既存ガイドの説明に従ってください。このFAQでは未確認のピン配置を指定していません。

### 13. HC-SR04を使うときの注意はありますか？

HC-SR04のECHO出力は約5 Vです。**ECHOをESP32へ直接接続して5 Vを入力しないでください。ESP32の入力は3.3 V以下にしてください。**[Firmware v0.1.8リリースノート](https://davinichi.github.io/firmware/RELEASE_NOTES_firmware-v0.1.8.md)には、抵抗分圧の例としてECHOからESP32入力側へ直列1 kΩ、入力側からGNDへ2 kΩを接続する回路が示されています。配線前に資料を確認してください。

### 14. EditorやFirmware Installerの表示言語を切り替えられますか？

はい。EditorとFirmware Installerは日本語／英語に対応しています。Editorは **Settings → Language**、Installerはページ上部の言語切替を使います。

### 15. 日本語で作ったプロジェクトを英語表示で開けますか？

ブロックの表示文は選択言語に応じて変わり、拡張IDやopcodeなどの内部識別子は言語切替で変わりません。現行の統合テストでは、ESP32拡張ブロックを含むテスト用プロジェクトについて、日本語から英語、英語から日本語の両方向で読み込み、ブロックデータが保持されることを確認しています。このテスト範囲を超えるすべての既存プロジェクトについて、互換性を保証するものではありません。

## 旧版資料

[Editor v0.6 / Firmware v0.1.8のFAQ（履歴）](history/v0.6/FAQ_JA.md)を保持しています。現行の導入手順は[はじめ方](GETTING_STARTED_JA.md)、開発者向けビルドは[v1.0マニュアル](V1_MANUAL_JA.md#developer-build)を参照してください。

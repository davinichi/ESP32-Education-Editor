# Editor v1.0 / Firmware v1.0.0 — Release candidate

## Changes / 変更

- Shared Wire on GPIO21/22 for OLED, I2C Scanner, BME280 and INA219.
- I2C Scanner: scan command, results reporter and address-found predicate.
- BME280: selectable 0x76/0x77, temperature °C, humidity %, pressure hPa and status.
- INA219: selectable 0x40–0x4F, bus voltage V, current mA, power mW, shunt voltage mV and status.
- `SYS:VERSION` → `SYS:VERSION:1.0.0`; automatic retrieval and localized connection reporter.
- Japanese/English blocks and extension cards. 12 categories, 64 public blocks.
- v0.1.8 functionality retained; historical firmware sources unchanged.

[検証結果 / Validation results](CHECK_RESULTS_V1_JA.md)

## Release gate / 公開前の実機確認

### 実機からの報告

接続・バージョン確認、OLED=0x3C/BME280=0x76のスキャン、BME280の読み取り、OLEDへの測定値表示をユーザーが確認しました。ただし、温度180.25℃、湿度100％、気圧−132.03hPaが時々出るとの報告があり、OLEDへの表示更新を止めても発生しています。個体不良か通信・配線・電源などの問題かは未確定です。BME280単体での切り分けと原因解消が済むまで、この測定は安定動作確認済みとは扱いません。範囲外の値を`OK`として通す判定不足を修正しました。

追加報告: ESP32のUSB再接続と配線確認後、異常値が出なくなったとのことです。原因は確定しておらず、範囲外判定修正によって測定異常が解消したとは扱いません。現在の構成で連続測定と電源再投入後の再現性を確認します。

- [x] 初期実装のv1.0.0を書き込み、接続とバージョンを確認（ユーザー報告）。
- [ ] 範囲外判定を修正したFirmwareの実機確認。
- [ ] OLED+BME280+INA219同時接続でスキャンし、各初期化順・繰り返し初期化後も全機器が動作することを確認。
- [ ] I2C機器なし・機器取り外し・別アドレス・不正アドレスの応答を確認。
- [ ] BME280温湿度・気圧とINA219電圧・電流・電力の実測値を基準計器と比較。
- [ ] GPIO↔PWMを同じピンで繰り返す。サーボ、HC-SR04、DHT、OLED部分消去、ESP-NOWの送受信・チャンネル・遠隔サーボを回帰確認。
- [ ] v0.1.8 Firmwareで接続し、既存機能の継続とバージョン不明表示を確認。
- [ ] 新旧プロジェクトの保存・再読込、日本語↔英語、複数スクリプト、USB切断・再接続をブラウザーで確認。
- [ ] 配布用バイナリー作成、`firmware-v1.0.0`タグ、Installer manifest `1.0.0`、公開Editor・Installer・最新版PDFを更新。

These hardware checks remain required before describing the release as verified stable. This branch does not create tags, flash boards, or deploy the public website/Installer.

実機検証を終えるまでは「確認済み正式安定版」として公開しません。タグ・配信先manifest・公開サイト・配布PDFはリリース作業時に更新します。

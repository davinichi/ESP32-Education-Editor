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

- [ ] ESP32-WROOM-32へv1.0.0を書き込み、再接続後にバージョンを確認。
- [ ] OLED+BME280+INA219同時接続でスキャンし、各初期化順・繰り返し初期化後も全機器が動作することを確認。
- [ ] I2C機器なし・機器取り外し・別アドレス・不正アドレスの応答を確認。
- [ ] BME280温湿度・気圧とINA219電圧・電流・電力の実測値を基準計器と比較。
- [ ] GPIO↔PWMを同じピンで繰り返す。サーボ、HC-SR04、DHT、OLED部分消去、ESP-NOWの送受信・チャンネル・遠隔サーボを回帰確認。
- [ ] v0.1.8 Firmwareで接続し、既存機能の継続とバージョン不明表示を確認。
- [ ] 新旧プロジェクトの保存・再読込、日本語↔英語、複数スクリプト、USB切断・再接続をブラウザーで確認。
- [ ] 配布用バイナリー作成、`firmware-v1.0.0`タグ、Installer manifest `1.0.0`、公開Editor・Installer・最新版PDFを更新。

These hardware checks remain required before describing the release as verified stable. This branch does not create tags, flash boards, or deploy the public website/Installer.

実機検証を終えるまでは「確認済み正式安定版」として公開しません。タグ・配信先manifest・公開サイト・配布PDFはリリース作業時に更新します。

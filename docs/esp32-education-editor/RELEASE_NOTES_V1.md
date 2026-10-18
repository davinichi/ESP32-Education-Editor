# Editor v1.0 / Firmware v1.0.0 — Release candidate

## Changes / 変更

- Shared Wire on GPIO21/22 for OLED, I2C Scanner, BME280 and INA219.
- I2C Scanner: scan command, results reporter and address-found predicate.
- BME280: selectable 0x76/0x77, temperature °C, humidity %, pressure hPa and status.
- BME280: checked initialization/calibration transfers and one complete sample burst; transfer failures return `READ_ERROR` and the next successful read resumes measurements.
- INA219: selectable 0x40–0x4F, bus voltage V, current mA, power mW, shunt voltage mV and status.
- `SYS:VERSION` → `SYS:VERSION:1.0.0`; automatic retrieval and localized connection reporter.
- Japanese/English blocks and extension cards. 12 categories, 64 public blocks.
- v0.1.8 functionality retained; historical firmware sources unchanged.

[検証結果 / Validation results](CHECK_RESULTS_V1_JA.md)

## Release gate / 公開前の実機確認

### 実機からの報告

接続・バージョン確認、OLED=0x3C/BME280=0x76のスキャン、BME280の読み取り、OLEDへの測定値表示をユーザーが確認しました。ただし、温度180.25℃、湿度100％、気圧−132.03hPaが時々出るとの報告があり、OLEDへの表示更新を止めても発生しています。個体不良か通信・配線・電源などの問題かは未確定です。BME280単体での切り分けと原因解消が済むまで、この測定は安定動作確認済みとは扱いません。範囲外の値を`OK`として通す判定不足を修正しました。

追加ログ: 配線確認後にも再発し、Editorの600回のログで気温180.85℃が2回、気圧1278.53hPaが1回記録され、いずれも状態は`OK`でした。単独診断781回のログでは7測定周期にI2C NACKが記録され、そのうち3回は受信失敗、3回は範囲外値、1回は正常範囲の値として通っていました。5cm程度の配線を交換しても再発したとの報告を受けています。ESP32本体交換後の単独診断651回（約10分53秒）は通信エラー・異常値ともになしと確認しました。旧ESP32側の通信経路を疑う材料ですが、電気的な原因の特定は未完了です。実際のデータ転送の成否を確認するドライバーへ修正し、範囲判定だけに依存しないようにしました。改訂版配布後のEditorログ381回（734.61秒）では、258.06秒の1回が全項目`READ_ERROR`・値空欄となり、259.18秒の次回には全項目`OK`と正常値へ復帰しました。他の380回は`OK`で、範囲外の数値はありませんでした。通信失敗時の値の抑止と復帰はこのログで確認できました。長期の安定性と測定精度は継続確認です。

- [x] 初期実装のv1.0.0を書き込み、接続とバージョンを確認（ユーザー報告）。
- [x] 失敗時の`READ_ERROR`・値の空欄・次回成功時の復帰をEditorの実機ログで確認（381回中、失敗1回、次回復帰）。
- [ ] 改訂版FirmwareでOLED+BME280を併用し、表示更新・失敗時の表示・初期化後のスキャンを再確認。
- [ ] OLED+BME280+INA219同時接続でスキャンし、各初期化順・繰り返し初期化後も全機器が動作することを確認。
- [ ] I2C機器なし・機器取り外し・別アドレス・不正アドレスの応答を確認。
- [ ] BME280温湿度・気圧とINA219電圧・電流・電力の実測値を基準計器と比較。
- [x] GPIO・PWMの実機動作を確認（ユーザー報告）。
- [x] DHT11の実機動作を確認（ユーザー報告）。
- [ ] GPIO↔PWMの同一ピンでの繰り返し切り替えについて、具体的な確認範囲を記録。
- [ ] サーボ、HC-SR04、DHT22、OLED部分消去、ESP-NOWの送受信・チャンネル・遠隔サーボを回帰確認。
- [ ] v0.1.8 Firmwareで接続し、既存機能の継続とバージョン不明表示を確認。
- [ ] 新旧プロジェクトの保存・再読込、日本語↔英語、複数スクリプト、USB切断・再接続をブラウザーで確認。
- [ ] 配布用バイナリー作成、`firmware-v1.0.0`タグ、Installer manifest `1.0.0`、公開Editor・Installer・最新版PDFを更新。

These hardware checks remain required before describing the release as verified stable. This branch does not create tags, flash boards, or deploy the public website/Installer.

実機検証を終えるまでは「確認済み正式安定版」として公開しません。タグ・配信先manifest・公開サイト・配布PDFはリリース作業時に更新します。

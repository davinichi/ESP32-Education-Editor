# v1.0 検証結果

実施日: 2026-10-18（日本時間）
対象: Editor v1.0 / Firmware v1.0.0
基点main: `5f19d538b862dfb8bffbb1a31cf88665c51de1b8`
作業ブランチ: `feat/editor-v1-i2c-sensors`

## 実装

I2C Scanner → BME280 → INA219 → SYS:VERSIONの順にFirmwareを追加し、Editor登録・日英表示・ドキュメントを更新しました。12カテゴリー・64公開ブロックです。Firmware v0.1.8のソースは保持し、既存36関数の実装本文が新Firmwareと一致することを確認しました。変更した既存関数はOLEDの共有Wire初期化とコマンド振り分けです。

## 自動確認

| 確認 | 結果 |
|---|---|
| `npm ci --cache <作業用キャッシュ>` | 成功。ブラウザー追加ダウンロードを省略 |
| ルートの`npm run build` | 成功。全workspace・GUI通常版・単独配布版を含む |
| ESP32 VM回帰テスト | 1,309件成功、失敗0 |
| ESP32 GUI回帰テスト | 3スイート・5件成功、失敗0 |
| 新規JS・新規テストのESLint | エラー0、警告0 |
| 変更GUIファイルのESLint | エラー0。既存Aboutコードの警告3件 |
| 既存Transport/ConnectionのLint比較 | mainと同じエラー25件・警告15件。新規指摘0 |
| VM / GUI `i18n:src` | 両方成功。生成される翻訳ソースは既存の除外設定に従う |
| `git diff --check` | 成功 |
| Arduino-ESP32 3.2.1 / ESP32 Dev Module | Firmwareコンパイル成功 |

Node.js: 24.18.0、npm: 11.16.0、Arduino CLI: 1.5.1。
Windowsで既存GUIの`BUILD_TYPE=dev webpack`が実行できなかったため、既存依存の`cross-env`を使う1行の修正を含みます。

GitHubの既存CIは、呼び出し元が再利用テストworkflowの結果記録権限を許可しておらず、実行開始前に停止しました。呼び出し側のテストjobに、既存の結果記録jobが要求している`contents: read`、`checks: write`、`issues: read`、`pull-requests: write`を明示しました。GitHub上の実行結果はPRのChecksで確認してください。

Firmware使用量: プログラム995,010 / 1,310,720 bytes（75%）、グローバル変数45,416 / 327,680 bytes（13%）。
使用ライブラリ: Adafruit BME280 2.3.0、INA219 1.2.3、BusIO 1.17.4、GFX 1.12.6、SSD1306 2.5.17、Unified Sensor 1.1.15、DHT sensor library 1.4.7。

## 再実行

```sh
npm ci
npm run build
npm exec --workspace packages/scratch-vm -- tap --disable-coverage test/integration/esp32-*.js
npm exec --workspace packages/scratch-gui -- jest --runInBand --runTestsByPath test/unit/reducers/esp32-locales.test.jsx test/unit/components/esp32-menu-i18n.test.jsx test/unit/util/esp32-about.test.js
arduino-cli compile --fqbn esp32:esp32:esp32 firmware/esp32-education-editor/esp32_education_editor_firmware_v1_0_0
```

新規テストは、スキャン結果・空応答・不正応答・未対応Firmware、センサーの値とエラー、並行要求、タイムアウト、切断時のクリア、分割受信、接続時の自動バージョン要求を確認します。既存テストは日英切替、新旧ブロックの保存・再読込、WBGT互換ブロック、メニューとAboutを確認します。

## 未実施・公開前の確認

### 実機報告に基づく追加修正

ユーザーのIDEASPARK ESP-WROOM-32（OLED一体型）で接続・バージョン表示、0x3C/0x76のスキャン、BME280測定とOLED表示を確認しました。一方、Editor上にも温度180.25℃、湿度100％、気圧−132.03hPaが時々出ると報告されています。OLEDへの表示更新を止めても発生します。原因は未確定で、個体不良と断定していません。

報告値を使う再現テストは修正前に18項目失敗し、メーカー仕様範囲外の値が`OK`として通る判定不足を確認しました。FirmwareとEditorで範囲外の値を`READ_ERROR`とし、数値を丸めず、過去値でも置き換えない修正を追加しました。湿度100％と仕様範囲の境界は引き続き正常値として許容します。

追加修正後: ESP32回帰テスト1,333件成功、新規・変更対象のESLint成功、scratch-vmのビルド成功、Firmwareコンパイル成功（プログラム995,130 bytes、グローバル変数45,416 bytes）。GUI全体ビルドの成功は上記初期実装時の結果です。現在開いているテスト用Editorのページを自動で更新したり、実機へ書き込んだりはしていません。この時点では測定異常の発生原因と修正Firmwareの実機確認が未解決でした。下記の追加検証に続きます。

続報: 3.3V接続・約5cmのジャンパー線・ブレッドボード配線を確認。USB再接続と配線確認後に一時回復しましたが、配線交換後にも再発しました。Editorの600回のログでは3行で範囲外値が出ており、状態はいずれも`OK`でした。単独診断781回のログでは7測定周期にI2C NACKが記録されました。内訳は3回が明示的な受信失敗、3回が範囲外値、1回が正常範囲の値として通った読み取りです。通信失敗が観測されたことと、その電気的原因を特定したことは区別しています。

通信失敗への追加修正: 同梱`BME280Checked.h`で初期化・校正データの転送成否を確認し、測定データ8バイトを1回の連続転送で取得します。NACK・受信不足などでは補正計算を行わず`READ_ERROR`を返します。値を過去値で置き換えず、次の成功した読み取りで復帰します。Adafruit BME280 2.3.0の補正式とBSDライセンスを保持しています。

Host C++回帰テスト: データ転送だけがNACKとなる場合、送受信不足、初期化失敗、校正待ちのタイムアウト、サンプル無効値、正常値への復帰、湿度0%/100%、0x76/0x77、および温度・気圧の基準ベクトルを検証しました。通信失敗の戻り値を無視する比較版では正常範囲の値が通ってテストが失敗し、修正版では全ケースが成功しました。アドレス・未定義動作サニタイザーも有効にしています。EditorのESP32回帰テスト1,333件も成功しました。

追加修正版のESP32コンパイル: Arduino-ESP32 3.2.1 / ESP32 Dev Moduleで成功。プログラム994,142 bytes（75%）、グローバル変数45,376 bytes（13%）。現在開いているEditorの再ビルド・再読み込みや、実機への自動書き込みは行っていません。修正版Firmwareは既存Editorの`READ_ERROR`処理と互換です。

ESP32本体交換後の単独診断ログ: 651回、記録区間653.25秒でNACK・`INVALID`・`I2C_ERROR`なし。温度28.20～28.38℃、湿度45.75～48.02%、気圧1022.81～1023.15hPa。ユーザーが本体交換後の測定と確認しています。同じBME280で交換後に改善したことは旧ESP32側の通信経路を疑う材料ですが、故障箇所の特定や修正版Firmwareの実機検証とは区別します。

改訂版配布後のEditorログ: 381回、0.00～734.61秒。231回目（258.06秒）は温度・湿度・気圧の値がすべて空欄、状態はすべて`READ_ERROR`。232回目（259.18秒）には28.29℃・43.16%・1022.78hPa、全項目`OK`へ復帰しました。他の380回はすべて`OK`で、仕様範囲外の数値はありませんでした。失敗時の値の抑止と次回成功時の復帰をログ上で確認しました。記録は381回であり、600回完了とは扱いません。

BME280の長期安定動作・測定精度、改訂版でのOLED併用、INA219、実機での旧機能全体の回帰確認は未確認です。全workspaceの`npm test`およびブラウザーE2Eテストは実施していません。Lint全体は既存指摘を含むため「全体Lint成功」とはしていません。

公開サイト・Installer・manifest・GitHub Release/tagは更新していません。既存PDFは旧版の資料として保持し、v1.0の日英マニュアルをMarkdownで追加しました。公開前の具体的な実機確認・配信項目は[リリース情報](RELEASE_NOTES_V1.md)に記載しています。

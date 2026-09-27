# ESP32 Education Editor Change Log

## v0.4 - 2026-09-27

### Added

- データ処理に「数値を小数点以下の指定桁数で表示」するレポーターブロックを追加
  - 例：`25.376` を2桁 -> `25.38`
  - 例：`25` を2桁 -> `25.00`
  - 表示用文字列として返し、末尾の0を保持

### Changed

- Web SerialでUSBケーブルが抜かれた場合の切断処理を強化
- 接続状態、reader / writer / port を安全に整理する処理を追加
- USBを挿し直しても自動再接続しない方針を明確化
- 再接続は利用者が「ESP32に接続する」を実行して行う

### Verification

- v0.4開発チェック：PASS 8 / FAIL 0
- USBケーブル切断・手動再接続：実機確認済み
- 小数点以下の表示桁数指定：実機確認済み
- ESP32ファームウェア変更なし

## v0.3.3 - 2026-09-26

- ESP32 Education Editor / Davinichi のブランド表示を整理
- 専用Aboutページを追加
- Fileメニュー主要項目を日本語表示へ補正
- `menu-bar.jsx` を変更しない安全なブランド変更方式を採用

## v0.2 - 2026-09-25

- ESP32向け7拡張をScratch Editorへ統合
- ESP32 接続 / GPIO / DHT / OLED / ESP-NOW / 環境指数 / データ処理
- 共通Web Serial Transportを採用
- GitHub Pages公開版からESP32実機接続を確認

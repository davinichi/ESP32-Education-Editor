# ESP32 Education Editor バックアップ・レストア手順書

## 1. この手順書について

この文書は、ESP32 Education Editor の開発環境を安全にバックアップし、PC の故障や環境の再構築が必要になった場合に復元するための手順をまとめたものです。

対象は現在の **Backup Tool Ver.1（`backup_project.ps1` v1.0.0）** です。

- Source Repository: `C:\ESP32-Education-Editor`
- Pages Repository: `C:\davinichi.github.io`
- Editor: v0.6
- Firmware: v0.1.7
- 主なバックアップ先の例: `F:\ESP32_Backup`

> **重要**
>
> Backup Tool Ver.1 は自動実行ではありません。
> バックアップは、必要なときに PowerShell から手動で実行します。
>
> また、Source Repository と Pages Repository のどちらかに未コミットの変更がある場合、バックアップは開始されません。

---

## 2. バックアップの目的

このバックアップでは、単に現在のソースコードをコピーするだけではなく、次の情報を保存します。

- ESP32 Education Editor の Git 履歴・ブランチ・タグ
- GitHub Pages Repository の Git 履歴・ブランチ・タグ
- Firmware v0.1.7 の Arduino ソース
- Firmware v0.1.7 の書き込み用 merged binary
- Firmware の `manifest.json`
- Firmware の SHA-256 チェックサム
- Firmware v0.1.7 の Release Notes
- バックアップ時の Repository 情報
- バックアップ時の Windows / PowerShell / Git / Node.js / npm / Arduino CLI / ESP32 Arduino Core の環境情報
- 復元時の簡易手順
- バックアップファイル全体の SHA-256 チェックサム

これにより、GitHub が利用できない場合や開発 PC が故障した場合でも、バックアップから開発 Repository を再構築できます。

---

## 3. バックアップされないもの

Backup Tool Ver.1 では、次のものはバックアップ対象ではありません。

- 未コミットの変更
- Git の ignored files
- `node_modules`
- Git の認証情報やアクセストークン
- Git のローカル設定
- Node.js 本体
- npm 本体
- Arduino IDE 本体
- Arduino CLI 本体
- ESP32 Arduino Core 本体
- その他の外部ツールチェーン

これらのうち開発環境のバージョン情報は `ENVIRONMENT.txt` に記録されますが、プログラム本体はバックアップに含まれません。

---

# 第I部 バックアップ

## 4. バックアップ前の確認

### 4.1 外部バックアップ先を確認する

例として、外付けドライブ `F:` に次のフォルダーを使用します。

```text
F:\ESP32_Backup
```

バックアップ先は、次の Repository の内部に指定しないでください。

```text
C:\ESP32-Education-Editor
C:\davinichi.github.io
```

---

### 4.2 Source Repository の状態を確認する

PowerShell を開き、次を実行します。

```powershell
cd C:\ESP32-Education-Editor
git status
```

正常な例:

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

---

### 4.3 Pages Repository の状態を確認する

```powershell
cd C:\davinichi.github.io
git status
```

こちらも、

```text
nothing to commit, working tree clean
```

になっていることを確認します。

> Backup Tool 自身も両 Repository を確認します。
> 未コミット・未追跡のファイルがある場合は `FAIL` となり、バックアップは開始されません。

---

## 5. 手動バックアップの実行

Source Repository に移動します。

```powershell
cd C:\ESP32-Education-Editor
```

バックアップ先がまだ存在しない場合は、必要に応じて作成します。

```powershell
New-Item -ItemType Directory -Force F:\ESP32_Backup
```

Backup Tool を実行します。

```powershell
.\scripts\backup_project.ps1 -BackupRoot F:\ESP32_Backup
```

---

## 6. 正常終了の確認

正常に終了すると、最後に次のような表示になります。

```text
============================================================
 Backup completed successfully.
 PASS: 16  WARNING: 0  FAIL: 0
============================================================
```

`FAIL: 0` であることを確認してください。

環境情報を取得できない場合などは `WARNING` が表示されることがあります。
`FAIL` が 1 以上の場合、そのバックアップは正常完了していません。

---

## 7. 作成されるバックアップ

バックアップ先には、実行日時を含むフォルダーが作成されます。

例:

```text
F:\ESP32_Backup\
└─ ESP32_Education_Editor_Backup_2026-10-08_0955\
```

主な内容は次のとおりです。

```text
ESP32_Education_Editor_Backup_YYYY-MM-DD_HHmm\
├─ repositories\
│  ├─ ESP32-Education-Editor.bundle
│  └─ davinichi.github.io.bundle
├─ firmware-v0.1.7\
│  ├─ esp32_education_editor_firmware_v0_1_7.ino
│  ├─ esp32_education_editor_firmware_v0_1_7.ino.merged.bin
│  ├─ manifest.json
│  ├─ SHA256SUMS.txt
│  └─ RELEASE_NOTES_firmware-v0.1.7.md
├─ BACKUP_INFO.txt
├─ ENVIRONMENT.txt
├─ RESTORE_GUIDE.txt
└─ BACKUP_SHA256SUMS.txt
```

---

## 8. 各ファイルの役割

### `ESP32-Education-Editor.bundle`

ESP32 Education Editor の Git Repository を復元するための bundle です。

### `davinichi.github.io.bundle`

GitHub Pages Repository を復元するための bundle です。

### `firmware-v0.1.7`

Firmware v0.1.7 のソース、書き込み用 binary、manifest、チェックサム、Release Notes を保存します。

### `BACKUP_INFO.txt`

バックアップ日時、コンピューター名、Repository のパス、ブランチ、HEAD commit、remote URL などが記録されています。

### `ENVIRONMENT.txt`

バックアップ時の開発環境情報が記録されています。

主な項目:

- Windows
- PowerShell
- Git
- Node.js
- npm
- Arduino CLI
- ESP32 Arduino Core

### `RESTORE_GUIDE.txt`

緊急時にバックアップフォルダーだけを参照して復元できるようにした簡易手順です。

### `BACKUP_SHA256SUMS.txt`

バックアップ内の主要ファイルの SHA-256 が記録されています。
バックアップファイルの破損確認に使用します。

---

## 9. `.INCOMPLETE` フォルダーについて

バックアップ処理の途中でエラーが発生した場合、フォルダー名の末尾に、

```text
.INCOMPLETE
```

が付いた状態で残ることがあります。

例:

```text
ESP32_Education_Editor_Backup_2026-10-08_1000.INCOMPLETE
```

このフォルダーは **正常なバックアップとして使用しないでください**。

原因を確認してから再度バックアップを実行します。

---

## 10. バックアップ後に確認すること

バックアップが成功したら、最低限次を確認してください。

```text
1. 完成したバックアップフォルダーが存在する
2. フォルダー名に .INCOMPLETE が付いていない
3. repositories フォルダーに2個の .bundle がある
4. firmware-v0.1.7 に merged.bin がある
5. BACKUP_INFO.txt がある
6. ENVIRONMENT.txt がある
7. BACKUP_SHA256SUMS.txt がある
```

---

# 第II部 レストア

## 11. レストアを行う場面

次のような場合にレストアを行います。

- 開発 PC が故障した
- SSD / HDD を交換した
- Windows を再インストールした
- Repository を誤って削除した
- GitHub から取得できない状況で開発環境を復元したい
- バックアップ時点の開発状態を別の PC に再構築したい

---

## 12. レストア前の準備

復元に使用するバックアップフォルダーを選びます。

例:

```text
F:\ESP32_Backup\ESP32_Education_Editor_Backup_2026-10-08_0955
```

`.INCOMPLETE` が付いたフォルダーは使用しません。

まず次のファイルを確認してください。

```text
BACKUP_INFO.txt
ENVIRONMENT.txt
RESTORE_GUIDE.txt
BACKUP_SHA256SUMS.txt
```

---

## 13. バックアップファイルの破損確認

復元前に `BACKUP_SHA256SUMS.txt` を使って、可能な限りファイルが破損していないことを確認します。

PowerShell でバックアップフォルダーに移動します。

```powershell
cd F:\ESP32_Backup\ESP32_Education_Editor_Backup_2026-10-08_0955
```

個別ファイルを確認する例:

```powershell
Get-FileHash .\repositories\ESP32-Education-Editor.bundle -Algorithm SHA256
```

表示された SHA-256 と `BACKUP_SHA256SUMS.txt` に記録されている値が一致することを確認します。

重要な復旧では、Repository bundle、Firmware binary、`BACKUP_INFO.txt`、`ENVIRONMENT.txt` などについて確認することを推奨します。

---

## 14. Source Repository の復元

### 14.1 既存フォルダーを確認する

次のフォルダーがすでに存在する場合、すぐに上書きしないでください。

```text
C:\ESP32-Education-Editor
```

必要なデータが残っていないことを確認してから、別名に変更するか、別の復元先を使用します。

---

### 14.2 bundle から clone する

PowerShell で `repositories` フォルダーに移動します。

```powershell
cd F:\ESP32_Backup\ESP32_Education_Editor_Backup_2026-10-08_0955\repositories
```

Source Repository を復元します。

```powershell
git clone ESP32-Education-Editor.bundle C:\ESP32-Education-Editor
```

---

### 14.3 復元状態を確認する

```powershell
cd C:\ESP32-Education-Editor
git status
git log --oneline --decorate -5
```

`BACKUP_INFO.txt` に記録された Source branch と Source HEAD commit も確認してください。

---

## 15. Pages Repository の復元

`repositories` フォルダーから次を実行します。

```powershell
cd F:\ESP32_Backup\ESP32_Education_Editor_Backup_2026-10-08_0955\repositories

git clone davinichi.github.io.bundle C:\davinichi.github.io
```

確認します。

```powershell
cd C:\davinichi.github.io
git status
git log --oneline --decorate -5
```

`BACKUP_INFO.txt` に記録された Pages branch と Pages HEAD commit を確認してください。

---

## 16. GitHub remote の再設定

bundle から clone した直後は、`origin` が GitHub ではなく bundle ファイルを参照している場合があります。

まず確認します。

### Source Repository

```powershell
cd C:\ESP32-Education-Editor
git remote -v
```

GitHub に戻す場合:

```powershell
git remote set-url origin https://github.com/davinichi/ESP32-Education-Editor.git
git fetch origin
```

### Pages Repository

```powershell
cd C:\davinichi.github.io
git remote -v
```

GitHub に戻す場合:

```powershell
git remote set-url origin https://github.com/davinichi/davinichi.github.io.git
git fetch origin
```

> GitHub の認証情報やアクセストークンはバックアップに含まれていません。
> 必要に応じて、新しい PC 側で GitHub の認証を設定してください。

---

## 17. ブランチと HEAD の確認

復元後は `BACKUP_INFO.txt` を参照し、バックアップ時のブランチと HEAD commit を確認します。

例:

```powershell
git branch --show-current
git rev-parse HEAD
```

`BACKUP_INFO.txt` に記録された値と比較してください。

必要なブランチが選択されていない場合は、バックアップ情報を確認したうえで目的のブランチに切り替えます。

---

# 第III部 開発環境の再構築

## 18. `ENVIRONMENT.txt` を確認する

Repository の復元だけでは、開発環境すべてが元に戻るわけではありません。

バックアップ内の、

```text
ENVIRONMENT.txt
```

を開き、バックアップ時の環境を確認してください。

現在の検証環境では、ESP32 Arduino Core **3.2.1** が基準です。

---

## 19. 必要なソフトウェアを再構築する

必要に応じて次をインストール・設定します。

- Git
- Node.js
- npm
- Arduino IDE / Arduino CLI
- ESP32 Arduino Core
- その他、開発に必要なツール

インストールするバージョンは `ENVIRONMENT.txt` を参考にします。

> 復旧作業中にむやみに最新版へ更新するのではなく、まずバックアップ時の環境に近づけて動作確認することを推奨します。

---

## 20. Node.js 依存関係の再構築

`node_modules` はバックアップされません。

Source Repository で必要な依存関係を再構築します。

```powershell
cd C:\ESP32-Education-Editor
npm ci
```

`package-lock.json` に基づいて依存関係が再構築されます。

---

## 21. Source の検証

Repository と開発環境を復元したら、ESP32 Education Editor の既存検証スクリプトを使用します。

```powershell
cd C:\ESP32-Education-Editor
.\scripts\check_source.ps1
```

必要に応じて、ビルド検証も実行します。

```powershell
.\scripts\test_build.ps1
```

既知の WARNING がある場合は、過去の正常時の結果と比較してください。

---

# 第IV部 Firmware の復旧

## 22. Firmware v0.1.7 の保存場所

バックアップには Firmware v0.1.7 が保存されています。

```text
firmware-v0.1.7\
├─ esp32_education_editor_firmware_v0_1_7.ino
├─ esp32_education_editor_firmware_v0_1_7.ino.merged.bin
├─ manifest.json
├─ SHA256SUMS.txt
└─ RELEASE_NOTES_firmware-v0.1.7.md
```

---

## 23. merged binary の利用

次のファイルは、バックアップ時点で完成済みの書き込み用 Firmware です。

```text
esp32_education_editor_firmware_v0_1_7.ino.merged.bin
```

そのため、緊急時には Firmware を再コンパイルせず、保存済み binary を利用できます。

Firmware v0.1.7 の正式 SHA-256 は次の値です。

```text
53255551385AC31A10B2C1B7E3F5BFD0350E8907EA7FB4C0CDD43FBFFC07F4B1
```

確認する場合:

```powershell
Get-FileHash .\firmware-v0.1.7\esp32_education_editor_firmware_v0_1_7.ino.merged.bin -Algorithm SHA256
```

---

# 第V部 運用

## 24. バックアップを取るタイミング

Backup Tool Ver.1 は手動実行です。

少なくとも次のタイミングでバックアップすることを推奨します。

- Editor の正式バージョンを公開した後
- Firmware の正式バージョンを公開した後
- 大きな機能追加を完了した後
- Repository 構成を変更する前
- 開発 PC やストレージを変更する前
- 開発環境の大きな更新を行う前

必要に応じて、通常運用として週1回程度のバックアップも検討できます。

---

## 25. バックアップは複数世代残す

新しいバックアップが成功しても、直前のバックアップをすぐに削除しないことを推奨します。

例:

```text
F:\ESP32_Backup\
├─ ESP32_Education_Editor_Backup_2026-10-08_0955\
├─ ESP32_Education_Editor_Backup_2026-10-15_0900\
└─ ESP32_Education_Editor_Backup_2026-10-22_0910\
```

複数世代を残すことで、最新バックアップに問題があった場合でも以前の状態へ戻れます。

Backup Tool Ver.1 は既存の完成済みバックアップを自動削除しません。

---

## 26. 定期的にレストアテストを行う

バックアップは、作成できただけでは十分ではありません。

定期的に別の一時フォルダーなどを使用して、

```text
bundle から clone できる
     ↓
Git 履歴を確認できる
     ↓
必要な環境を再構築できる
     ↓
Source の検証が通る
```

ことを確認すると、バックアップの信頼性が高まります。

実際の `C:\ESP32-Education-Editor` を削除して試す必要はありません。
レストアテスト専用の別フォルダーを使用してください。

---

## 27. トラブル時の基本方針

復旧時に問題が起きた場合は、既存データをすぐに削除せず、次の順で確認します。

1. 元の PC / SSD に残っているデータを保護する
2. バックアップフォルダーが `.INCOMPLETE` でないことを確認する
3. `BACKUP_SHA256SUMS.txt` を確認する
4. `BACKUP_INFO.txt` で元の commit を確認する
5. `ENVIRONMENT.txt` で開発環境を確認する
6. bundle を別フォルダーへ clone して確認する
7. 問題がなければ正式な復旧先へ移行する

---

## 28. 現在の Backup Tool Ver.1 の位置づけ

Backup Tool Ver.1 は、ESP32 Education Editor の開発資産を **手動で、安全に、再現可能な形で保存するための基礎ツール**です。

現在の運用は次の流れです。

```text
開発
  ↓
commit / Pull Request / merge
  ↓
両 Repository が clean であることを確認
  ↓
backup_project.ps1 を手動実行
  ↓
外部ドライブへバックアップ
  ↓
PASS / FAIL を確認
  ↓
必要に応じてレストアテスト
```

自動スケジュール実行、世代管理、自動レストア検証などは Backup Tool Ver.1 には含まれていません。これらは将来の拡張として追加できます。

---

## 29. 関連ファイル

Backup Tool:

```text
scripts\backup_project.ps1
```

Source Repository:

```text
https://github.com/davinichi/ESP32-Education-Editor
```

GitHub Pages Repository:

```text
https://github.com/davinichi/davinichi.github.io
```

Firmware Installer:

```text
https://davinichi.github.io/firmware/
```

---

## 30. 最後に

バックアップで最も重要なのは、**「保存されていること」だけでなく、「実際に戻せること」**です。

ESP32 Education Editor では、

- Git bundle による Repository の保存
- Firmware binary の保存
- SHA-256 による整合性確認
- 開発環境情報の記録
- 復元手順の記録

を組み合わせることで、障害発生時にも開発を再開できる状態を維持します。

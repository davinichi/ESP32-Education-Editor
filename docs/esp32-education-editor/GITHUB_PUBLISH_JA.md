# GitHub公開手順

## 推奨する公開形態

Web版を将来公開することまで考える場合、**ESP32拡張だけの別リポジトリではなく、現在動作確認できているScratch EditorのフルソースをGitHubへ公開する**方法を推奨します。

これにより、公開Web版と対応するソースを同じリポジトリで管理できます。

推奨リポジトリ名：

```text
ESP32-Education-Editor
```

GitHub上の説明例：

```text
Educational ESP32 web editor with individually selectable GPIO, DHT, OLED, ESP-NOW, environment and data-processing extensions. Developed under the Davinichi brand by Toshikazu Shimada.
```

## 1. GitHubで空のリポジトリを作る

GitHubのDavinichiアカウントで、次の公開リポジトリを作成します。

```text
ESP32-Education-Editor
```

この時点ではREADMEやLICENSEをGitHub側で自動生成しない方が、現在のローカル履歴をそのままpushしやすくなります。

## 2. 現在のローカルScratch Editorを公開用に整える

このGitHub Kitのルートで：

```powershell
.\prepare_github_repo.cmd C:\scratch-editor
```

これにより、プロジェクトREADME、NOTICE、著作者情報、ファームウェア、文書が`C:\scratch-editor`へ追加されます。

既存のScratch Editorの`LICENSE`と`TRADEMARK`は変更しません。

## 3. Gitの変更を確認する

```powershell
cd C:\scratch-editor
git status
```

ESP32拡張コード、README、NOTICE、docs、firmware等が変更・追加対象として表示されます。

## 4. 公式Scratch Editorをupstreamとして残す

現在の`C:\scratch-editor`はScratch Foundationからcloneしているため、最初は`origin`が公式リポジトリを指している可能性があります。

確認：

```powershell
git remote -v
```

公式が`origin`なら：

```powershell
git remote rename origin upstream
```

次に自分のGitHubを`origin`として追加します。

```powershell
git remote add origin https://github.com/davinichi/ESP32-Education-Editor.git
```

確認：

```powershell
git remote -v
```

期待する構成：

```text
origin    https://github.com/davinichi/ESP32-Education-Editor.git
upstream  https://github.com/scratchfoundation/scratch-editor.git
```

## 5. 公開用ブランチを作る

```powershell
git switch -c esp32-education-v0.2
```

すでに同名ブランチがある場合は別名にしてください。

## 6. コミットする

```powershell
git add .
git commit -m "Add ESP32 Education Editor v0.2"
```

## 7. GitHubへpushする

```powershell
git push -u origin esp32-education-v0.2
```

最初はこのブランチのままGitHub上で内容を確認します。

問題がなければ、GitHub側で既定ブランチとして運用するか、`main`へ統合します。

## 8. 公開前にGitHub上で確認する項目

- READMEのプロジェクト名がESP32 Education Editorになっている
- Davinichiがブランドとして表示されている
- `Copyright (c) 2026 Toshikazu Shimada` が「追加部分」に対する表示になっている
- Scratch Editorの`LICENSE`が残っている
- Scratch Editorの`TRADEMARK`が残っている
- NOTICE.mdがある
- firmwareがある
- 7個の拡張ソースがある
- Scratch Foundationの公式製品と誤認させる説明がない

## Web公開について

GitHubへのソース公開と、Chromebook向けHTTPS Web版の公開は分けて進めます。

まずソースをGitHubで管理し、その後Web版のデプロイを設定します。

Scratch Editorはサブディレクトリ配置時のWeb Worker等のパスに注意が必要なため、GitHub Project Pagesへそのまま配置するより、ルートURLで配信できる構成（専用Pagesサイトまたはカスタムドメイン）を先にテストする方が安全です。

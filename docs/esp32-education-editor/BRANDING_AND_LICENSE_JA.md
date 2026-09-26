# ESP32 Education Editor v0.3.3 ブランド表示・ライセンス方針

## 名称

- 製品・プロジェクト名：**ESP32 Education Editor**
- ブランド名：**Davinichi**
- ESP32 Educationとして追加した部分の著作者：**Toshikazu Shimada**

## v0.3.3の安全なブランド変更

v0.3 / v0.3.1では `menu-bar.jsx` にAboutリンク等を追加したところ、Scratch Editor 15.1.1で実行時クラッシュが発生しました。

v0.3.3では方針を変更し、**`menu-bar.jsx` を一切変更しません**。

通常利用時の表示は次の方法で整理します。

- Scratch Editorが既に読み込んでいるヘッダー用ロゴSVGを、ESP32 Education Editor独自ワードマークへ差し替える
- Android用およびTime Travel用のヘッダーロゴも独自ワードマークへ差し替える
- ブラウザタイトルを **ESP32 Education Editor** へ変更
- faviconを独自アイコンへ変更
- ヘッダーロゴのAboutリンクは、Reactコンポーネントを変更せずブラウザテンプレート側の補助スクリプトで専用Aboutページを開く
- Fileメニューの主要項目を日本語表示へ補正する

Scratch Editor由来である事実は隠しません。`ABOUT_JA.md`、`NOTICE.md`、上流の`LICENSE`、`TRADEMARK`、README等で明示します。

## 変更しないもの

- `packages/scratch-gui/src/components/menu-bar/menu-bar.jsx`
- 上流の `LICENSE`
- 上流の `TRADEMARK`
- Scratch Editor由来のソースコード内部の名称や技術的識別子
- 上流コンポーネントの著作権表示

内部変数名、CSSクラス名、ファイル名などに `scratch` が残る場合があります。これはソース互換性と保守性のためです。

## 商標に関する表示

ESP32 Education EditorはScratch Foundationの公式製品ではなく、同財団による承認、推奨、スポンサーを示すものではありません。

Scratchの名称、ロゴ、Scratch Cat等の商標はScratch Foundationに帰属します。これらをESP32 Education Editorの製品ロゴ、GitHubソーシャルプレビュー、Davinichiの宣伝ブランドとして使用しない方針です。

## 著作権表示の範囲

`Copyright (c) 2026 Toshikazu Shimada` は、ESP32 Education Editorとして新たに追加・作成したESP32拡張、統合コード、ファームウェア、文書、独自ブランド素材などに対する表示です。

Scratch Editor本体や既存コンポーネント全体の著作権を意味するものではありません。

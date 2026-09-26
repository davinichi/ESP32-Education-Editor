# ESP32 Education Editor v0.3.3 ブランド変更後チェック

## 起動安全性

- [ ] `npm start` が `compiled successfully` で完了する
- [ ] Editorがクラッシュ表示を出さず起動する
- [ ] `menu-bar.jsx` がv0.2の正常動作版から変更されていない

## ブランド表示

- [ ] 左上の製品ロゴがESP32 Education Editorの独自ロゴになっている
- [ ] ブラウザタブのタイトルが `ESP32 Education Editor` になっている
- [ ] ブラウザタブのfaviconが独自アイコンになっている
- [ ] 左上ロゴをクリックするとESP32 Education Editor専用Aboutページが新しいタブで開く
- [ ] AboutページからGitHub、LICENSE、NOTICE、TRADEMARKへ移動できる
- [ ] 上流の `LICENSE` と `TRADEMARK` が残っている

## Fileメニュー日本語表示

- [ ] File → ファイル
- [ ] New → 新規
- [ ] Save now → 直ちに保存
- [ ] Save as a copy → コピーを保存
- [ ] Load from your computer → コンピューターから読み込む
- [ ] Save to your computer → コンピューターに保存する

## 機能回帰テスト

- [ ] 7個のESP32 Education拡張カードが表示される
- [ ] ESP32 接続が動く
- [ ] GPIOが動く
- [ ] DHTが動く
- [ ] OLEDが動く
- [ ] ESP-NOWが動く
- [ ] 環境指数が動く
- [ ] データ処理が動く

## GitHub Pages

- [ ] `https://davinichi.github.io/` が開く
- [ ] GitHub Pages上でもロゴ、タイトル、faviconが変更されている
- [ ] AboutページがGitHub直リンクではなく専用ページとして開く
- [ ] Fileメニューが日本語表示される
- [ ] Web SerialでESP32へ接続できる

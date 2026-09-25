# v0.2 アーキテクチャ

```text
Scratch Editor
 ├─ ESP32 接続 ─────┐
 ├─ ESP32 GPIO ─────┤
 ├─ ESP32 DHT ──────┤
 ├─ ESP32 OLED ─────┼─ shared Transport ─ Web Serial ─ USB ─ ESP32
 └─ ESP32 ESP-NOW ──┘

 ESP32 環境指数 ───── JavaScript計算のみ
 データ処理 ───────── JavaScript処理のみ
```

## 個別拡張方式を採用した理由

1. Scratchの拡張ライブラリで必要な機能だけ選択できる。
2. 各拡張カテゴリーに異なる色を自然に設定できる。
3. 授業で「今日はGPIOだけ」「次はOLED」と段階的に機能を増やせる。
4. データ処理・環境指数はハードウェアから独立して使える。
5. USB接続はshared Transportへ集約し、複数拡張が同じCOMポートを奪い合わない。

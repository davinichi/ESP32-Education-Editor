/*
  TurboWarp ESP32 Education - Next Local Test Firmware
  Adds ESP-NOW destination MAC support.
  Empty MAC -> broadcast.

  【日本語コメント追加版】
  対象：7JS ローカルテスト v3（OLED部分消去対応）に同梱されたファームウェア。

  このプログラムは、TurboWarpからUSBシリアルで受け取った命令を振り分け、
  GPIO、DHT11/DHT22、SSD1306 OLED、ESP-NOWを操作します。
  変数名、関数名、送受信コマンド、数値、条件分岐は元のv3から変更していません。
  今回追加したのはコメントと、読みやすくするための改行・字下げのみです。

  【通信と接続の設定】
  ・USBシリアル：115200 bps。改行 '\n' までを1つの命令として読み込みます。
  ・ESP-NOW：Wi-Fiチャンネル1。宛先MACが空欄ならブロードキャストです。
  ・OLED：SSD1306、128×64ピクセル、I2Cアドレス0x3C、SDA=21、SCL=22。
  ・DHT：DHT11またはDHT22を初期化命令で選び、1つのセンサを管理します。
  ・CSV分解や環境指数の計算はJS側の処理であり、このファームウェアには含みません。

  【コメントの読み方】
  @param   ：関数へ渡す値の意味。
  @returns ：関数から返す値の意味。
  Serial.print / printlnで出力する文字列は、JS側で判別するための応答です。
  応答の表記を変えるとJS側との対応も変わるため、コメント追加では変更しません。
*/

// ===== 使用するライブラリ =====
// Arduinoの基本機能：GPIO、時刻、文字列、USBシリアルなど。
#include <Arduino.h>
// ESP32のWi-FiモードとMACアドレス取得。
#include <WiFi.h>
// OLEDに使用するI2C通信。
#include <Wire.h>
// ESP-NOWの初期化、相手登録、送信、コールバック登録。
#include <esp_now.h>
// Wi-Fiチャンネルの設定と取得。
#include <esp_wifi.h>
// DHT11/DHT22の温度・湿度取得。
#include <DHT.h>
// OLEDの文字や矩形などを描画するための基本機能。
#include <Adafruit_GFX.h>
// SSD1306の画面バッファと表示転送。
#include <Adafruit_SSD1306.h>

// ===== 共通設定・グローバル変数 =====

// ESP-NOWで使用するWi-Fiチャンネル番号。初期化時と相手登録時に使用します。
static const uint8_t WIFI_CHANNEL = 1;

// ESP-NOW本文の最大長。受信時のコピー量と送信時の切り詰めに使用します。
// 単位はバイトで、日本語の文字数とは一致しません。末尾の終端文字は別途確保します。
static const size_t MAX_MESSAGE_LEN = 200;

// SSD1306 OLEDの制御オブジェクト。画面は128×64ピクセル、I2CはWireを使用します。
Adafruit_SSD1306 oled(128, 64, &Wire);

// OLED初期化処理の成否を保持します。falseは未初期化、または初期化失敗です。
bool oledReady = false;

// ESP-NOWの全端末宛て送信に使用する6バイトのブロードキャストMACアドレス。
uint8_t broadcastAddress[] = {0xFF,0xFF,0xFF,0xFF,0xFF,0xFF};

// 現在使用するDHTセンサのオブジェクトを指します。nullptrは未作成を表します。
DHT *dhtSensor = nullptr;

// DHTの信号線に使用するGPIO番号。初期値-1は、まだ設定されていない状態です。
int dhtPin = -1;

// DHTの種類。初期値はDHT22で、DHT:INIT命令によって変更します。
uint8_t dhtType = DHT22;

// DHTの初期化処理を終えたかどうかを保持します。
// trueでも実際の測定に成功したとは限らず、測定時に別途エラーを確認します。
bool dhtReady = false;

// 最後に正常取得した温度を保持します。単位は℃、NANは有効な値がない状態です。
float lastDhtTemp = NAN;

// 最後に正常取得した相対湿度を保持します。単位は％、NANは未取得を表します。
float lastDhtHumi = NAN;

// 最後に正常取得したときのmillis()値。単位はミリ秒で、測定間隔の判定に使います。
unsigned long lastDhtReadMs = 0;

// ===== ESP-NOW：送受信コールバック =====

/**
 * ESP-NOWの送信完了時に呼び出され、送信結果をUSBシリアルへ返します。
 *
 * 第1引数は送信先MACへのポインタですが、このコードでは名前を付けず使用しません。
 * @param status ESP-NOWが通知する送信結果。
 * @returns 戻り値はありません。
 *
 * 応答：成功時はESPNOW:TX:OK、それ以外はESPNOW:TX:FAIL。
 * ここでは相手のTurboWarpがデータを読み取ったかどうかまでは確認していません。
 */
void onDataSent(const uint8_t*, esp_now_send_status_t status) {
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "ESPNOW:TX:OK" : "ESPNOW:TX:FAIL");
}

/**
 * ESP-NOWの受信時に呼び出され、本文をUSBシリアルへ転送します。
 *
 * 第1引数は受信情報へのポインタですが、このコードでは使用しません。
 * @param data 受信したデータの先頭アドレス。
 * @param len 受信したデータの長さ。単位はバイトです。
 * @returns 戻り値はありません。
 *
 * 最大200バイトをコピーし、終端文字を追加してESPNOW:RX:本文の形式で出力します。
 * 入力を文字列として扱うため、途中に終端文字があるバイナリデータ用の処理ではありません。
 */
void onDataRecv(const esp_now_recv_info_t*, const uint8_t *data, int len) {
  if (len <= 0) return;

  // 実際にコピーするバイト数。受信長と上限値の小さい方にします。
  int n = min(len, (int)MAX_MESSAGE_LEN);

  // 受信本文を一時保存する配列。最後の1バイトは終端文字 '\0' 用です。
  char message[MAX_MESSAGE_LEN + 1];

  memcpy(message, data, n);
  message[n] = '\0';
  Serial.print("ESPNOW:RX:");
  Serial.println(message);
}

// ===== ESP-NOW：MACアドレス解析・相手登録・初期化・送信 =====

/**
 * 1文字が16進数として使える文字かどうかを調べます。
 *
 * @param c 判定する文字。
 * @returns 16進数の文字ならtrue、それ以外ならfalseを返します。
 *
 * isxdigit()へ渡す前にunsigned charへ変換しています。
 */
bool isHexChar(char c) {
  return isxdigit((unsigned char)c) != 0;
}

/**
 * 文字列のMACアドレスを、送信に使う6バイトの配列へ変換します。
 *
 * @param text 宛先文字列。前後の空白を除去した後、空ならブロードキャストにします。
 * @param mac 変換結果を書き込む6要素の配列。呼び出し側が用意します。
 * @returns 空欄または書式が正しいMACならtrue、不正な書式ならfalseを返します。
 *
 * 空欄以外はAA:BB:CC:DD:EE:FF形式の17文字を確認します。
 * 書式の確認であり、その機器が実在するか、受信できるかは確認しません。
 */
bool parseMacAddress(String text, uint8_t mac[6]) {
  text.trim();

  // 空欄は全端末宛てを意味します。
  if (text.length() == 0) {
    memcpy(mac, broadcastAddress, 6);
    return true;
  }

  if (text.length() != 17) return false;

  // iは入力文字列内の位置（0～16）。2桁ごとの区切りと16進文字を確認します。
  for (int i = 0; i < 17; i++) {
    if ((i + 1) % 3 == 0) {
      if (text[i] != ':') return false;
    }
    else if (!isHexChar(text[i])) return false;
  }

  // 文字列から読み取った6組の16進値を一時的に保存します。
  int v[6];

  if (sscanf(text.c_str(), "%x:%x:%x:%x:%x:%x", &v[0], &v[1], &v[2], &v[3], &v[4], &v[5]) != 6) return false;

  // iは変換結果の要素番号（0～5）。各値を1バイトへ変換して出力配列へ格納します。
  for (int i = 0; i < 6; i++) mac[i] = (uint8_t)v[i];

  return true;
}

/**
 * 指定したMACアドレスをESP-NOWの送信相手として使えるように登録します。
 *
 * @param mac 登録する送信先の6バイトMACアドレス。
 * @returns 登録済み、または新規登録に成功した場合はtrue。登録失敗時はfalseです。
 *
 * 新規登録ではチャンネル1を指定し、暗号化は無効にします。
 * 登録済みの相手については、設定を変更せずそのまま使用します。
 */
bool ensurePeer(const uint8_t mac[6]) {
  if (esp_now_is_peer_exist(mac)) return true;

  // ESP-NOWへ渡す相手設定。ゼロ初期化後、宛先・チャンネル・暗号化を設定します。
  esp_now_peer_info_t peer = {};

  memcpy(peer.peer_addr, mac, 6);
  peer.channel = WIFI_CHANNEL;
  peer.encrypt = false;
  return esp_now_add_peer(&peer) == ESP_OK;
}

/**
 * Wi-FiをSTAモードで起動し、ESP-NOWの送受信を準備します。
 *
 * @returns チャンネル設定、ESP-NOW初期化、ブロードキャスト相手登録が
 *          この関数内の判定を通過した場合はtrue。それ以外はfalseを返します。
 *
 * 送信完了・受信コールバックを登録します。学校Wi-Fiへの接続処理は行いません。
 * WiFi.mode()とコールバック登録の戻り値は、元の実装では判定していません。
 */
bool initEspNow() {
  WiFi.mode(WIFI_STA);
  delay(300);

  if (esp_wifi_set_channel(WIFI_CHANNEL, WIFI_SECOND_CHAN_NONE) != ESP_OK) return false;
  if (esp_now_init() != ESP_OK) return false;

  esp_now_register_send_cb(onDataSent);
  esp_now_register_recv_cb(onDataRecv);
  return ensurePeer(broadcastAddress);
}

/**
 * 宛先MACと本文を受け取り、ESP-NOW送信を要求します。
 *
 * @param macText 宛先MAC文字列。空欄はブロードキャストを表します。
 * @param message 送信本文。改行を空白に置換し、最大200バイトに切り詰めます。
 * @returns 戻り値はありません。エラーはUSBシリアルに出力します。
 *
 * MAC書式・相手登録・送信要求のエラーを個別に返します。
 * 送信完了時のOK/FAILは、この関数ではなくonDataSent()が返します。
 * 本文を切り詰めるときに日本語の文字境界を調べる処理は追加していません。
 */
void sendEspNowTo(String macText, String message) {
  // 解析後の送信先MACを格納する6バイト配列。
  uint8_t target[6];

  if (!parseMacAddress(macText, target)) {
    Serial.println("ESPNOW:TX:ERROR:INVALID_MAC");
    return;
  }

  if (!ensurePeer(target)) {
    Serial.println("ESPNOW:TX:ERROR:ADD_PEER");
    return;
  }

  message.replace("\r", " ");
  message.replace("\n", " ");
  if (message.length() > MAX_MESSAGE_LEN) message = message.substring(0, MAX_MESSAGE_LEN);

  // esp_now_send()が送信要求を受け付けたかを示す結果。送信完了結果とは別です。
  esp_err_t result = esp_now_send(target, reinterpret_cast<const uint8_t *>(message.c_str()), message.length());

  if (result != ESP_OK) {
    Serial.print("ESPNOW:TX:ERROR:");
    Serial.println((int)result);
  }
}

// ===== 共通の状態通知 =====

/**
 * TurboWarpへ状態表示用の応答、MACアドレス、実際のWi-Fiチャンネルを返します。
 *
 * @returns 戻り値はありません。SYS:READY、SYS:MAC、SYS:CHを出力します。
 *
 * この関数はSYS:READY:OKをそのまま出力する実装です。
 * 呼び出されるたびにESP-NOWの初期化成否を再判定する処理ではありません。
 * チャンネル取得に失敗した場合はSYS:CH:?を返します。
 */
void printSystemStatus() {
  // 取得した主チャンネル番号。esp_wifi_get_channel()が書き込みます。
  uint8_t primary = 0;

  // 取得した副チャンネル情報。画面表示はせず、APIの出力引数として用意します。
  wifi_second_chan_t secondary = WIFI_SECOND_CHAN_NONE;

  // チャンネル取得処理の成否。SYS:CHの出力内容を分けるために使います。
  esp_err_t result = esp_wifi_get_channel(&primary, &secondary);

  Serial.println("SYS:READY:OK");
  Serial.print("SYS:MAC:");
  Serial.println(WiFi.macAddress());
  Serial.print("SYS:CH:");
  if (result == ESP_OK) Serial.println(primary);
  else Serial.println("?");
}

// ===== OLED：初期化・テスト・コマンド処理 =====

/**
 * SSD1306 OLEDを初期化し、画面を空にして文字表示の初期設定を行います。
 *
 * @returns oled.begin()が成功した場合はtrue、失敗した場合はfalseを返します。
 *
 * I2CのSDA=21、SCL=22、アドレス0x3Cを使用します。
 * 成功時は文字サイズ1、白文字、カーソル(0,0)にして画面を転送します。
 * OLED:READYとOLED:ACK:INIT_OKは、この初期化処理を通過したことを示す応答です。
 * それだけで実際の画面が目視できたことを保証するものではありません。
 */
bool initOLED() {
  Wire.begin(21, 22);

  if (!oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED:ERROR");
    oledReady = false;
    return false;
  }

  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setTextColor(SSD1306_WHITE);
  oled.setCursor(0, 0);
  oled.display();
  oledReady = true;
  Serial.println("OLED:READY");
  Serial.println("OLED:ACK:INIT_OK");
  return true;
}

/**
 * 3か所の座標へ英数字を描き、OLEDの表示とカーソル位置を確認します。
 *
 * @returns 戻り値はありません。処理後にOLED:ACK:TEST_OKを返します。
 *
 * 未初期化なら初期化を試みます。画面全体を消去し、文字サイズ1で
 * (0,0)、(30,20)、(60,40)へ描画するため、それまでの表示は消えます。
 * テスト後のカーソルや文字サイズは元の状態には戻しません。
 */
void oledTest() {
  if (!oledReady && !initOLED()) return;

  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setTextColor(SSD1306_WHITE);
  oled.setCursor(0, 0);
  oled.print("TEST 0,0");
  oled.setCursor(30, 20);
  oled.print("X30 Y20");
  oled.setCursor(60, 40);
  oled.print("X60 Y40");
  oled.display();
  Serial.println("OLED:ACK:TEST_OK");
}

/**
 * OLEDから始まる命令を判別し、表示・消去・カーソル設定などを行います。
 *
 * @param command 受信した命令全体。例：OLED:FILLBLACK:0,0,60,12。
 * @returns 戻り値はありません。処理に対応するOLED:ACK:応答を返します。
 *
 * 対応：INIT / TEST / CLEAR / FILLBLACK / CURSOR / SIZE / TEXT。
 * INIT以外でも未初期化なら初期化を試みます。
 * 全消去・部分消去は画面へ即時転送しますが、カーソル位置は変更しません。
 * 本文表示も現在のカーソルから行い、表示後に画面へ転送します。
 * 未対応のOLED命令や区切り不足では、元の実装どおり応答せず終了する場合があります。
 */
void processOLED(const String &command) {
  if (command == "OLED:INIT") {
    initOLED();
    return;
  }

  if (!oledReady && !initOLED()) return;

  if (command == "OLED:TEST") {
    oledTest();
  }
  else if (command == "OLED:CLEAR") {
    // バッファ全体を消去し、OLEDへ転送します。カーソルはそのままです。
    oled.clearDisplay();
    oled.display();
    Serial.println("OLED:ACK:CLEAR_OK");
  }
  else if (command.startsWith("OLED:FILLBLACK:")) {
    // 命令の接頭辞を除いた「X,Y,幅,高さ」の文字列。
    String value = command.substring(15);

    // XとYの間にある、1個目のカンマの位置。
    int c1 = value.indexOf(',');

    // Yと幅の間にある、2個目のカンマの位置。
    int c2 = value.indexOf(',', c1 + 1);

    // 幅と高さの間にある、3個目のカンマの位置。
    int c3 = value.indexOf(',', c2 + 1);

    if (c1 < 0 || c2 < 0 || c3 < 0) return;

    // 消去範囲の左端。ピクセル単位で0～127へ制限します。
    int x = constrain(value.substring(0, c1).toInt(), 0, 127);

    // 消去範囲の上端。ピクセル単位で0～63へ制限します。
    int y = constrain(value.substring(c1 + 1, c2).toInt(), 0, 63);

    // 消去する幅。左端xから画面右端までの範囲に収めます。単位はピクセルです。
    int w = constrain(value.substring(c2 + 1, c3).toInt(), 0, 128 - x);

    // 消去する高さ。上端yから画面下端までの範囲に収めます。単位はピクセルです。
    int h = constrain(value.substring(c3 + 1).toInt(), 0, 64 - y);

    // 指定した矩形のみを黒で塗りつぶし、表示を更新します。
    // 文字の再表示位置は、別のOLED:CURSOR命令で指定してください。
    oled.fillRect(x, y, w, h, SSD1306_BLACK);
    oled.display();
    Serial.print("OLED:ACK:FILLBLACK=");
    Serial.print(x);
    Serial.print(",");
    Serial.print(y);
    Serial.print(",");
    Serial.print(w);
    Serial.print(",");
    Serial.println(h);
  }
  else if (command.startsWith("OLED:CURSOR:")) {
    // 命令の接頭辞を除いた「X,Y」の文字列。
    String value = command.substring(12);

    // XとYを区切るカンマの位置。見つからなければ処理を終了します。
    int comma = value.indexOf(',');

    if (comma < 0) return;

    // カーソルの横位置。左端を0とするピクセル座標です。
    int x = constrain(value.substring(0, comma).toInt(), 0, 127);

    // カーソルの縦位置。上端を0とするピクセル座標です。
    int y = constrain(value.substring(comma + 1).toInt(), 0, 63);

    oled.setCursor(x, y);
    Serial.print("OLED:ACK:CURSOR=");
    Serial.print(x);
    Serial.print(",");
    Serial.println(y);
  }
  else if (command.startsWith("OLED:SIZE:")) {
    // 文字の拡大倍率。元の実装では1～8の範囲に制限しています。
    int size = constrain(command.substring(10).toInt(), 1, 8);

    oled.setTextSize(size);
    Serial.print("OLED:ACK:SIZE=");
    Serial.println(size);
  }
  else if (command.startsWith("OLED:TEXT:")) {
    // 命令の接頭辞を除いた表示用の本文。
    String text = command.substring(10);

    // 描画前の横カーソル位置。応答に開始座標を付けるために保存します。
    int x = oled.getCursorX();

    // 描画前の縦カーソル位置。単位はピクセルです。
    int y = oled.getCursorY();

    // 背景消去は行わず現在位置から描きます。必要な部分消去は別命令で行います。
    oled.print(text);
    oled.display();
    Serial.print("OLED:ACK:TEXT=");
    Serial.print(text);
    Serial.print("@");
    Serial.print(x);
    Serial.print(",");
    Serial.println(y);
  }
}

// ===== GPIO：デジタル入出力 =====

/**
 * GPIOのモード設定、デジタル出力、デジタル入力の読み取りを行います。
 *
 * @param command 命令全体。例：GPIO:MODE:23,OUTPUT、GPIO:READ:23。
 * @returns 戻り値はありません。READではGPIO:READ:ピン番号:値を出力します。
 *
 * WRITEは出力モードへ切り替えてからHIGH/LOWを書き込みます。
 * READではモード変更をしないため、入力モードの指定は別のMODE命令で行います。
 * ピンごとの使用可否を検証する処理は、この関数にはありません。
 */
void processGPIO(const String &command) {
  if (command.startsWith("GPIO:MODE:")) {
    // 命令の接頭辞を除いた「ピン番号,モード」の文字列。
    String v=command.substring(10);

    // ピン番号とモードを区切るカンマの位置。
    int comma=v.indexOf(',');

    if(comma<0)return;

    // 設定対象のGPIO番号。
    int pin=v.substring(0,comma).toInt();

    // OUTPUT、INPUT_PULLUP、INPUT_PULLDOWNなどのモード指定文字列。
    String mode=v.substring(comma+1);

    if(mode=="OUTPUT")pinMode(pin,OUTPUT);
    else if(mode=="INPUT_PULLUP")pinMode(pin,INPUT_PULLUP);
    else if(mode=="INPUT_PULLDOWN")pinMode(pin,INPUT_PULLDOWN);
    else pinMode(pin,INPUT);
  }
  else if (command.startsWith("GPIO:WRITE:")) {
    // 命令の接頭辞を除いた「ピン番号,出力状態」の文字列。
    String v=command.substring(11);

    // ピン番号と出力状態を区切るカンマの位置。
    int comma=v.indexOf(',');

    if(comma<0)return;

    // 出力対象のGPIO番号。
    int pin=v.substring(0,comma).toInt();

    // 出力状態の指定。文字列がLOWならLOW、それ以外は元の実装どおりHIGHです。
    String state=v.substring(comma+1);

    pinMode(pin,OUTPUT);
    digitalWrite(pin,state=="LOW"?LOW:HIGH);
  }
  else if (command.startsWith("GPIO:READ:")) {
    // 入力値を取得するGPIO番号。現在のピンモードのまま読み取ります。
    int pin=command.substring(10).toInt();

    Serial.print("GPIO:READ:");
    Serial.print(pin);
    Serial.print(":");
    Serial.println(digitalRead(pin));
  }
}

// ===== DHT：温度・湿度取得 =====

/**
 * DHTの温度・湿度を取得し、直近の値を保持しながらTurboWarpへ返します。
 *
 * @returns 戻り値はありません。成功時はDHT:DATA:温度:湿度を出力します。
 *
 * 前回の正常取得から2秒以上、または保持値がNANのときに読み取りを試みます。
 * それ以外は保持している前回値を返します。
 * 未初期化はNOT_INITIALIZED、測定失敗はREAD_ERRORを返し、その回のDATAは送りません。
 */
void sendDhtData() {
  if (!dhtReady || !dhtSensor) {
    Serial.println("DHT:STATUS:NOT_INITIALIZED");
    return;
  }

  // 呼び出し時点の稼働時間。単位はミリ秒で、前回取得時刻との差を計算します。
  unsigned long now=millis();

  if (now-lastDhtReadMs>=2000 || isnan(lastDhtTemp) || isnan(lastDhtHumi)) {
    // 今回読み取った相対湿度。単位は％、失敗時はNANになる場合があります。
    float h=dhtSensor->readHumidity();

    // 今回読み取った温度。単位は℃、失敗時はNANになる場合があります。
    float t=dhtSensor->readTemperature();

    if (isnan(t)||isnan(h)) {
      Serial.println("DHT:STATUS:READ_ERROR");
      return;
    }

    // 温度・湿度の両方が正常な場合にだけ、保持値と取得時刻を更新します。
    lastDhtTemp=t;
    lastDhtHumi=h;
    lastDhtReadMs=now;
  }

  Serial.print("DHT:DATA:");
  Serial.print(lastDhtTemp,2);
  Serial.print(":");
  Serial.println(lastDhtHumi,2);
}

/**
 * DHTの種類・GPIOを設定する初期化命令と、読み取り命令を処理します。
 *
 * @param command 命令全体。例：DHT:INIT:DHT22,25、DHT:READ。
 * @returns 戻り値はありません。初期化後はDHT:STATUS:READY:種類:GPIO番号を返します。
 *
 * INITでは以前のオブジェクトを削除し、指定したセンサ用に作り直します。
 * 種類がDHT11のときだけDHT11、それ以外は元の実装どおりDHT22とします。
 * 初期化時は保持値をNANへ戻します。実測はREAD命令で行います。
 */
void processDHT(const String &command) {
  if (command.startsWith("DHT:INIT:")) {
    // 命令の接頭辞を除いた「センサ種類,ピン番号」の文字列。
    String v=command.substring(9);

    // センサ種類とGPIO番号を区切るカンマの位置。
    int comma=v.indexOf(',');

    if(comma<0)return;

    // DHT11またはDHT22として受け取るセンサ種類の文字列。
    String type=v.substring(0,comma);

    // DHTの信号線に使用するGPIO番号。
    int pin=v.substring(comma+1).toInt();

    if(dhtSensor) {
      delete dhtSensor;
      dhtSensor=nullptr;
    }

    dhtPin=pin;
    dhtType=type=="DHT11"?DHT11:DHT22;
    dhtSensor=new DHT(dhtPin,dhtType);
    dhtSensor->begin();
    dhtReady=true;
    lastDhtTemp=NAN;
    lastDhtHumi=NAN;
    lastDhtReadMs=0;
    Serial.print("DHT:STATUS:READY:");
    Serial.print(type);
    Serial.print(":GPIO");
    Serial.println(dhtPin);
  }
  else if (command == "DHT:READ") sendDhtData();
}

// ===== USBシリアル命令の振り分け =====

/**
 * USBシリアルで受信した1行を、機能ごとの処理関数へ振り分けます。
 *
 * @param command 改行の手前まで読み取った命令。前後の空白を除去してから判定します。
 * @returns 戻り値はありません。不明な命令はSYS:UNKNOWN:命令として返します。
 *
 * SYS / GPIO / DHT / ESP-NOW / OLEDに対応します。
 * 新しいSENDTO命令だけでなく、従来のSEND命令もブロードキャストとして残しています。
 */
void processCommand(String command) {
  command.trim();
  if (!command.length()) return;

  if (command == "SYS:STATUS") printSystemStatus();
  else if (command.startsWith("GPIO:")) processGPIO(command);
  else if (command.startsWith("DHT:")) processDHT(command);
  else if (command.startsWith("ESPNOW:SENDTO:")) {
    // 接頭辞を除いた「宛先MAC,本文」。宛先を省略する場合はカンマから始まります。
    String payload=command.substring(14);

    // 宛先MACと本文を区切る最初のカンマ。本文側に残るカンマはそのまま送信します。
    int comma=payload.indexOf(',');

    if(comma<0) {
      Serial.println("ESPNOW:TX:ERROR:FORMAT");
      return;
    }

    sendEspNowTo(payload.substring(0,comma),payload.substring(comma+1));
  }
  else if (command.startsWith("ESPNOW:SEND:")) {
    // 旧形式の命令では宛先に空文字列を渡し、ブロードキャスト送信とします。
    sendEspNowTo("", command.substring(12));
  }
  else if (command.startsWith("OLED:")) processOLED(command);
  else {
    Serial.print("SYS:UNKNOWN:");
    Serial.println(command);
  }
}

// ===== Arduinoの起動処理・繰り返し処理 =====

/**
 * 電源投入またはリセット後に1回実行される初期設定です。
 *
 * @returns 戻り値はありません。
 *
 * USBシリアルを115200 bpsで開始し、500ミリ秒待ってESP-NOWを初期化します。
 * OLEDとDHTの初期化はここでは行わず、TurboWarpからの命令で行います。
 * ESP-NOW初期化が失敗するとERRORを出してこの関数を終了しますが、
 * その後のloop()自体を停止させる処理は元のコードにはありません。
 */
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("SYS:START");

  if (!initEspNow()) {
    Serial.println("SYS:READY:ERROR");
    return;
  }

  printSystemStatus();
}

/**
 * USBシリアルを繰り返し確認し、届いた命令を1行ずつ処理します。
 *
 * @returns 戻り値はありません。Arduinoから繰り返し呼び出されます。
 *
 * データがあれば改行 '\n' まで読み取り、processCommand()へ渡します。
 * データがなければ1ミリ秒待ちます。
 * 読み取りにはreadStringUntil()を使い、専用のタイムアウト値はここで指定しません。
 */
void loop() {
  if (Serial.available()) processCommand(Serial.readStringUntil('\n'));
  else delay(1);
}

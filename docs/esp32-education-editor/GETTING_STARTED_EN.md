# Getting Started

This guide walks through connecting an ESP32-WROOM-32 to ESP32 Education Editor v0.6 with Firmware v0.1.7, then blinking an LED using GPIO.

## 1. What you need

- An ESP32-WROOM-32 (the Arduino IDE board selection is **ESP32 Dev Module** when working with firmware in the IDE)
- A USB cable that supports data and a PC or Chromebook with a USB port
- Google Chrome, Microsoft Edge, or another Chromium-based browser with Web Serial support
- An external LED and current-limiting resistor for GPIO23, or an LED module with a built-in resistor
- Wiring to connect the LED and ESP32 GND

The Firmware Installer targets ESP32-WROOM-32. Do not flash this firmware to other ESP32 boards.

## 2. Install the firmware

For feature and communication details, see the [Firmware Guide](FIRMWARE_GUIDE_EN.md).

1. Connect the ESP32-WROOM-32 to your PC or Chromebook over USB.
2. Open the [Firmware Installer](https://davinichi.github.io/firmware/) in Chrome or Edge. The public page is served over HTTPS.
3. Click **Connect to ESP32 and install v0.1.7**, then select the ESP32 USB serial port from the list.
4. Follow the on-screen instructions to complete installation of Firmware v0.1.7.

The Installer writes prebuilt firmware from the browser, so you do not need to set up Arduino IDE or install additional libraries. Close Arduino IDE's Serial Monitor, the Editor, or any other application using the ESP32 USB port before installation.

## 3. Open the Editor

Open the [Public Editor](https://davinichi.github.io/) in Chrome or Edge. The Editor communicates with the ESP32 over USB using Web Serial.

## 4. Choose a display language

In the Editor, select Japanese or English from **Settings → Language** in the top menu. The Firmware Installer also has 日本語 / English controls at the top of the page.

## 5. Connect the ESP32

1. Add the **ESP32 Connection** extension category.
2. Place the **connect to ESP32** block in the workspace and run it.
3. In the browser's port picker, select the USB serial port for your ESP32 and grant access.

If the serial port does not appear, check the USB connection, close applications such as Arduino IDE's Serial Monitor that may be using the port, and try connecting again.

## 6. Make your first program

This example blinks an LED connected to GPIO23, turning it on and off once per second. GPIO23 is included in the ESP32 GPIO extension's pin menu, and Firmware v0.1.7 supports GPIO digital output.

### Wire the LED

Always put a current-limiting resistor in series with a discrete LED. If you use an LED module with a built-in resistor, follow its connection labels. The repository does not specify a resistor value, so choose one appropriate for the LED if using a bare LED.

```text
ESP32 GPIO23 ── current-limiting resistor ── LED anode (+, long leg)
ESP32 GND    ────────────────────────────── LED cathode (−, short leg)
```

### Arrange the blocks

1. Add the **ESP32 GPIO** category.
2. Connect these blocks in order:

```text
[when green flag clicked]
  [set GPIO 23 mode to OUTPUT]
  [repeat 10]
    [set GPIO 23 to HIGH]
    [wait 1 second]
    [set GPIO 23 to LOW]
    [wait 1 second]
```

3. Click the green flag to run the program. The LED should blink on and off.

The GPIO digital-output block sets the selected pin to output mode before writing HIGH or LOW. The example sets the mode explicitly at the start to make the sequence easier to follow.

## 7. ESP32 extension categories

The Editor has 9 categories and 49 public blocks. One hidden compatibility block, `WBGT [WBGT] warning level`, remains internally for existing projects and is not shown in the palette.

| Category | Typical use |
|---|---|
| ESP32 Connection | USB / Web Serial connection; check status and MAC address |
| ESP32 GPIO | Digital input/output and PWM |
| ESP32 DHT | Read temperature and humidity from DHT11 / DHT22 sensors |
| ESP32 OLED | Display text on an SSD1306 OLED |
| ESP32 ESP-NOW | Wireless communication between ESP32 boards |
| ESP32 Servo | Control a servo motor |
| ESP32 Ultrasonic | Measure distance with an HC-SR04 |
| ESP32 Environmental Indices | Calculate environmental indices from temperature and humidity |
| Data Processing | Process CSV and text data |

## 8. About ESP-NOW

ESP-NOW communication between ESP32 boards does not require school Wi-Fi, a school LAN, or an internet connection. The ESP32 boards communicating with each other must use the same ESP-NOW channel. Firmware v0.1.7 starts on channel 1, and the selected channel resets to 1 after a restart.

An internet connection is required to load the Public Editor and Firmware Installer from the web. The Editor connects to the ESP32 over USB / Web Serial. This guide does not guarantee fully offline use after the pages have loaded.

## 9. If you cannot connect

For more troubleshooting steps, see [FAQ / Troubleshooting](FAQ_EN.md).

- **Browser does not support Web Serial:** Open the Editor or Installer in a Web Serial-compatible Chromium browser, such as Chrome or Edge.
- **USB cable or port is not detected:** Check that the ESP32-WROOM-32 is connected over USB, then reopen the browser's port picker. A charge-only cable cannot carry data.
- **Serial port is in use by another application:** Close Arduino IDE's Serial Monitor, another Editor session, or any other application using the port, then connect again. Do not use the same USB port from multiple applications at once.
- **Firmware is missing or outdated:** Use the [Firmware Installer](https://davinichi.github.io/firmware/) to install Firmware v0.1.7 on ESP32-WROOM-32, then connect from the Editor. To verify the installation, run `SYS:STATUS` from the connection extension and check that the response includes `SYS:READY:OK`.
- **Installer will not open or start installation:** The Installer must be opened over HTTPS or on localhost. Use the public Installer URL. Installation will not work in a browser without Web Serial support.
- **The board is not the target model:** The Installer targets ESP32-WROOM-32. ESP32 Dev Module is the Arduino IDE board selection name; it does not indicate support for other ESP32 boards.

## 10. What to try next

- Try digital input or PWM with **ESP32 GPIO**.
- Read temperature and humidity from a DHT11 / DHT22 with **ESP32 DHT**.
- Display text on an SSD1306 OLED with **ESP32 OLED**.
- Measure distance with an HC-SR04 using **ESP32 Ultrasonic** (reduce its ECHO signal to 3.3 V or less before it reaches an ESP32 input).
- Send and receive messages with another ESP32 using **ESP32 ESP-NOW**.
- Read the [Firmware v0.1.7 release notes](https://github.com/davinichi/ESP32-Education-Editor/releases/tag/firmware-v0.1.7) and the [README](../../README_EN.md).

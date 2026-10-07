# ESP32 Education Editor

[日本語](README.md) | English

ESP32 Education Editor is a browser-based, block programming environment for working with an ESP32-WROOM-32. It connects to the board over USB using the browser's Web Serial API and provides blocks for GPIO, sensors, displays, ESP-NOW, and data processing.

## Current versions

- Editor: **v0.6**
- Firmware: **v0.1.7**
- The Editor and Firmware are versioned separately.
- The Editor and Firmware Installer support Japanese and English.

## Public links

- Public Editor: https://davinichi.github.io/
- Firmware Installer: https://davinichi.github.io/firmware/
- GitHub repository: https://github.com/davinichi/ESP32-Education-Editor
- Releases: https://github.com/davinichi/ESP32-Education-Editor/releases
- Firmware v0.1.7 release: https://github.com/davinichi/ESP32-Education-Editor/releases/tag/firmware-v0.1.7

## Key features

- Scratch-style block programming
- USB connection to the ESP32 through Web Serial
- 49 public blocks across 9 extension categories
- GPIO digital I/O and PWM
- DHT11 / DHT22 temperature and humidity sensors, SSD1306 OLED displays, HC-SR04 ultrasonic distance sensors, and servo motors
- ESP-NOW communication between ESP32 boards
- Environmental index calculations and data processing
- Browser-based firmware installation

## Supported hardware and browser requirements

The target board is **ESP32-WROOM-32**. In the Arduino IDE board menu, select **ESP32 Dev Module**. The Firmware Installer also targets ESP32-WROOM-32; this README does not claim support for other ESP32 boards.

The Editor and Installer use Web Serial. Use a Chromium-based browser that supports Web Serial, such as Chrome or Edge. The Installer must be opened over HTTPS or on localhost. The public site uses HTTPS.

## Getting started

For detailed instructions, see the [Getting Started guide](docs/esp32-education-editor/GETTING_STARTED_EN.md).


1. Connect an ESP32-WROOM-32 to your PC or Chromebook over USB.
2. Open the [Firmware Installer](https://davinichi.github.io/firmware/) and follow its instructions to install Firmware v0.1.7. The Installer writes the prebuilt firmware from the browser, so you do not need to set up Arduino IDE or install additional libraries.
3. Open the [Public Editor](https://davinichi.github.io/) and start a Web Serial connection from the ESP32 Connection extension.
4. Add the extension categories you need, arrange the blocks, and run your program.

If another application, such as Arduino IDE's Serial Monitor or another Editor session, is using the serial port, disconnect it before connecting or installing. After installation, connect from the Editor and, if needed, check the response to `SYS:STATUS`.

## Extension categories

| Category | Description |
|---|---|
| ESP32 Connection | Connect to and communicate with the ESP32 |
| ESP32 GPIO | GPIO digital input/output and PWM |
| ESP32 DHT | Read temperature and humidity from DHT11 / DHT22 sensors |
| ESP32 OLED | Display output on SSD1306 OLEDs |
| ESP32 ESP-NOW | Wireless communication between ESP32 boards |
| ESP32 Servo | Control servo motors |
| ESP32 Ultrasonic | Measure distance with an HC-SR04 |
| ESP32 Environmental Indices | Calculate environmental indices from temperature and humidity |
| Data Processing | Process data |

There are 9 categories with 49 public blocks in total.

One hidden compatibility block, `WBGT [WBGT] warning level`, remains internally for existing projects. It is not shown in the block palette.

## Firmware overview

Firmware v0.1.7 supports GPIO digital I/O, PWM, servo motors, HC-SR04, DHT11 / DHT22, SSD1306 OLED, and ESP-NOW. PWM runs at 5 kHz with 8-bit resolution and accepts output values from 0 to 100%. ESP-NOW starts on channel 1; a channel selection returns to channel 1 after the board restarts. BLE UART is not included.

The HC-SR04 ECHO signal is approximately 5 V. Use a voltage divider or another suitable level reduction method to keep the signal at or below 3.3 V before connecting it to an ESP32 GPIO. See the [Firmware v0.1.7 release notes](https://github.com/davinichi/ESP32-Education-Editor/releases/tag/firmware-v0.1.7) for details.

## ESP-NOW and school networks

ESP-NOW communication between ESP32 boards does not require school Wi-Fi, a school LAN, or an internet connection. An internet connection is required to load the Public Editor and Firmware Installer from the web. The Editor connects to the ESP32 over USB / Web Serial.

## Educational use

This project provides a block programming environment for learning with ESP32, programming, and electronics. Learners can choose from categories for connection, GPIO, sensors, display output, wireless communication, and data processing to build programs around the functions they need.

## About, license, and relationship to Scratch

ESP32 Education Editor is an **independent project** based on the open-source Scratch Editor published by the Scratch Foundation. It is not an official Scratch Foundation product and does not imply the Foundation's approval, recommendation, or sponsorship. Scratch and related trademarks remain the property of their respective owners.

See the repository's [LICENSE](LICENSE), [NOTICE.md](NOTICE.md), and [TRADEMARK](TRADEMARK) for license terms and notices. For project details, see [About (Japanese)](docs/esp32-education-editor/ABOUT_JA.md).

## For developers

```bash
npm ci
npm run build
```

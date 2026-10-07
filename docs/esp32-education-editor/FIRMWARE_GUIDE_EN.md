# Firmware Guide

[日本語](FIRMWARE_GUIDE_JA.md) | English

[README](../../README_EN.md) · [Getting Started](GETTING_STARTED_EN.md) · [FAQ / Troubleshooting](FAQ_EN.md)

## 1. What is the Firmware?

The Firmware is the common program that runs on the ESP32. It receives commands from the Editor over USB / Web Serial and controls GPIO, supported sensors, displays, servos, ESP-NOW, and other supported hardware functions. The Editor assembles blocks and sends instructions; the Firmware performs the board-side input and output.

## 2. Current Firmware version

The current Firmware is **v0.1.7**. Use it with **Editor v0.6**. The Editor and Firmware have separate version numbers.

## 3. Supported board

The supported target is **ESP32-WROOM-32**. If selecting a board in Arduino IDE, use the board profile named **ESP32 Dev Module**. The Firmware Installer targets ESP32-WROOM-32. Do not flash this firmware to other boards.

## 4. Install the Firmware

The standard installation method is the [Firmware Installer](https://davinichi.github.io/firmware/).

1. Connect the ESP32-WROOM-32 to a PC or Chromebook over USB.
2. Open the Firmware Installer. Choose Japanese or English at the top of the page if needed.
3. Press the install button and select the ESP32 USB serial port from the browser's list.
4. Follow the on-screen instructions to install Firmware v0.1.7.

The Installer writes prebuilt firmware from the browser. You do not need to set up Arduino IDE or install additional libraries. The Editor also supports Japanese and English; change its language from **Settings → Language**.

## 5. Browser and connection requirements

Use a browser with Web Serial support, such as Chrome or Edge, for the Installer and Editor. The Installer must be opened over **HTTPS or localhost**. The public Installer and Editor are served over HTTPS. Connect the ESP32 over USB, and make sure another application, such as Arduino IDE's Serial Monitor, is not using the serial port needed by the Installer or Editor.

## 6. Main features in Firmware v0.1.7

| Feature | What the Firmware supports |
|---|---|
| GPIO | Digital input and output |
| PWM | General-purpose PWM output on GPIO pins, with stop control |
| DHT | Read temperature and humidity from DHT11 / DHT22 sensors |
| OLED | Display output and clear a selected area on SSD1306 OLEDs |
| ESP-NOW | Send and receive between ESP32 boards; set the channel |
| Servo | Attach servo output, set an angle, and detach |
| HC-SR04 | Measure distance using TRIG / ECHO |
| System information | Check READY status, MAC address, and Wi-Fi channel |

Environmental index calculations and CSV / text processing belong to the Editor's **ESP32 Environmental Indices** and **Data Processing** categories. They are Editor-side features, not Firmware sensor-control functions.

## 7. GPIO and PWM

The Firmware supports GPIO digital input and output. Use the pins offered in the Editor's ESP32 GPIO category.

PWM runs at **5 kHz** with **8-bit** resolution. The Editor accepts output values from **0 to 100%** and provides a block to stop PWM output. The v0.1.7 release notes list these PWM-capable GPIO pins:

`13, 14, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33`

The v0.1.7 release also verifies that PWM can resume after it has been stopped. See the [Firmware v0.1.7 Release Notes](https://davinichi.github.io/firmware/RELEASE_NOTES_firmware-v0.1.7.md) for details.

## 8. Servo

The ESP32 Servo category can attach servo output to a GPIO, set an angle, and detach the output. The Editor's angle range is **0 to 180 degrees**. Check the documentation for the Servo you use for wiring and power requirements. This guide does not specify unverified wiring or power details.

## 9. HC-SR04 Ultrasonic

The ESP32 Ultrasonic category lets you set the TRIG / ECHO GPIO pins and read distance in centimeters. The test configuration listed in the v0.1.7 release notes uses GPIO26 for TRIG and GPIO34 for ECHO.

The HC-SR04 ECHO output is approximately 5 V. **Do not input 5 V directly to an ESP32 pin. Keep the ESP32 input at or below 3.3 V.** The release notes show a voltage-divider example with a 1 kΩ resistor between ECHO and the input, and a 2 kΩ resistor between the input and GND. See the [Release Notes](https://davinichi.github.io/firmware/RELEASE_NOTES_firmware-v0.1.7.md) before wiring.

## 10. ESP-NOW

ESP-NOW lets ESP32 boards communicate directly with one another. It does not require a school Wi-Fi access point or school LAN, and ESP-NOW communication between boards does not require an internet connection. The boards communicating with each other must use the same channel. The Firmware starts on channel 1; the Editor can select channels 1 through 13. The channel returns to 1 after a restart.

The Editor's ESP32 Connection category can show the board's MAC address and current Wi-Fi channel. The ESP32 ESP-NOW category provides destination-MAC sending, channel selection, and received-data blocks.

An internet connection is required to load the Public Editor and Firmware Installer from the web. This is separate from the network requirements for ESP-NOW communication.

## 11. Communication between the Editor and Firmware

The Editor and Firmware communicate over USB / Web Serial. After installing the Firmware, connect from the [Public Editor](https://davinichi.github.io/) using the ESP32 Connection category. To check the connection status, run `SYS:STATUS` and confirm that the response includes `SYS:READY:OK`.

## 12. Verify the installation

Follow the Firmware Installer instructions to connect from the Editor, then refresh the ESP32 Connection status. Check that the response includes:

- `SYS:READY:OK`: the Firmware's READY response
- A value after `SYS:MAC:`: the ESP32 MAC address
- A value after `SYS:CH:`: the current Wi-Fi channel

You can also read the values from the Editor's MAC-address and channel reporter blocks. These fields confirm status information; they do not test the wiring or operation of each sensor or peripheral.

## 13. Updating the Firmware

When a newer Firmware version is released, check the target version in the Firmware Installer and follow its instructions to flash the ESP32-WROOM-32. The Installer does not automatically update the Firmware. After updating, connect from the Editor and check the `SYS:STATUS` response.

## 14. Firmware and project files

A project file created in the Editor and the Firmware flashed to the ESP32 are separate things. Save and load project files in the Editor; install or update Firmware with the Installer. Updating Firmware is not the same as saving or loading a project.

## 15. Troubleshooting

For connection, serial-port, browser, or installation problems, see [FAQ / Troubleshooting](FAQ_EN.md).

BLE UART is not included in Firmware v0.1.7. For feature and compatibility details, see the [official v0.1.7 Release Notes](https://davinichi.github.io/firmware/RELEASE_NOTES_firmware-v0.1.7.md).

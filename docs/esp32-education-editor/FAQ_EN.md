# FAQ / Troubleshooting

[日本語](FAQ_JA.md) | English

[README](../../README_EN.md) · [Getting Started](GETTING_STARTED_EN.md)

This page covers ESP32 Education Editor v1.0, Firmware v1.0.0, and the ESP32-WROOM-32. The Editor has 12 categories and 64 public blocks, with one hidden compatibility block retained internally for existing projects.

## First checks

If something goes wrong, check these items in order:

1. The board is the supported **ESP32-WROOM-32**.
2. **Firmware v1.0.0** is installed.
3. You are using a browser with Web Serial support, such as **Chrome or Edge**.
4. The board is connected over USB.
5. Another application, such as Arduino IDE's Serial Monitor, is not using the same serial port.

### Chromebook, Windows, and Web Serial

- **Chromebook**: Open the public Installer and Editor in Chrome. No Linux environment or Arduino IDE setup is needed. If a school-managed device restricts USB serial access or the sites, ask the school administrator to check the permissions.
- **Windows**: Use Chrome or Edge with Web Serial support. Check the USB serial device under **Ports (COM & LPT)** in Device Manager. If it is not recognized, identify the board's USB serial chip and follow the board manufacturer's instructions for the appropriate driver.
- **Both**: Use a data-capable USB cable, select the connected ESP32 in the browser's port picker, and grant access. Web Serial requires a secure context such as HTTPS and user permission. Use the public HTTPS links. Charge-only cables cannot connect.
- The Installer, Editor, and Serial Monitor cannot use the same port simultaneously. Disconnect before switching, and close the previous tab if needed. After unplugging USB, reconnect manually from the Editor.

### Check the Firmware version

After connecting, click the **ESP32 Firmware version** reporter in ESP32 Connection, or select its checkbox to show a monitor, and confirm `1.0.0`. It is retrieved automatically on connection; **refresh ESP32 status** retrieves it again. Also confirm that **ESP32 status** shows `OK`.

If the version is older or shows **Unknown (Firmware v1.0.0 recommended)**, disconnect the Editor, install v1.0.0 with the Installer, and reconnect. `SYS:READY:OK` alone does not identify the version. At protocol level, `SYS:VERSION` returns `SYS:VERSION:1.0.0` (normally the blocks handle this; no manual command entry is needed).

## Frequently asked questions

### 1. What do I need to use ESP32 Education Editor?

You need an ESP32-WROOM-32, a USB connection, a browser with Web Serial support (such as Chrome or Edge), and Firmware v1.0.0. Open the [Public Editor](https://davinichi.github.io/). The Editor communicates with the board over USB / Web Serial.

### 2. Do I need Arduino IDE?

When you use the Firmware Installer, you do not need to set up Arduino IDE or install additional libraries to flash the firmware. Open the [Firmware Installer](https://davinichi.github.io/firmware/) and follow its instructions.

For a feature overview and verification steps, see the [Firmware Guide](FIRMWARE_GUIDE_EN.md).

### 3. The Editor cannot connect to the ESP32

Check these items in order:

1. Confirm that the board is an ESP32-WROOM-32.
2. Check that it is connected over USB.
3. Confirm that Firmware v1.0.0 is installed. If needed, install it again with the Installer.
4. Open the Public Editor in a browser with Web Serial support, such as Chrome or Edge.
5. When connecting, select the ESP32 serial port in the browser's port picker.
6. Close other applications that may be using the port, such as Arduino IDE's Serial Monitor, then try again.

### 4. The serial port does not appear

Make sure you are using a Web Serial-compatible browser and that the ESP32-WROOM-32 is connected over USB. Use a USB cable that supports data; a charge-only cable cannot carry data. If an application such as Arduino IDE's Serial Monitor or another Editor session is using the port, close it and reopen the port picker.

### 5. The Firmware Installer does not work

Open the Installer in a Web Serial-compatible browser such as Chrome or Edge, over HTTPS or localhost. The [public Installer is served over HTTPS](https://davinichi.github.io/firmware/). Connect the ESP32-WROOM-32 over USB and select its port. The Installer targets ESP32-WROOM-32.

### 6. The Editor still cannot connect after flashing the firmware

Confirm that the board is an ESP32-WROOM-32 and that Firmware v1.0.0 was installed. The Editor connects over USB from a browser with Web Serial support, such as Chrome or Edge. After flashing, close Serial Monitor or any other application using the same port, then connect from the Editor. After connecting, run **refresh ESP32 status**, then confirm status `OK` and Firmware version `1.0.0`.

### 7. Can I use Arduino IDE's Serial Monitor and the Editor at the same time?

You cannot use the same serial port from Serial Monitor and the Editor at the same time. Before connecting or flashing, close any other application that is using the port.

### 8. Does the ESP32 need to connect to school Wi-Fi?

ESP-NOW lets ESP32 boards communicate directly with each other. They do not need to connect to a school Wi-Fi access point or school LAN, and no internet connection is required for ESP-NOW communication.

### 9. Do I need an internet connection?

An internet connection is needed to load the Public Editor and Firmware Installer from the web. ESP-NOW communication between ESP32 boards does not itself require internet access. This page does not guarantee fully offline use after the web pages have loaded.

### 10. Can I use an ESP32 other than the ESP32-WROOM-32?

The current supported target is ESP32-WROOM-32. ESP32 Dev Module is the board selection name to use when working with the firmware in Arduino IDE; it does not indicate support for other ESP32 boards.

### 11. ESP-NOW communication is not working

If the send block specifies a destination MAC address, check that it is correct. Leaving the destination MAC field empty sends a broadcast. Also check that the communicating boards use the same Wi-Fi channel. Firmware v1.0.0 starts on channel 1, and the selected channel returns to 1 after a restart. Confirm that your program uses blocks from the ESP32 ESP-NOW category.

### 12. A sensor or peripheral is not working

Check the wiring, the GPIO selected in the blocks, and the power connection. Also check that you are using blocks from the category for the device (for example, ESP32 DHT for DHT, ESP32 OLED for OLED, or ESP32 Ultrasonic for HC-SR04). Follow the wiring instructions for the device and the relevant existing guide. This FAQ does not specify unverified pin assignments.

### 13. Is there anything special to know when using an HC-SR04?

The HC-SR04 ECHO output is approximately 5 V. **Do not connect ECHO directly to the ESP32 at 5 V. Keep the ESP32 input at or below 3.3 V.** The [Firmware v0.1.8 release notes](https://davinichi.github.io/firmware/RELEASE_NOTES_firmware-v0.1.8.md) show a voltage-divider example with a 1 kΩ series resistor from ECHO to the ESP32 input and a 2 kΩ resistor from the input to GND. Check the reference before wiring.

### 14. Can I change the Editor and Firmware Installer language?

Yes. Both the Editor and Firmware Installer support Japanese and English. In the Editor, use **Settings → Language**. In the Installer, use the language control at the top of the page.

### 15. Can I open a project made in Japanese with the Editor set to English?

Block labels change with the selected language, while internal identifiers such as extension IDs and opcodes do not change when the language changes. Current integration tests load test projects containing ESP32 extension blocks in both directions—from Japanese to English and from English to Japanese—and confirm that the block data is preserved. This does not guarantee compatibility for every existing project beyond the tested cases.

## Historical material

The [Editor v0.6 / Firmware v0.1.8 FAQ](history/v0.6/FAQ_EN.md) is retained as history. See [Getting Started](GETTING_STARTED_EN.md) for current installation and the [v1.0 manual](V1_MANUAL_EN.md#developer-build) for developer builds.

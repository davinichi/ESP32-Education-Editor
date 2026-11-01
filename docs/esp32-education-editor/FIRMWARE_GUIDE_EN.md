# Firmware Guide — v1.0.0

[日本語](FIRMWARE_GUIDE_JA.md) | English

[README](../../README_EN.md) · [Getting Started](GETTING_STARTED_EN.md) · [FAQ](FAQ_EN.md)

## Current version and standard installation

Use **Editor v1.0 / Firmware v1.0.0**, officially released on October 20, 2026. The target is **ESP32-WROOM-32**. Do not flash other ESP32 boards.

Firmware is the shared program running on the ESP32, executing commands received from the Editor over USB / Web Serial. It is separate from Editor project files, which are saved and loaded in the Editor.

1. Connect the board using a data-capable USB cable. Use Chrome on Chromebook, or Web Serial-compatible Chrome/Edge on Windows.
2. Open the [Firmware Installer](https://davinichi.github.io/firmware/) and confirm it shows v1.0.0. Japanese/English controls are available.
3. Click **Connect to ESP32 and install v1.0.0**, select the ESP32 USB serial port in the browser picker, and follow the installation prompts.
4. Disconnect the Installer and close its tab if needed to release the port. Open the [public Editor](https://davinichi.github.io/), add ESP32 Connection, run **connect to ESP32**, select the port, and grant access.

The Installer writes prebuilt firmware. No Arduino IDE, additional libraries, or source compilation is needed. Updates use the same manual procedure; the Installer does not automatically update firmware.

### Chromebook, Windows, and Web Serial

- **Chromebook**: Open the public Installer and Editor in Chrome. No Linux environment or Arduino IDE setup is needed. If a school-managed device restricts USB serial access or the sites, ask the school administrator to check the permissions.
- **Windows**: Use Chrome or Edge with Web Serial support. Check the USB serial device under **Ports (COM & LPT)** in Device Manager. If it is not recognized, identify the board's USB serial chip and follow the board manufacturer's instructions for the appropriate driver.
- **Both**: Use a data-capable USB cable, select the connected ESP32 in the browser's port picker, and grant access. Web Serial requires a secure context such as HTTPS and user permission. Use the public HTTPS links. Charge-only cables cannot connect.
- The Installer, Editor, and Serial Monitor cannot use the same port simultaneously. Disconnect before switching, and close the previous tab if needed. After unplugging USB, reconnect manually from the Editor.

### Check the Firmware version

After connecting, click the **ESP32 Firmware version** reporter in ESP32 Connection, or select its checkbox to show a monitor, and confirm `1.0.0`. It is retrieved automatically on connection; **refresh ESP32 status** retrieves it again. Also confirm that **ESP32 status** shows `OK`.

If the version is older or shows **Unknown (Firmware v1.0.0 recommended)**, disconnect the Editor, install v1.0.0 with the Installer, and reconnect. `SYS:READY:OK` alone does not identify the version. At protocol level, `SYS:VERSION` returns `SYS:VERSION:1.0.0` (normally the blocks handle this; no manual command entry is needed).

## Features and communication

Firmware v1.0.0 retains GPIO/PWM, DHT11/DHT22, SSD1306 OLED, ESP-NOW, servo, and HC-SR04 support, adding I2C Scanner, BME280, INA219, and `SYS:VERSION`. BLE UART is not included. Environmental-index calculations and CSV/text processing run in the Editor, which has 12 categories and 64 public blocks.

I2C shares SDA=GPIO21 and SCL=GPIO22. See the [v1.0 manual](V1_MANUAL_EN.md) for wiring, power requirements, compatibility, measurement errors, and the 115200-baud, LF-terminated protocol. Reduce the HC-SR04 ECHO signal from approximately 5 V to at most 3.3 V before it reaches an ESP32 input.

**refresh ESP32 status** retrieves status and version again. **ESP32 status** shows `OK`; MAC address and Wi-Fi channel reporters show received values. At protocol level, `SYS:STATUS` returns responses including `SYS:READY:OK`, `SYS:MAC:`, and `SYS:CH:`. These do not test sensor wiring or measurement accuracy.

ESP-NOW communication between boards does not require school Wi-Fi, a school LAN, or internet access. Boards must use the same channel. It starts at 1 and returns to 1 after restarting. Internet access is needed to load the public pages; fully offline operation after loading is not guaranteed.

## Developers and history

Only developers modifying the source need the [build instructions](V1_MANUAL_EN.md#developer-build). The Arduino IDE board selection is ESP32 Dev Module.

The [old Firmware Guide (Editor v0.6 / Firmware v0.1.8)](history/v0.6/FIRMWARE_GUIDE_EN.md) is retained as history, not as the current installation procedure. See also the [Firmware v1.0.0 Release](https://github.com/davinichi/ESP32-Education-Editor/releases/tag/firmware-v1.0.0).

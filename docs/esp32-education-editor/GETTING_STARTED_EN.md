# Getting Started — Editor v1.0 / Firmware v1.0.0

[日本語](GETTING_STARTED_JA.md) | English

For Editor v1.0 / Firmware v1.0.0, officially released on October 20, 2026.

This guide walks through connecting an ESP32-WROOM-32 to ESP32 Education Editor v1.0 with Firmware v1.0.0, then blinking an LED using GPIO.

## 1. What you need

- An ESP32-WROOM-32 (the Arduino IDE board selection is **ESP32 Dev Module** when working with firmware in the IDE)
- A USB cable that supports data and a PC or Chromebook with a USB port
- Google Chrome, Microsoft Edge, or another Chromium-based browser with Web Serial support
- An external LED and current-limiting resistor for GPIO23, or an LED module with a built-in resistor
- Wiring to connect the LED and ESP32 GND

The Firmware Installer targets ESP32-WROOM-32. Do not flash this firmware to other ESP32 boards.

### Chromebook, Windows, and Web Serial

- **Chromebook**: Open the public Installer and Editor in Chrome. No Linux environment or Arduino IDE setup is needed. If a school-managed device restricts USB serial access or the sites, ask the school administrator to check the permissions.
- **Windows**: Use Chrome or Edge with Web Serial support. Check the USB serial device under **Ports (COM & LPT)** in Device Manager. If it is not recognized, identify the board's USB serial chip and follow the board manufacturer's instructions for the appropriate driver.
- **Both**: Use a data-capable USB cable, select the connected ESP32 in the browser's port picker, and grant access. Web Serial requires a secure context such as HTTPS and user permission. Use the public HTTPS links. Charge-only cables cannot connect.
- The Installer, Editor, and Serial Monitor cannot use the same port simultaneously. Disconnect before switching, and close the previous tab if needed. After unplugging USB, reconnect manually from the Editor.

## 2. Install the firmware (standard method)

For feature and communication details, see the [Firmware Guide](FIRMWARE_GUIDE_EN.md).

1. Connect the ESP32-WROOM-32 to your PC or Chromebook over USB.
2. Open the [Firmware Installer](https://davinichi.github.io/firmware/) in Chrome or Edge. The public page is served over HTTPS.
3. Click **Connect to ESP32 and install v1.0.0**, then select the ESP32 USB serial port from the list.
4. Follow the on-screen instructions to complete installation of Firmware v1.0.0.

The Installer writes prebuilt firmware from the browser, so you do not need to set up Arduino IDE or install additional libraries. Close Arduino IDE's Serial Monitor, the Editor, or any other application using the ESP32 USB port before installation.

After installation, disconnect the Installer and close its tab if needed to release the port.

## 3. Open the Editor

Open the [Public Editor](https://davinichi.github.io/) in Chrome or Edge. The Editor communicates with the ESP32 over USB using Web Serial.

## 4. Choose a display language

In the Editor, select Japanese or English from **Settings → Language** in the top menu. The Firmware Installer also has 日本語 / English controls at the top of the page.

## 5. Connect the ESP32

1. Add the **ESP32 Connection** extension category.
2. Place the **connect to ESP32** block in the workspace and run it.
3. In the browser's port picker, select the USB serial port for your ESP32 and grant access.

If the serial port does not appear, check the USB connection, close applications such as Arduino IDE's Serial Monitor that may be using the port, and try connecting again.

### Check the Firmware version

After connecting, click the **ESP32 Firmware version** reporter in ESP32 Connection, or select its checkbox to show a monitor, and confirm `1.0.0`. It is retrieved automatically on connection; **refresh ESP32 status** retrieves it again. Also confirm that **ESP32 status** shows `OK`.

If the version is older or shows **Unknown (Firmware v1.0.0 recommended)**, disconnect the Editor, install v1.0.0 with the Installer, and reconnect. `SYS:READY:OK` alone does not identify the version. At protocol level, `SYS:VERSION` returns `SYS:VERSION:1.0.0` (normally the blocks handle this; no manual command entry is needed).

## 6. Make your first program

This example blinks an LED connected to GPIO23, turning it on and off once per second. GPIO23 is included in the ESP32 GPIO extension's pin menu, and Firmware v1.0.0 supports GPIO digital output.

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

The Editor has 12 categories and 64 public blocks. One hidden compatibility block, `WBGT [WBGT] warning level`, remains internally for existing projects and is not shown in the palette.

| Category | Typical use |
|---|---|
| ESP32 Connection | USB / Web Serial connection; check status and MAC address |
| ESP32 GPIO | Digital input/output and PWM |
| ESP32 DHT | Read temperature and humidity from DHT11 / DHT22 sensors |
| ESP32 I2C Scanner | Detect I2C device addresses |
| ESP32 BME280 | Temperature, humidity, and pressure |
| ESP32 INA219 | Voltage, current, power, and shunt voltage |
| ESP32 OLED | Display text on an SSD1306 OLED |
| ESP32 ESP-NOW | Wireless communication between ESP32 boards |
| ESP32 Servo | Control a servo motor |
| ESP32 Ultrasonic | Measure distance with an HC-SR04 |
| ESP32 Environmental Indices | Calculate environmental indices from temperature and humidity |
| Data Processing | Process CSV and text data |

## 8. About ESP-NOW

ESP-NOW communication between ESP32 boards does not require school Wi-Fi, a school LAN, or an internet connection. The ESP32 boards communicating with each other must use the same ESP-NOW channel. Firmware v1.0.0 starts on channel 1, and the selected channel resets to 1 after a restart.

An internet connection is required to load the Public Editor and Firmware Installer from the web. The Editor connects to the ESP32 over USB / Web Serial. This guide does not guarantee fully offline use after the pages have loaded.

## 9. If you cannot connect

For more troubleshooting steps, see [FAQ / Troubleshooting](FAQ_EN.md).

- **Browser does not support Web Serial:** Open the Editor or Installer in a Web Serial-compatible Chromium browser, such as Chrome or Edge.
- **USB cable or port is not detected:** Check that the ESP32-WROOM-32 is connected over USB, then reopen the browser's port picker. A charge-only cable cannot carry data.
- **Serial port is in use by another application:** Close Arduino IDE's Serial Monitor, another Editor session, or any other application using the port, then connect again. Do not use the same USB port from multiple applications at once.
- **Firmware is missing or outdated:** Use the [Firmware Installer](https://davinichi.github.io/firmware/) to install Firmware v1.0.0 on ESP32-WROOM-32, then connect from the Editor. Then confirm version `1.0.0` and status `OK` using the Firmware version check above.
- **Installer will not open or start installation:** The Installer must be opened over HTTPS or on localhost. Use the public Installer URL. Installation will not work in a browser without Web Serial support.
- **The board is not the target model:** The Installer targets ESP32-WROOM-32. ESP32 Dev Module is the Arduino IDE board selection name; it does not indicate support for other ESP32 boards.

## 10. What to try next

- Try digital input or PWM with **ESP32 GPIO**.
- Read temperature and humidity from a DHT11 / DHT22 with **ESP32 DHT**.
- Display text on an SSD1306 OLED with **ESP32 OLED**.
- Measure distance with an HC-SR04 using **ESP32 Ultrasonic** (reduce its ECHO signal to 3.3 V or less before it reaches an ESP32 input).
- Send and receive messages with another ESP32 using **ESP32 ESP-NOW**.
- Read the [Firmware v1.0.0 release notes](https://github.com/davinichi/ESP32-Education-Editor/releases/tag/firmware-v1.0.0) and the [README](../../README_EN.md).

## Developers and historical material

Normal use does not require source compilation. To modify or develop firmware, see the [developer build instructions in the v1.0 manual](V1_MANUAL_EN.md#developer-build).

[Editor v0.6 / Firmware v0.1.8 getting-started guide (historical)](history/v0.6/GETTING_STARTED_EN.md). The public Installer serves the current version.

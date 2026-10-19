# ESP32 Education Editor v1.0 Manual

[日本語](V1_MANUAL_JA.md) · [README](../../README_EN.md)

Target: Editor v1.0 / Firmware v1.0.0 on ESP32-WROOM-32 (ESP32 Dev Module). This release preparation includes hardware-verified configurations. Check README for public site and Installer availability.

## Connection and compatibility

Compile and flash the v1.0.0 sketch, add ESP32 Connection, then run “connect to ESP32”. The “ESP32 Firmware version” reporter automatically receives `1.0.0` on connection; “refresh ESP32 status” requests it again. The reporter can be shown as a monitor. There are 12 categories and 64 public blocks.

Older firmware without `SYS:VERSION` remains connected and displays “Unknown (Firmware v1.0.0 recommended)”. New I2C features require v1.0.0. Existing GPIO/PWM, DHT, OLED, ESP-NOW, servo and HC-SR04 commands, responses, opcodes and arguments are retained, including the hidden WBGT compatibility block.

## Shared I2C wiring

Connect SDA to GPIO21, SCL to GPIO22 and share GND. Use 3.3 V signal levels and pull-ups; check each module's power requirements. OLED (0x3C), BME280 (usually 0x76/0x77) and INA219 (default 0x40) share Wire. Devices must have distinct addresses. Do not assign GPIO21/22 to GPIO, PWM, servo or other sensor functions while using I2C.

One BME280 and one INA219 are managed at a time. Initializing again changes the selected device address.

## I2C Scanner

Run “scan I2C devices” and read “I2C scan results”, for example `0x3C,0x40,0x76`. The scan covers non-reserved 7-bit addresses 0x08–0x77. No devices produces an empty string. “I2C address [0x40] found?” checks the last successful scan and accepts hexadecimal or decimal input. An ACK identifies an address, not a device model. Errors/timeouts clear the address list and put an error code in the results. Disconnect also clears the list.

## BME280

### Akizuki AE-BME280 at address 0x76

AE-BME280 accepts 1.71–3.6V. Use 3.3V with ESP32, never 5V. Connect VDD to 3.3V, GND to common GND, SDI to GPIO21 (SDA), and SCK to GPIO22 (SCL). Bridge J3 to hold CSB at VDD for I2C mode. Separately connect SDO to GND for 0x76, or to 3.3V for 0x77; do not leave SDO floating. J3 does not set the address. J1/J2 select pull-up resistors and depend on the complete shared bus. Disconnect USB and external power before rewiring.

See [the official AE-BME280 guide, page 1](https://akizukidenshi.com/goodsaffix/AE-BME280_manu_v1.1.pdf). With SDO grounded and both sensor modules powered from 3.3V, the user completed 600 diagnostic cycles with BME280, INA219 and the integrated OLED.

Run “initialize BME280 at address [0x76]”; choose 0x76 or 0x77. Read temperature in °C, humidity in %, and pressure in hPa. Pressure is converted from Pa. BMP280 does not provide humidity and is not supported by this category.

## INA219

Keep I2C signal levels at 3.3V. The tested module uses 3.3V on its logic supply VCC. VCC is separate from measurement terminals Vin+/Vin−. For an LED load, wire GPIO25 → Vin+ → Vin− → 330Ω → LED anode → LED cathode → GND. Insert the measurement terminals in series, not across the LED.

Run “initialize INA219 at address [0x40]”; choose 0x40–0x4F. Read bus voltage V (VIN− relative to GND), current mA, power mW, and shunt voltage mV. Supply-side voltage can be calculated as bus voltage + shunt voltage/1000.

The Adafruit default 32V/2A calibration assumes a 0.1Ω shunt. Check the actual module's shunt and ratings. Each reporter requests a fresh reading; separate reporters do not represent simultaneous samples.

## Errors

Capture sensor status immediately after each reading. Visible sensor monitors also generate requests. Hide unused monitors when diagnosing communication. If a checkbox and stage monitor disagree, hide the monitor through its context menu and save the project. An OLED command returning from its block does not guarantee a display update; inspect the OLED acknowledgement as well.

The 600-cycle hardware test was run with the Editor visible in the foreground and the PC awake. Continuous timing while backgrounded and the root cause of the response stall seen before wiring correction are not established. After USB reconnection, connect manually and initialize the devices again.

BME280 samples outside Bosch's operating ranges (−40–85 °C, 0–100% RH, 300–1100 hPa) produce `READ_ERROR`. Values are neither clamped nor replaced by previous samples. 100% humidity remains valid. These checks reject invalid measurements; they do not establish or fix the physical cause of a communication or device fault. See the [Bosch datasheet](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf).

BME280 uses the bundled `BME280Checked.h` driver. Initialization checks communication and calibration transfers. Each measurement reads all eight data bytes in one burst, checks transfer completion and byte counts, then compensates the sample. A failed transfer returns `READ_ERROR` without values; the next successful read resumes measurements without reinitialization. There are no automatic retries that conceal failed samples.

Failed new sensor readings return an empty string, never the previous value. Check the sensor status reporter for `READY`, `OK`, `INVALID_ADDRESS`, `INIT_FAILED`, `NOT_INITIALIZED`, `READ_ERROR`, `TIMEOUT`, or `UNSUPPORTED_FIRMWARE`. Confirm `OK` before numeric calculations. Reconnect and reinitialize manually after unplugging USB.

## Serial protocol

115200 baud, newline-terminated commands and replies.

| Command | Example reply |
|---|---|
| `I2C:SCAN` | `I2C:SCAN:0x3C,0x40,0x76`; empty: `I2C:SCAN:` |
| `BME280:INIT:0x76` | `BME280:STATUS:READY` |
| `BME280:READ` | `BME280:DATA:23.50:60.00:1013.25` (°C:%:hPa) |
| `INA219:INIT:0x40` | `INA219:STATUS:READY` |
| `INA219:READ` | `INA219:DATA:3.300:10.000:33.000:1.000` (V:mA:mW:mV) |
| `SYS:VERSION` | `SYS:VERSION:1.0.0` |

Initialization commands require an address; Editor defaults are 0x76 and 0x40. Decimal addresses also work. I2C failures return `I2C:ERROR:INIT_FAILED` or `I2C:ERROR:SCAN_FAILED`. Sensor failures return `<sensor>:STATUS:<code>`.

## Building and release checks

Arduino libraries: DHT sensor library, Adafruit Unified Sensor, Adafruit GFX Library, Adafruit SSD1306, Adafruit BusIO and Adafruit INA219. The reference Arduino-ESP32 core is 3.2.1. Keep the bundled BME280 driver `BME280Checked.h` in the same folder as the `.ino`. The separate diagnostic sketch uses Adafruit BME280 Library.

```sh
arduino-cli compile --fqbn esp32:esp32:esp32 firmware/esp32-education-editor/esp32_education_editor_firmware_v1_0_0
npm ci
npm run build
```

See [release candidate notes and hardware checklist](RELEASE_NOTES_V1.md). Public Installer manifests and binaries are a separate deployment in another repository; this branch does not publish them. Existing PDFs document the previous version; use this manual for v1.0 additions.

#include <cassert>
#include <cmath>
#include <cstdio>
#include "../esp32-education-editor/esp32_education_editor_firmware_v1_0_0/BME280Checked.h"

static void word(TwoWire &wire, int reg, int value) {
  wire.registers[reg] = value & 255;
  wire.registers[reg + 1] = (value >> 8) & 255;
}

static TwoWire device() {
  TwoWire wire;
  wire.registers[0xD0] = 0x60;
  const int coefficients[] = {27504, 26435, -1000, 36477, -10685, 3024,
                             2855, 140, -7, 15500, -14600, 6000};
  for (int i = 0; i < 12; i++) word(wire, 0x88 + 2 * i, coefficients[i]);
  wire.registers[0xA1] = 75;
  word(wire, 0xE1, 362);
  wire.registers[0xE3] = 0;
  wire.registers[0xE4] = 20;
  wire.registers[0xE5] = 0x25;
  wire.registers[0xE6] = 3;
  wire.registers[0xE7] = 30;
  const uint8_t raw[] = {0x65, 0x5A, 0xC0, 0x7E, 0xED, 0x00, 0x88, 0xB8};
  std::memcpy(wire.registers + 0xF7, raw, 8);
  return wire;
}

int main() {
  TwoWire wire = device();
  BME280Checked sensor;
  float temperature, humidity, pressure;
  assert(!sensor.readSample(temperature, humidity, pressure));
  assert(sensor.begin(0x76, &wire));
  wire.requests = 0;
  assert(sensor.readSample(temperature, humidity, pressure));
  assert(wire.requests == 1); // One complete sample, with one temperature compensation.
  assert(wire.address == 0x76);
  assert(std::fabs(temperature - 25.08F) < 0.01F);
  assert(std::fabs(pressure - 1006.5327F) < 0.01F);
  assert(humidity > 0 && humidity < 100);
  wire.registers[0xFD] = wire.registers[0xFE] = 0;
  assert(sensor.readSample(temperature, humidity, pressure));
  assert(humidity == 0);
  wire.registers[0xFD] = wire.registers[0xFE] = 0xFF;
  assert(sensor.readSample(temperature, humidity, pressure));
  assert(humidity == 100); // Saturated humidity is valid, not a transfer failure.
  wire.registers[0xFD] = 0x88;
  wire.registers[0xFE] = 0xB8;

  // ACK probes can succeed while the actual register transfer NACKs.
  wire.failRegister = 0xF7;
  wire.beginTransmission(0x76);
  assert(wire.endTransmission() == 0);
  assert(!sensor.readSample(temperature, humidity, pressure));
  assert(std::isnan(temperature) && std::isnan(humidity) && std::isnan(pressure));
  wire.failRegister = -1;
  assert(sensor.readSample(temperature, humidity, pressure)); // Recover without reinitializing.

  wire.shortRead = true;
  assert(!sensor.readSample(temperature, humidity, pressure));
  assert(std::isnan(temperature) && std::isnan(humidity) && std::isnan(pressure));
  wire.shortRead = false;
  wire.emptyRead = true;
  assert(!sensor.readSample(temperature, humidity, pressure));
  wire.emptyRead = false;
  wire.shortWrite = true;
  assert(!sensor.readSample(temperature, humidity, pressure));
  wire.shortWrite = false;
  assert(sensor.readSample(temperature, humidity, pressure));

  const uint8_t registers[] = {0xD0, 0xE0, 0xF3, 0x88, 0xE1, 0xF2, 0xF4, 0xF5};
  for (uint8_t reg : registers) {
    TwoWire failing = device();
    failing.failRegister = reg;
    assert(!sensor.begin(0x76, &failing));
    assert(!sensor.readSample(temperature, humidity, pressure));
  }
  TwoWire busy = device();
  busy.registers[0xF3] = 1;
  assert(!sensor.begin(0x76, &busy)); // Bounded calibration wait.
  TwoWire wrongChip = device();
  wrongChip.registers[0xD0] = 0x58;
  assert(!sensor.begin(0x76, &wrongChip));
  TwoWire zeroCalibration = device();
  word(zeroCalibration, 0x8E, 0);
  assert(!sensor.begin(0x76, &zeroCalibration));

  wire = device();
  assert(sensor.begin(0x77, &wire));
  assert(sensor.readSample(temperature, humidity, pressure));
  assert(wire.address == 0x77);
  for (int reg : {0xF7, 0xFA}) {
    uint8_t saved[3];
    std::memcpy(saved, wire.registers + reg, 3);
    wire.registers[reg] = 0x80;
    wire.registers[reg + 1] = 0;
    wire.registers[reg + 2] = 0;
    assert(!sensor.readSample(temperature, humidity, pressure));
    assert(std::isnan(temperature) && std::isnan(humidity) && std::isnan(pressure));
    std::memcpy(wire.registers + reg, saved, 3);
  }
  wire.registers[0xFD] = 0x80;
  wire.registers[0xFE] = 0;
  assert(!sensor.readSample(temperature, humidity, pressure));
  wire.registers[0xFA] = 0xFA; // Finite but out-of-range compensation must also fail.
  wire.registers[0xFD] = 0x88;
  wire.registers[0xFE] = 0xB8;
  assert(!sensor.readSample(temperature, humidity, pressure));
  assert(std::isnan(temperature) && std::isnan(humidity) && std::isnan(pressure));
  std::puts("BME280 checked-transfer and recovery tests passed");
}

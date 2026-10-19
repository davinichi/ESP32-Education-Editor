#pragma once
#include <Wire.h>
#include <math.h>

// Compensation equations and calibration layout adapted from Adafruit BME280 2.3.0.
// https://github.com/adafruit/Adafruit_BME280_Library
// Original driver introduction and BSD license are retained below.
/*!
 * @file Adafruit_BME280.cpp
 *
 * @mainpage Adafruit BME280 humidity, temperature & pressure sensor
 *
 * @section intro_sec Introduction
 *
 *  Driver for the BME280 humidity, temperature & pressure sensor
 *
 * These sensors use I2C or SPI to communicate, 2 or 4 pins are required
 * to interface.
 *
 * Designed specifically to work with the Adafruit BME280 Breakout
 * ----> http://www.adafruit.com/products/2652
 *
 *  Adafruit invests time and resources providing this open source code,
 *  please support Adafruit and open-source hardware by purchasing
 *  products from Adafruit!
 *
 * @section author Author
 *
 * Written by Kevin "KTOWN" Townsend for Adafruit Industries.
 *
 * @section license License
 *
 * BSD license, all text here must be included in any redistribution.
 * See the LICENSE file for details.
 *
 */

/*
Copyright (c) 2015, Limor Fried & Kevin Townsend for Adafruit Industries 
All rights reserved. 

Redistribution and use in source and binary forms, with or without 
modification, are permitted provided that the following conditions are met: 

 * Redistributions of source code must retain the above copyright notice, 
   this list of conditions and the following disclaimer. 
 * Redistributions in binary form must reproduce the above copyright 
   notice, this list of conditions and the following disclaimer in the 
   documentation and/or other materials provided with the distribution. 
 * Neither the name of Adafruit Industries nor the names of its 
   contributors may be used to endorse or promote products derived from 
   this software without specific prior written permission. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE 
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
POSSIBILITY OF SUCH DAMAGE.

*/

// All operations use the caller's shared Wire. No bus reset or pin reconfiguration.
class BME280Checked {
public:
  bool begin(uint8_t address, TwoWire *bus) {
    ready = false;
    wire = bus;
    sensorAddress = address;
    if (!wire || (address != 0x76 && address != 0x77)) return false;
    uint8_t id;
    if (!readRegisters(0xD0, &id, 1) || id != 0x60 || !writeRegister(0xE0, 0xB6)) return false;
    delay(10);
    uint8_t status;
    unsigned int attempts = 0;
    do {
      if (!readRegisters(0xF3, &status, 1)) return false;
      if (!(status & 1)) break;
      if (++attempts >= 20) return false;
      delay(10);
    } while (true);
    if (!readCalibration()) return false;
    // Same normal mode, x16 T/P/H oversampling, filter off and 0.5 ms standby.
    if (!writeRegister(0xF4, 0x00) || !writeRegister(0xF2, 0x05) ||
        !writeRegister(0xF5, 0x00) || !writeRegister(0xF4, 0xB7)) return false;
    uint8_t hum, config, control;
    if (!readRegisters(0xF2, &hum, 1) || !readRegisters(0xF4, &control, 1) ||
        !readRegisters(0xF5, &config, 1) || (hum & 7) != 5 ||
        control != 0xB7 || (config & 0xFD) != 0) return false;
    delay(120); // Complete the first x16 conversion before accepting samples.
    ready = true;
    return true;
  }

  bool readSample(float &temperature, float &humidity, float &pressure) {
    temperature = humidity = pressure = NAN;
    uint8_t raw[8];
    // One checked F7..FE burst preserves register shadowing for the full sample.
    if (!ready || !readRegisters(0xF7, raw, sizeof(raw))) return false;
    const int32_t adcP = ((int32_t)raw[0] << 12) | ((int32_t)raw[1] << 4) | (raw[2] >> 4);
    const int32_t adcT = ((int32_t)raw[3] << 12) | ((int32_t)raw[4] << 4) | (raw[5] >> 4);
    const int32_t adcH = ((int32_t)raw[6] << 8) | raw[7];
    if (adcP == 0x80000 || adcT == 0x80000 || adcH == 0x8000) return false;
    const float t = compensateTemperature(adcT);
    const float h = compensateHumidity(adcH);
    const float p = compensatePressure(adcP) / 100.0F;
    if (!isfinite(t) || !isfinite(h) || !isfinite(p) || t < -40 || t > 85 ||
        h < 0 || h > 100 || p < 300 || p > 1100) return false;
    temperature = t;
    humidity = h;
    pressure = p;
    return true;
  }

private:
  TwoWire *wire = nullptr;
  uint8_t sensorAddress = 0x76;
  bool ready = false;
  int32_t t_fine = 0;
typedef struct {
  uint16_t dig_T1;
  int16_t dig_T2;
  int16_t dig_T3;

  uint16_t dig_P1;
  int16_t dig_P2;
  int16_t dig_P3;
  int16_t dig_P4;
  int16_t dig_P5;
  int16_t dig_P6;
  int16_t dig_P7;
  int16_t dig_P8;
  int16_t dig_P9;

  uint8_t dig_H1;
  int16_t dig_H2;
  uint8_t dig_H3;
  int16_t dig_H4;
  int16_t dig_H5;
  int8_t dig_H6;
} Calibration;

  Calibration _bme280_calib = {};

  bool readRegisters(uint8_t reg, uint8_t *data, size_t count) {
    wire->beginTransmission(sensorAddress);
    if (wire->write(reg) != 1) {
      wire->endTransmission();
      return false;
    }
    if (wire->endTransmission(false) != 0 ||
        wire->requestFrom(sensorAddress, count, true) != count) return false;
    for (size_t i = 0; i < count; i++) {
      if (!wire->available()) return false;
      int value = wire->read();
      if (value < 0) return false;
      data[i] = (uint8_t)value;
    }
    return true;
  }

  bool writeRegister(uint8_t reg, uint8_t value) {
    wire->beginTransmission(sensorAddress);
    bool complete = wire->write(reg) == 1 && wire->write(value) == 1;
    return wire->endTransmission() == 0 && complete;
  }

  static uint16_t word(const uint8_t *data) { return data[0] | ((uint16_t)data[1] << 8); }

  bool readCalibration() {
    uint8_t tp[26], h[7];
    if (!readRegisters(0x88, tp, sizeof(tp)) || !readRegisters(0xE1, h, sizeof(h))) return false;
    _bme280_calib.dig_T1 = (uint16_t)word(tp + 0);
    _bme280_calib.dig_T2 = (int16_t)word(tp + 2);
    _bme280_calib.dig_T3 = (int16_t)word(tp + 4);
    _bme280_calib.dig_P1 = (uint16_t)word(tp + 6);
    _bme280_calib.dig_P2 = (int16_t)word(tp + 8);
    _bme280_calib.dig_P3 = (int16_t)word(tp + 10);
    _bme280_calib.dig_P4 = (int16_t)word(tp + 12);
    _bme280_calib.dig_P5 = (int16_t)word(tp + 14);
    _bme280_calib.dig_P6 = (int16_t)word(tp + 16);
    _bme280_calib.dig_P7 = (int16_t)word(tp + 18);
    _bme280_calib.dig_P8 = (int16_t)word(tp + 20);
    _bme280_calib.dig_P9 = (int16_t)word(tp + 22);
    _bme280_calib.dig_H1 = tp[25];
    _bme280_calib.dig_H2 = (int16_t)word(h);
    _bme280_calib.dig_H3 = h[2];
    _bme280_calib.dig_H4 = (int16_t)((int8_t)h[3] * 16) + (h[4] & 15);
    _bme280_calib.dig_H5 = (int16_t)((int8_t)h[5] * 16) + (h[4] >> 4);
    _bme280_calib.dig_H6 = (int8_t)h[6];
    return _bme280_calib.dig_T1 != 0 && _bme280_calib.dig_T1 != 0xFFFF &&
           _bme280_calib.dig_P1 != 0 && _bme280_calib.dig_P1 != 0xFFFF;
  }

float compensateTemperature(int32_t adc_T) {
  int32_t var1, var2;

  var1 = (int32_t)((adc_T / 8) - ((int32_t)_bme280_calib.dig_T1 * 2));
  var1 = (var1 * ((int32_t)_bme280_calib.dig_T2)) / 2048;
  var2 = (int32_t)((adc_T / 16) - ((int32_t)_bme280_calib.dig_T1));
  var2 = (((var2 * var2) / 4096) * ((int32_t)_bme280_calib.dig_T3)) / 16384;

  t_fine = var1 + var2;

  int32_t T = (t_fine * 5 + 128) / 256;

  return (float)T / 100;
}

float compensatePressure(int32_t adc_P) {
  int64_t var1, var2, var3, var4;


  var1 = ((int64_t)t_fine) - 128000;
  var2 = var1 * var1 * (int64_t)_bme280_calib.dig_P6;
  var2 = var2 + ((var1 * (int64_t)_bme280_calib.dig_P5) * 131072);
  var2 = var2 + (((int64_t)_bme280_calib.dig_P4) * 34359738368);
  var1 = ((var1 * var1 * (int64_t)_bme280_calib.dig_P3) / 256) +
         ((var1 * ((int64_t)_bme280_calib.dig_P2) * 4096));
  var3 = ((int64_t)1) * 140737488355328;
  var1 = (var3 + var1) * ((int64_t)_bme280_calib.dig_P1) / 8589934592;

  if (var1 == 0) {
    return NAN; // Invalid pressure calibration.
  }

  var4 = 1048576 - adc_P;
  var4 = (((var4 * 2147483648) - var2) * 3125) / var1;
  var1 = (((int64_t)_bme280_calib.dig_P9) * (var4 / 8192) * (var4 / 8192)) /
         33554432;
  var2 = (((int64_t)_bme280_calib.dig_P8) * var4) / 524288;
  var4 = ((var4 + var1 + var2) / 256) + (((int64_t)_bme280_calib.dig_P7) * 16);

  float P = var4 / 256.0;

  return P;
}

float compensateHumidity(int32_t adc_H) {
  int32_t var1, var2, var3, var4, var5;

  var1 = t_fine - ((int32_t)76800);
  var2 = (int32_t)(adc_H * 16384);
  var3 = (int32_t)(((int32_t)_bme280_calib.dig_H4) * 1048576);
  var4 = ((int32_t)_bme280_calib.dig_H5) * var1;
  var5 = (((var2 - var3) - var4) + (int32_t)16384) / 32768;
  var2 = (var1 * ((int32_t)_bme280_calib.dig_H6)) / 1024;
  var3 = (var1 * ((int32_t)_bme280_calib.dig_H3)) / 2048;
  var4 = ((var2 * (var3 + (int32_t)32768)) / 1024) + (int32_t)2097152;
  var2 = ((var4 * ((int32_t)_bme280_calib.dig_H2)) + 8192) / 16384;
  var3 = var5 * var2;
  var4 = ((var3 / 32768) * (var3 / 32768)) / 128;
  var5 = var3 - ((var4 * ((int32_t)_bme280_calib.dig_H1)) / 16);
  var5 = (var5 < 0 ? 0 : var5);
  var5 = (var5 > 419430400 ? 419430400 : var5);
  uint32_t H = (uint32_t)(var5 / 4096);

  return (float)H / 1024.0;
}
};

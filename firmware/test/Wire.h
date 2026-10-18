#pragma once
#include <cstddef>
#include <cstdint>
#include <cstring>
#include <algorithm>

inline void delay(unsigned long) {}

// Register-level fake: fail the actual data transfer, not an ACK probe.
class TwoWire {
public:
  uint8_t registers[256] = {};
  int failRegister = -1;
  bool shortRead = false;
  bool shortWrite = false;
  bool emptyRead = false;
  unsigned int requests = 0;
  uint8_t address = 0;
  uint8_t reg = 0;
  uint8_t tx[2] = {};
  size_t txSize = 0;
  size_t remaining = 0;
  void beginTransmission(uint8_t target) { address = target; txSize = 0; }
  size_t write(uint8_t value) {
    if (shortWrite) return 0;
    tx[txSize++] = value;
    return 1;
  }
  uint8_t endTransmission(bool = true) {
    if (!txSize) return 0;
    reg = tx[0];
    if (reg == failRegister) return 2;
    if (txSize == 2) registers[reg] = tx[1];
    return 0;
  }
  size_t requestFrom(uint8_t, size_t count, bool) {
    requests++;
    remaining = shortRead ? count - 1 : count;
    return remaining;
  }
  int available() { return emptyRead ? 0 : static_cast<int>(remaining); }
  int read() {
    if (emptyRead || !remaining) return -1;
    remaining--;
    return registers[reg++];
  }
};

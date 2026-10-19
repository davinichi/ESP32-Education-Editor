# BME280 transfer regression test

Run with a host C++ compiler; no ESP32 or serial port is used:

```sh
bash firmware/test/run.sh
```

The production `BME280Checked.h` runs against a register-level fake of Wire.
Tests cover NACK during the sample transfer despite a successful ACK probe,
short writes/reads, unavailable received bytes, initialization failures,
calibration timeout, disabled sample sentinels, range errors, both supported
addresses, known temperature/pressure compensation values, and recovery on the
next successful read without stale output or reinitialization.

The test does not establish hardware stability or electrical signal quality.

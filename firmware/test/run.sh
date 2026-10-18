#!/usr/bin/env bash
set -eu
test_binary=$(mktemp /tmp/bme280-checked.XXXXXX)
trap 'rm -f "$test_binary"' EXIT
g++ -std=c++11 -Wall -Wextra -Werror -fsanitize=undefined,address -Ifirmware/test firmware/test/bme280-checked.cpp -o "$test_binary"
"$test_binary"

# Lesson and Educational Use Guide

This guide offers planning ideas and activity examples for using ESP32 Education Editor v0.6 with Firmware v0.1.7 in lessons or other learning activities. It does not assume a particular grade level, lesson length, or prior classroom results; adapt it to the devices and learners. For setup instructions, see [Getting Started](GETTING_STARTED_EN.md).

## Audience and purpose

ESP32 Education Editor is a block programming environment for working with an ESP32-WROOM-32. Learners can read sensor values, process them with conditions, and represent results with an LED, OLED, servo, or another ESP32.

Rather than prescribing one complete procedure, this guide suggests introducing the basic operations and a shared mission, then giving learners room to predict, test, and improve their own solutions. Choose the level of challenge and activity format to fit the equipment and learners.

## A basic learning structure: Input → Decision → Output

The following sequence helps connect the roles of sensors, conditional logic, and outputs:

1. **Input:** Read a value from a sensor or GPIO.
2. **Decision:** Compare the value with a condition and decide what to do.
3. **Output:** Show the result through GPIO, an OLED, a servo, ESP-NOW, or another output.
4. **Review:** Compare observed values and behavior with the prediction, then adjust the program or condition.

For example, begin by reading temperature and displaying it on an OLED. Learners can then add an LED response based on a condition they choose. Set thresholds to fit the activity. If a threshold is used to make a health or safety decision, the teacher should verify it against an appropriate authoritative learning resource or standard.

## Read sensor values

Examples of available inputs include:

- **ESP32 DHT:** Read temperature and humidity from a DHT11 / DHT22.
- **ESP32 Ultrasonic:** Measure distance with an HC-SR04.
- **ESP32 GPIO:** Read a digital GPIO input.
- **ESP32 Connection:** Check the connection state, ESP32 MAC address, or channel.

Start by reading a value and making it visible with a variable or display. Learners can change one condition at a time and compare what the program reads with the situation around the sensor.

## Make decisions with conditions

Combine Scratch control and operator blocks to compare a sensor or input value with a condition. Before running the program, ask learners to predict what each condition will do. If the result differs from the prediction, give them time to inspect the condition and the program.

Example: show one output when a measured distance is below a chosen value and another when it is above that value. Learners select the value to suit the mission.

Learners can also calculate an environmental index from temperature and humidity with ESP32 Environmental Indices, then use a condition block to choose an output.

## Output to an LED, OLED, servo, and more

- **ESP32 GPIO:** Change an external circuit with digital output or PWM.
- **ESP32 OLED:** Display sensor values or processing results on an SSD1306 OLED.
- **ESP32 Servo:** Set a servo motor angle.
- **ESP32 ESP-NOW:** Send data to another ESP32.

Try outputs one at a time, then combine them with sensor inputs to examine the complete input-decision-output sequence. For a basic LED activity using GPIO23, see [Getting Started](GETTING_STARTED_EN.md#6-make-your-first-program).

## Core and extension challenges

### Core activity: Read and display a value

Read temperature and humidity from a DHT sensor or distance from an HC-SR04, then show the value on screen or an OLED. Learners decide which value to show, how often to update it, and how to present it.

### Core activity: Change an output based on an input

Compare a sensor value with a condition and change a GPIO output or OLED message. Have learners map the expected behavior for each condition before building and testing the blocks.

### Extension challenges: Combine behaviors

- Display DHT readings on an OLED and change a GPIO output when a condition is met.
- Change an OLED message or servo angle in response to HC-SR04 distance.
- Change PWM output in steps and compare the results.
- Use Data Processing to format multiple values or strings for display or sending.
- Send a reading to another ESP32 over ESP-NOW and display or use it on the receiving board.

These are activity ideas. Check the documentation for the actual modules being used for their specific wiring and power requirements.

Before reading from or sending output to a device, use its initialization or attach block when provided. Set the sensor type and signal pin for DHT; specify the TRIG / ECHO pins to attach an HC-SR04; initialize the OLED; and attach a servo to its control GPIO before using it. Choose GPIO numbers to match the actual wiring.

## Learner-led exploration

After introducing a shared mission, offer choices that let learners extend it:

- Decide what to measure and under what condition the program should respond.
- Choose whether to show a raw value, a message, or a set of levels.
- Change a threshold or repetition interval and compare the results.
- Record the initial prediction and measured behavior, then investigate differences.
- When something fails, decide whether to check the connection, input value, condition, output, or wiring first.
- Choose an additional feature, add its blocks incrementally, and test each change.

Allow more than one solution and ask learners to explain their choices.

## Collaborative work in pairs

For a pair activity, one learner might arrange blocks while the other predicts, observes, and records results. Rotate roles between parts of the mission so both learners participate in operating the Editor and explaining the work.

For ESP-NOW activities, learners can take sender and receiver roles. The sender transmits a value or message; the receiver displays or uses what arrives. Have them agree which board does each job, check that both boards use the same channel, and plan what to inspect if data does not arrive.

## Board-to-board communication with ESP-NOW

ESP-NOW can be used to try broadcast or MAC-addressed communication between two or more ESP32 boards. The communicating boards must use the same ESP-NOW channel. Firmware v0.1.7 starts on channel 1, and a selected channel resets to 1 after a restart.

ESP-NOW communication between boards does not require school Wi-Fi, a school LAN, or an internet connection. An internet connection is required to load the Public Editor and Firmware Installer from the web, and each Editor-to-board connection uses USB / Web Serial. This guide does not claim fully offline operation after the pages load.

## Reflection and assessment perspectives

Reflection can consider both the finished project and the learner's reasoning and testing process. Possible discussion or observation points include:

- Can the learner explain which value is the input and which condition is used for the decision?
- Did they predict the output for each condition and compare it with the observed behavior?
- When something did not work, did they inspect and revise the input, condition, output, or wiring?
- Can they explain which feature they added and why they chose it?
- In collaborative work, did they share roles, results, and observations?
- Did they handle component connections and power carefully?

These are examples of observation points, not guaranteed learning outcomes or a prescribed assessment standard. Choose an assessment approach that fits the lesson's purpose.

## Teacher preparation before a lesson

- Confirm the boards are ESP32-WROOM-32 and have Firmware v0.1.7 installed.
- Check that the Public Editor and Firmware Installer open in a Web Serial-compatible browser such as Chrome or Edge.
- Ensure internet access is available to load the Editor and Installer from the web.
- Check USB cables, port selection, and an Editor connection in advance.
- Close applications such as Arduino IDE's Serial Monitor that may use the same serial port.
- Check the documentation for each sensor, display, and motor; prepare GPIO assignments, power, and wiring accordingly.
- If using ESP-NOW, make sure communicating boards use the same channel.
- Decide on the activity goal, shared mission, optional challenges, and how learners will record their work.

## Safety and wiring notes

- Disconnect USB or other power before changing wiring. Do not rearrange a powered circuit.
- Do not apply 5 V to an ESP32 GPIO. The HC-SR04 ECHO output is approximately 5 V; reduce it to 3.3 V or less with a voltage divider or another suitable method before connecting it to the ESP32. The Firmware release notes include an example divider circuit.
- Use a current-limiting resistor in series with a bare LED, or use a module with a built-in resistor. Do not connect an LED directly to a GPIO.
- Do not power a motor or servo directly from a GPIO pin. Follow the module documentation for supply voltage, current, and wiring, and verify the required power arrangement before use.
- If a component model or its connection method is unclear, have the teacher check its documentation before wiring it.

## Further reading

- [Getting Started: setup and first program](GETTING_STARTED_EN.md)
- [README: project overview](../../README_EN.md)
- [Firmware v0.1.7 release notes](https://github.com/davinichi/ESP32-Education-Editor/releases/tag/firmware-v0.1.7)

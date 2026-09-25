import React from 'react';
import {FormattedMessage} from 'react-intl';

import musicIconURL from './music/music.png';
import musicInsetIconURL from './music/music-small.svg';

import penIconURL from './pen/pen.png';
import penInsetIconURL from './pen/pen-small.svg';

import videoSensingIconURL from './videoSensing/video-sensing.png';
import videoSensingInsetIconURL from './videoSensing/video-sensing-small.svg';

import text2speechIconURL from './text2speech/text2speech.png';
import text2speechInsetIconURL from './text2speech/text2speech-small.svg';

import translateIconURL from './translate/translate.png';
import translateInsetIconURL from './translate/translate-small.png';

import makeymakeyIconURL from './makeymakey/makeymakey.png';
import makeymakeyInsetIconURL from './makeymakey/makeymakey-small.svg';

import microbitIconURL from './microbit/microbit.png';
import microbitInsetIconURL from './microbit/microbit-small.svg';
import microbitConnectionIconURL from './microbit/microbit-illustration.svg';
import microbitConnectionSmallIconURL from './microbit/microbit-small.svg';

import ev3IconURL from './ev3/ev3.png';
import ev3InsetIconURL from './ev3/ev3-small.svg';
import ev3ConnectionIconURL from './ev3/ev3-hub-illustration.svg';
import ev3ConnectionSmallIconURL from './ev3/ev3-small.svg';

import wedo2IconURL from './wedo2/wedo.png'; // TODO: Rename file names to match variable/prop names?
import wedo2InsetIconURL from './wedo2/wedo-small.svg';
import wedo2ConnectionIconURL from './wedo2/wedo-illustration.svg';
import wedo2ConnectionSmallIconURL from './wedo2/wedo-small.svg';
import wedo2ConnectionTipIconURL from './wedo2/wedo-button-illustration.svg';

import boostIconURL from './boost/boost.png';
import boostInsetIconURL from './boost/boost-small.svg';
import boostConnectionIconURL from './boost/boost-illustration.svg';
import boostConnectionSmallIconURL from './boost/boost-small.svg';
import boostConnectionTipIconURL from './boost/boost-button-illustration.svg';

import gdxforIconURL from './gdxfor/gdxfor.png';
import gdxforInsetIconURL from './gdxfor/gdxfor-small.svg';
import gdxforConnectionIconURL from './gdxfor/gdxfor-illustration.svg';
import gdxforConnectionSmallIconURL from './gdxfor/gdxfor-small.svg';

import faceSensingIconURL from './faceSensing/faceSensing.png';
import faceSensingInsetIconURL from './faceSensing/faceSensing-small.svg';

// ESP32_EDUCATION_V02_IMPORT_BEGIN
import esp32ConnectionIconURL from './esp32educonnection/esp32educonnection.svg';
import esp32ConnectionInsetIconURL from './esp32educonnection/esp32educonnection-small.svg';
import esp32GPIOIconURL from './esp32edugpio/esp32edugpio.svg';
import esp32GPIOInsetIconURL from './esp32edugpio/esp32edugpio-small.svg';
import esp32DHTIconURL from './esp32edudht/esp32edudht.svg';
import esp32DHTInsetIconURL from './esp32edudht/esp32edudht-small.svg';
import esp32OLEDIconURL from './esp32eduoled/esp32eduoled.svg';
import esp32OLEDInsetIconURL from './esp32eduoled/esp32eduoled-small.svg';
import esp32ESPNowIconURL from './esp32eduespnow/esp32eduespnow.svg';
import esp32ESPNowInsetIconURL from './esp32eduespnow/esp32eduespnow-small.svg';
import esp32EnvironmentIconURL from './esp32eduenvironment/esp32eduenvironment.svg';
import esp32EnvironmentInsetIconURL from './esp32eduenvironment/esp32eduenvironment-small.svg';
import esp32DataIconURL from './esp32edudata/esp32edudata.svg';
import esp32DataInsetIconURL from './esp32edudata/esp32edudata-small.svg';
// ESP32_EDUCATION_V02_IMPORT_END
export default [
    // ESP32_EDUCATION_V02_CARD_BEGIN
    {
        name: <FormattedMessage defaultMessage="ESP32 接続" description="ESP32 connection extension" id="gui.extension.esp32educonnection.name" />,
        extensionId: 'esp32educonnection', collaborator: 'davinichi',
        iconURL: esp32ConnectionIconURL, insetIconURL: esp32ConnectionInsetIconURL,
        description: <FormattedMessage defaultMessage="最初に追加します。USB/Web SerialでESP32へ接続します。" description="ESP32 connection description" id="gui.extension.esp32educonnection.description" />,
        featured: true, disabled: false, bluetoothRequired: false, internetConnectionRequired: false
    },
    {
        name: <FormattedMessage defaultMessage="ESP32 GPIO" description="ESP32 GPIO extension" id="gui.extension.esp32edugpio.name" />,
        extensionId: 'esp32edugpio', collaborator: 'davinichi',
        iconURL: esp32GPIOIconURL, insetIconURL: esp32GPIOInsetIconURL,
        description: <FormattedMessage defaultMessage="GPIOのデジタル入出力を行います。" description="ESP32 GPIO description" id="gui.extension.esp32edugpio.description" />,
        featured: true, disabled: false, bluetoothRequired: false, internetConnectionRequired: false
    },
    {
        name: <FormattedMessage defaultMessage="ESP32 DHT" description="ESP32 DHT extension" id="gui.extension.esp32edudht.name" />,
        extensionId: 'esp32edudht', collaborator: 'davinichi',
        iconURL: esp32DHTIconURL, insetIconURL: esp32DHTInsetIconURL,
        description: <FormattedMessage defaultMessage="DHT11/DHT22の温度・湿度を取得します。" description="ESP32 DHT description" id="gui.extension.esp32edudht.description" />,
        featured: true, disabled: false, bluetoothRequired: false, internetConnectionRequired: false
    },
    {
        name: <FormattedMessage defaultMessage="ESP32 OLED" description="ESP32 OLED extension" id="gui.extension.esp32eduoled.name" />,
        extensionId: 'esp32eduoled', collaborator: 'davinichi',
        iconURL: esp32OLEDIconURL, insetIconURL: esp32OLEDInsetIconURL,
        description: <FormattedMessage defaultMessage="SSD1306 OLEDへ文字表示・部分消去を行います。" description="ESP32 OLED description" id="gui.extension.esp32eduoled.description" />,
        featured: true, disabled: false, bluetoothRequired: false, internetConnectionRequired: false
    },
    {
        name: <FormattedMessage defaultMessage="ESP32 ESP-NOW" description="ESP32 ESP-NOW extension" id="gui.extension.esp32eduespnow.name" />,
        extensionId: 'esp32eduespnow', collaborator: 'davinichi',
        iconURL: esp32ESPNowIconURL, insetIconURL: esp32ESPNowInsetIconURL,
        description: <FormattedMessage defaultMessage="ESP-NOWで文字列を送受信します。MAC空欄はブロードキャストです。" description="ESP32 ESP-NOW description" id="gui.extension.esp32eduespnow.description" />,
        featured: true, disabled: false, bluetoothRequired: false, internetConnectionRequired: false
    },
    {
        name: <FormattedMessage defaultMessage="ESP32 環境指数" description="ESP32 environment extension" id="gui.extension.esp32eduenvironment.name" />,
        extensionId: 'esp32eduenvironment', collaborator: 'davinichi',
        iconURL: esp32EnvironmentIconURL, insetIconURL: esp32EnvironmentInsetIconURL,
        description: <FormattedMessage defaultMessage="温度・湿度から10種類の環境指数を計算します。" description="ESP32 environment description" id="gui.extension.esp32eduenvironment.description" />,
        featured: true, disabled: false, bluetoothRequired: false, internetConnectionRequired: false
    },
    {
        name: <FormattedMessage defaultMessage="データ処理" description="Data processing extension" id="gui.extension.esp32edudata.name" />,
        extensionId: 'esp32edudata', collaborator: 'davinichi',
        iconURL: esp32DataIconURL, insetIconURL: esp32DataInsetIconURL,
        description: <FormattedMessage defaultMessage="CSV分解と文字列の切り出し・結合を行います。" description="Data processing description" id="gui.extension.esp32edudata.description" />,
        featured: true, disabled: false, bluetoothRequired: false, internetConnectionRequired: false
    },
    // ESP32_EDUCATION_V02_CARD_END
    {
        name: (
            <FormattedMessage
                defaultMessage="Music"
                description="Name for the 'Music' extension"
                id="gui.extension.music.name"
            />
        ),
        extensionId: 'music',
        iconURL: musicIconURL,
        insetIconURL: musicInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Play instruments and drums."
                description="Description for the 'Music' extension"
                id="gui.extension.music.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Pen"
                description="Name for the 'Pen' extension"
                id="gui.extension.pen.name"
            />
        ),
        extensionId: 'pen',
        iconURL: penIconURL,
        insetIconURL: penInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Draw with your sprites."
                description="Description for the 'Pen' extension"
                id="gui.extension.pen.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Video Sensing"
                description="Name for the 'Video Sensing' extension"
                id="gui.extension.videosensing.name"
            />
        ),
        extensionId: 'videoSensing',
        iconURL: videoSensingIconURL,
        insetIconURL: videoSensingInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Sense motion with the camera."
                description="Description for the 'Video Sensing' extension"
                id="gui.extension.videosensing.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Face Sensing"
                description="Name for the 'Face Sensing' extension"
                id="gui.extension.faceSensing.name"
            />
        ),
        extensionId: 'faceSensing',
        iconURL: faceSensingIconURL,
        insetIconURL: faceSensingInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Sense faces with the camera."
                description="Description for the 'Face Sensing' extension"
                id="gui.extension.faceSensing.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Text to Speech"
                description="Name for the Text to Speech extension"
                id="gui.extension.text2speech.name"
            />
        ),
        extensionId: 'text2speech',
        collaborator: 'Amazon Web Services',
        iconURL: text2speechIconURL,
        insetIconURL: text2speechInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Make your projects talk."
                description="Description for the Text to speech extension"
                id="gui.extension.text2speech.description"
            />
        ),
        featured: true,
        internetConnectionRequired: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Translate"
                description="Name for the Translate extension"
                id="gui.extension.translate.name"
            />
        ),
        extensionId: 'translate',
        collaborator: 'Google',
        iconURL: translateIconURL,
        insetIconURL: translateInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Translate text into many languages."
                description="Description for the Translate extension"
                id="gui.extension.translate.description"
            />
        ),
        featured: true,
        internetConnectionRequired: true
    },
    {
        name: 'Makey Makey',
        extensionId: 'makeymakey',
        collaborator: 'JoyLabz',
        iconURL: makeymakeyIconURL,
        insetIconURL: makeymakeyInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Make anything into a key."
                description="Description for the 'Makey Makey' extension"
                id="gui.extension.makeymakey.description"
            />
        ),
        featured: true
    },
    {
        name: 'micro:bit',
        extensionId: 'microbit',
        collaborator: 'micro:bit',
        iconURL: microbitIconURL,
        insetIconURL: microbitInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Connect your projects with the world."
                description="Description for the 'micro:bit' extension"
                id="gui.extension.microbit.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: true,
        internetConnectionRequired: true,
        launchPeripheralConnectionFlow: true,
        useAutoScan: false,
        connectionIconURL: microbitConnectionIconURL,
        connectionSmallIconURL: microbitConnectionSmallIconURL,
        prescanMessage: (
            <FormattedMessage
                defaultMessage="Turn on your micro:bit, then press the button below to start searching for your device."
                description="Prompt before searching for a micro:bit"
                id="gui.extension.microbit.prescanMessage"
            />
        ),
        scanBeginMessage: (
            <FormattedMessage
                defaultMessage="Keep your micro:bit on and nearby."
                description="Information shown while searching for a micro:bit, before one is found"
                id="gui.extension.microbit.scanBeginMessage"
            />
        ),
        connectingMessage: (
            <FormattedMessage
                defaultMessage="Connecting"
                description="Message to help people connect to their micro:bit."
                id="gui.extension.microbit.connectingMessage"
            />
        ),
        helpLink: 'https://scratch.mit.edu/microbit'
    },
    {
        name: 'Go Direct Force & Acceleration',
        extensionId: 'gdxfor',
        collaborator: 'Vernier',
        iconURL: gdxforIconURL,
        insetIconURL: gdxforInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Sense push, pull, motion, and spin."
                description="Description for the Vernier Go Direct Force and Acceleration sensor extension"
                id="gui.extension.gdxfor.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: true,
        internetConnectionRequired: true,
        launchPeripheralConnectionFlow: true,
        useAutoScan: false,
        connectionIconURL: gdxforConnectionIconURL,
        connectionSmallIconURL: gdxforConnectionSmallIconURL,
        prescanMessage: (
            <FormattedMessage
                defaultMessage="Turn on your Go Direct, then press the button below to start searching for your device."
                description="Prompt before searching for a Vernier Go Direct device"
                id="gui.extension.gdxfor.prescanMessage"
            />
        ),
        scanBeginMessage: (
            <FormattedMessage
                defaultMessage="Keep your Vernier Go Direct on and nearby."
                description="Information shown while searching for a Vernier Go Direct, before one is found"
                id="gui.extension.gdxfor.scanBeginMessage"
            />
        ),
        connectingMessage: (
            <FormattedMessage
                defaultMessage="Connecting"
                description="Message to help people connect to their force and acceleration sensor."
                id="gui.extension.gdxfor.connectingMessage"
            />
        ),
        helpLink: 'https://scratch.mit.edu/vernier'
    },
    {
        name: 'LEGO MINDSTORMS EV3',
        extensionId: 'ev3',
        collaborator: 'LEGO',
        iconURL: ev3IconURL,
        insetIconURL: ev3InsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Build interactive robots and more."
                description="Description for the 'LEGO MINDSTORMS EV3' extension"
                id="gui.extension.ev3.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: true,
        internetConnectionRequired: true,
        launchPeripheralConnectionFlow: true,
        useAutoScan: false,
        connectionIconURL: ev3ConnectionIconURL,
        connectionSmallIconURL: ev3ConnectionSmallIconURL,
        prescanMessage: (
            <FormattedMessage
                defaultMessage="Turn on your LEGO EV3, then press the button below to start searching for your device."
                description="Prompt before searching for a LEGO EV3"
                id="gui.extension.ev3.prescanMessage"
            />
        ),
        scanBeginMessage: (
            <FormattedMessage
                defaultMessage="Keep your LEGO EV3 on and nearby."
                description="Information shown while searching for a LEGO EV3, before one is found"
                id="gui.extension.ev3.scanBeginMessage"
            />
        ),
        connectingMessage: (
            <FormattedMessage
                defaultMessage="Connecting. Make sure the pin on your EV3 is set to 1234."
                description="Message to help people connect to their EV3. Must note the PIN should be 1234."
                id="gui.extension.ev3.connectingMessage"
            />
        ),
        helpLink: 'https://scratch.mit.edu/ev3'
    },
    {
        name: 'LEGO BOOST',
        extensionId: 'boost',
        collaborator: 'LEGO',
        iconURL: boostIconURL,
        insetIconURL: boostInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Bring robotic creations to life."
                description="Description for the 'LEGO BOOST' extension"
                id="gui.extension.boost.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: true,
        internetConnectionRequired: true,
        launchPeripheralConnectionFlow: true,
        useAutoScan: true,
        connectionIconURL: boostConnectionIconURL,
        connectionSmallIconURL: boostConnectionSmallIconURL,
        connectionTipIconURL: boostConnectionTipIconURL,
        prescanMessage: (
            <FormattedMessage
                // eslint-disable-next-line @stylistic/max-len
                defaultMessage="Press the button on your LEGO BOOST, then press the button below to start searching for your device."
                description="Prompt before searching for a LEGO BOOST"
                id="gui.extension.boost.prescanMessage"
            />
        ),
        scanBeginMessage: (
            <FormattedMessage
                defaultMessage="Keep your LEGO BOOST awake and nearby."
                description="Information shown while searching for a LEGO BOOST, before one is found"
                id="gui.extension.boost.scanBeginMessage"
            />
        ),
        connectingMessage: (
            <FormattedMessage
                defaultMessage="Connecting"
                description="Message to help people connect to their BOOST."
                id="gui.extension.boost.connectingMessage"
            />
        ),
        helpLink: 'https://scratch.mit.edu/boost'
    },
    {
        name: 'LEGO Education WeDo 2.0',
        extensionId: 'wedo2',
        collaborator: 'LEGO',
        iconURL: wedo2IconURL,
        insetIconURL: wedo2InsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Build with motors and sensors."
                description="Description for the 'LEGO WeDo 2.0' extension"
                id="gui.extension.wedo2.description"
            />
        ),
        featured: true,
        disabled: false,
        bluetoothRequired: true,
        internetConnectionRequired: true,
        launchPeripheralConnectionFlow: true,
        useAutoScan: true,
        connectionIconURL: wedo2ConnectionIconURL,
        connectionSmallIconURL: wedo2ConnectionSmallIconURL,
        connectionTipIconURL: wedo2ConnectionTipIconURL,
        prescanMessage: (
            <FormattedMessage
                // eslint-disable-next-line @stylistic/max-len
                defaultMessage="Press the button on your LEGO WeDo 2.0, then press the button below to start searching for your device."
                description="Prompt before searching for a LEGO WeDo 2.0"
                id="gui.extension.wedo2.prescanMessage"
            />
        ),
        scanBeginMessage: (
            <FormattedMessage
                defaultMessage="Keep your LEGO WeDo 2.0 awake and nearby."
                description="Information shown while searching for a LEGO WeDo 2.0, before one is found"
                id="gui.extension.wedo2.scanBeginMessage"
            />
        ),
        connectingMessage: (
            <FormattedMessage
                defaultMessage="Connecting"
                description="Message to help people connect to their WeDo."
                id="gui.extension.wedo2.connectingMessage"
            />
        ),
        helpLink: 'https://scratch.mit.edu/wedo'
    }
];

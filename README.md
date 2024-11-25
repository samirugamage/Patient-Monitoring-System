# ESP32-C3 Health Monitoring IoT Device

## Overview

This project demonstrates a wearable IoT device built using the ESP32-C3, designed for patient rehabilitation. It includes features such as accurate step counting, fall detection with emergency notifications, and a real-time web dashboard for data visualization. This repository contains all necessary firmware, server code, and schematics to implement the solution.

---

## Features

- **Accurate Step Counting**: Uses gyroscope data for improved accuracy.
- **Fall Detection**: Alerts responsible parties upon detecting sharp accelerations.
- **Web Dashboard**: Real-time visualization of step counts and fall notifications.
- **Customizable Firmware**: Easily configurable using the Arduino IDE.
- **Optional**: Classify movements (walking, jogging, running) using machine learning.

---

## Hardware Requirements

- ESP32-C3 Dev Kit
- MPU9250 Gyroscope and Accelerometer Sensor
- Wi-Fi Connection
- Computer with Arduino IDE and Node.js installed

---

## Project Structure

```plaintext
.
├── Firmware/
│   ├── esp32code.ino        # Firmware for ESP32-C3
│   └── libraries/           # Required Arduino libraries
├── Server/
│   ├── server.js            # Node.js server code
│   ├── public/
│   │   ├── index.html       # Web dashboard
│   │   └── assets/          # Static files for dashboard
├── Documentation/
│   ├── schematics.pdf       # Circuit schematics
│   ├── dimensions.jpg       # PCB dimensions
│   └── instructions.docx    # Setup and execution guide
└── README.md                # This file

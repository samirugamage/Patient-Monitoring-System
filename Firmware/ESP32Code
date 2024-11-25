// Include necessary libraries
#include <WiFi.h>
#include <Wire.h>
#include <MPU9250_asukiaaa.h>
#include <PubSubClient.h> // Added for MQTT

// Wi-Fi network credentials
const char* ssid = "admin";
const char* password = "password";

// MQTT Broker settings
const char* mqtt_server = "192.168.26.230"; // Replace with your MQTT broker IP
const int mqtt_port = 1883;
const char* mqtt_user = ""; // Add if your broker requires authentication
const char* mqtt_password = ""; // Add if your broker requires authentication
const char* mqtt_topic = "patient/data"; // MQTT topic to publish data

// I2C pins for ESP32-C3
#define SDA_PIN 2
#define SCL_PIN 3

WiFiClient espClient;
PubSubClient client(espClient);
MPU9250_asukiaaa mySensor;

// Variables for pedometer
int stepCount = 0;
float prev_magnitude = 0;
unsigned long prevStepTime = 0;
const float stepThreshold = 1.4; // Adjust this threshold based on your sensitivity
const unsigned long stepDebounceTime = 300; // Minimum time between steps (ms)

// Gyroscope variables
float prev_gyroscope_magnitude = 0;

// Constants for distance and calorie calculation
const float stepLength = 0.78;  // Average step length in meters (adjust based on user)
const float weight = 70.0;      // User weight in kg (adjustable)
const float caloriesPerKmPerKg = 0.57; // Calories burned per km per kg

// Variables for distance and calories
float distance = 0;
float caloriesBurned = 0;

// Variables for fall detection
bool fallDetected = false;
unsigned long fallTimestamp = 0;
const float fallThreshold = 2.5;   // Acceleration threshold to detect fall (in g, ~25 m/s^2)
const unsigned long fallInactivityPeriod = 3000; // 3 seconds of inactivity after the fall

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
}

void reconnect() {
  // Loop until we're reconnected to MQTT
  while (!client.connected()) {
    Serial.print("Connecting to MQTT broker...");
    // Attempt to connect
    if (client.connect("ESP32Client", mqtt_user, mqtt_password)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  // Initialize Serial communication
  Serial.begin(115200);
  while (!Serial);  // Wait for the serial to connect. Needed for native USB

  Serial.println("Starting...");

  // Initialize I2C communication
  Wire.begin(SDA_PIN, SCL_PIN);
  mySensor.setWire(&Wire);

  // Initialize sensors
  mySensor.beginAccel();
  mySensor.beginGyro();

  // Connect to Wi-Fi
  setup_wifi();

  // Setup MQTT client
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  // Ensure Wi-Fi is connected
  if (WiFi.status() != WL_CONNECTED) {
    setup_wifi();
  }

  // Ensure MQTT is connected
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Update sensor readings
  if (mySensor.accelUpdate() == 0 && mySensor.gyroUpdate() == 0) {
    float ax = mySensor.accelX();
    float ay = mySensor.accelY();
    float az = mySensor.accelZ();

    float gx = mySensor.gyroX();
    float gy = mySensor.gyroY();
    float gz = mySensor.gyroZ();

    // Calculate magnitude of acceleration
    float accel_magnitude = sqrt(ax * ax + ay * ay + az * az);

    // Calculate magnitude of gyroscope data
    float gyro_magnitude = sqrt(gx * gx + gy * gy + gz * gz);

    // Combined condition for step detection (accelerometer and gyroscope)
    if (accel_magnitude > stepThreshold && gyro_magnitude > prev_gyroscope_magnitude && (millis() - prevStepTime) > stepDebounceTime) {
      stepCount++;
      prevStepTime = millis();  // Update time for the last step
      Serial.println("Step Detected!");

      // Calculate distance (in meters)
      distance = stepCount * stepLength;

      // Calculate calories burned
      caloriesBurned = (distance / 1000.0) * weight * caloriesPerKmPerKg;
    }

    // --- Fall Detection Logic ---
    // If acceleration exceeds fall threshold, consider it a fall
    if (accel_magnitude > fallThreshold) {
      fallDetected = true;
      fallTimestamp = millis();  // Record the time of the fall
      Serial.println("Fall Detected!");
    }

    // If a fall is detected, check for inactivity after the fall
    if (fallDetected && (millis() - fallTimestamp > fallInactivityPeriod)) {
      if (accel_magnitude < stepThreshold) {  // If there's low movement after fall
        Serial.println("Inactivity after fall detected! Fall confirmed.");
        fallDetected = false;  // Reset fall detection after alert
      }
    }

    // Prepare JSON payload
    String jsonData = "{\"stepCount\":" + String(stepCount) +
                      ",\"distance\":" + String(distance) +
                      ",\"caloriesBurned\":" + String(caloriesBurned) +
                      ",\"fallDetected\":" + (fallDetected ? "true" : "false") +
                      ",\"accelX\":" + String(ax) +
                      ",\"accelY\":" + String(ay) +
                      ",\"accelZ\":" + String(az) +
                      ",\"gyroX\":" + String(gx) +
                      ",\"gyroY\":" + String(gy) +
                      ",\"gyroZ\":" + String(gz) + "}";

    // Publish data to MQTT broker
    if (client.publish(mqtt_topic, jsonData.c_str())) {
      Serial.println("Data published to MQTT broker");
    } else {
      Serial.println("Failed to publish data");
    }

    prev_magnitude = accel_magnitude;          // Save the previous magnitude value
    prev_gyroscope_magnitude = gyro_magnitude; // Save previous gyro magnitude
  } else {
    Serial.println("Failed to read sensor data");
  }

  delay(200);  // Adjust delay as needed
}

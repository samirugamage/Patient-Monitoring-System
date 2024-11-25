// server.js
const express = require('express');
const app = express();
const mqtt = require('mqtt');
const path = require('path');
const nodemailer = require('nodemailer');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Jerryriggg123@gmail.com',
    pass: '123#itpm456', // Replace with your email password or app password
  },
});

// MQTT client setup
const mqttBrokerUrl = 'mqtt://192.168.1.3'; // Replace with your broker URL
const mqttTopic = 'patient/data';
const mqttClient = mqtt.connect(mqttBrokerUrl);

// Data storage for SSE clients
let clients = [];

// MQTT client event handlers
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe(mqttTopic, (err) => {
    if (err) {
      console.error('Failed to subscribe to MQTT topic:', err);
    } else {
      console.log(`Subscribed to topic ${mqttTopic}`);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  // Parse the message
  const data = JSON.parse(message.toString());
  console.log('Received MQTT message:', data);

  // Send data to all connected SSE clients
  clients.forEach((res) => res.write(`data: ${JSON.stringify(data)}\n\n`));

  // Send email if fallDetected is true
  if (data.fallDetected) {
    const mailOptions = {
      from: 'Jerryriggg123@gmail.com',
      to: 'samiru.gamage@gmail.com',
      subject: 'Fall Detected Alert',
      text: 'Alert: The patient has fallen down!',
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('Email error:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
});

// SSE endpoint
app.get('/events', (req, res) => {
  // Set headers for SSE
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  console.log('Client connected to SSE');
  clients.push(res);

  // Remove client when connection closes
  req.on('close', () => {
    console.log('Client disconnected from SSE');
    clients = clients.filter((client) => client !== res);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

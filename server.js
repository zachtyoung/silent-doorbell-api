// File: server.js
// Patch for older Node.js versions that don't have Object.hasOwn
if (!Object.hasOwn) {
  Object.hasOwn = Function.call.bind(Object.prototype.hasOwnProperty);
}

const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON
app.use(bodyParser.json());

// Route to handle ESP32 trigger
app.post("/trigger", async (req, res) => {
  try {
    console.log("Received trigger from ESP32:", req.body);

    // Optional: You can add authentication here
    // const apiKey = req.headers['x-api-key'];
    // if (apiKey !== process.env.ESP32_API_KEY) {
    //   return res.status(401).json({ success: false, message: 'Unauthorized' });
    // }

    // Prepare the message
    const message = "Someone rang the doorbell";
    const topic = process.env.NTFY_TOPIC;
    const priority = "high";
    const title = "Front Door";

    // Send notification using ntfy
    const ntfyUrl = `${process.env.NTFY_SERVER || "https://ntfy.sh"}/${topic}`;
    console.log(`Sending notification to: ${ntfyUrl}`);

    const ntfyResponse = await axios.post(ntfyUrl, message, {
      headers: {
        Title: title,
        Priority: priority,
        Tags: "house",
      },
    });

    console.log("ntfy response status:", ntfyResponse.status);

    if (ntfyResponse.status === 200) {
      return res.json({
        success: true,
        message: "Notification sent successfully",
        topic: topic,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to send notification",
        error: ntfyResponse.statusText,
      });
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Simple health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Notification server running on port ${PORT}`);
});

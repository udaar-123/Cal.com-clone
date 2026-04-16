import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, "..");

// 1. Load Environment (Sync)
const dotEnvPath = path.join(serverRoot, ".env");
if (fs.existsSync(dotEnvPath)) {
  dotenv.config({ path: dotEnvPath });
}

const app = express();
const port = process.env.PORT || 4000;
const host = "0.0.0.0";

let isAppLoaded = false;

// 2. Start Listening IMMEDIATELY to satisfy Render's port scan
app.listen(port, host, () => {
  console.log(`🚀 TCP Port ${port} is now open. Render scan should pass.`);
  console.log(`🔗 Listening on ${host}:${port}`);

  // 3. Load the rest of the app logic asynchronously
  console.log("📦 Loading application logic...");
  import("./app.js")
    .then((module) => {
      const mainApp = module.default;
      // Mount the main app logic as middleware
      app.use(mainApp);
      isAppLoaded = true;
      console.log("✅ Main application logic loaded and mounted.");
    })
    .catch((err) => {
      console.error("❌ CRITICAL: Failed to load application logic:", err);
    });
});

// Root handler that shows "initializing" until the main app is ready
app.get("/", (req, res, next) => {
  if (isAppLoaded) {
    next(); // Fall through to mainApp's handlers
  } else {
    res.send({ status: "initializing", message: "Server is starting up..." });
  }
});

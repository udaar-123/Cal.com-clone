import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, "..");

// Match common local overrides: `.env` then `.env.local` (later wins).
const dotEnvPath = path.join(serverRoot, ".env");
if (fs.existsSync(dotEnvPath)) {
  dotenv.config({ path: dotEnvPath });
}

const dotEnvLocalPath = path.join(serverRoot, ".env.local");
if (fs.existsSync(dotEnvLocalPath)) {
  dotenv.config({ path: dotEnvLocalPath, override: true });
}

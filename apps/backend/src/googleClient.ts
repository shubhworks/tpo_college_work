import { google } from "googleapis";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "apps/backend/.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON in env");
}


const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);


const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets.readonly"
  ],
});

export async function getSheetsClient() {
  return google.sheets({ version: "v4", auth });
}

export async function getDriveClient() {
  return google.drive({ version: "v3", auth });
}

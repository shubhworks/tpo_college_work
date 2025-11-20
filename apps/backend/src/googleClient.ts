import { google } from "googleapis";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// const keyFile = path.join(__dirname, "../credentials.json");
const keyFile = path.join(process.cwd(), "credentials.json");

const auth = new google.auth.GoogleAuth({
  keyFile,
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

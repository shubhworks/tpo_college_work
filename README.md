### How to add new batches in the future:
1. Open apps/backend/src/config/batches.ts.
2. Add a new entry for the year (e.g., "2028").
3. Paste the new Google Sheet ID in the spreadsheetId field.
4. If the form structure remains the same as 2027, the existing mapping will work "out of the box".

>   The 2026 batch remains untouched and continues to work as it did before. You can now simply give a fileId (spreadsheet ID) in the URL to see data rendered for any new live form.
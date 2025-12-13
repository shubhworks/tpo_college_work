export function parseDriveLinks(value: string): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map(v => v.trim())
    .filter(v => v.length > 0);
}

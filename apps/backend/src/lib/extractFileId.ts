export function extractFileId(url: string = "") {
    const idMatch = url.match(/id=([^&]+)/);
    if (idMatch) return idMatch[1];

    const fileMatch = url.match(/\/d\/([^/]+)/);
    if (fileMatch) return fileMatch[1];

    return "";
}

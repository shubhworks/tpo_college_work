export function extractFileId(url: string = "") {
    if (!url) return "";
    
    const idMatch = url.match(/id=([^&]+)/);
    if (idMatch) return idMatch[1];

    const fileMatch = url.match(/\/d\/([^/]+)/);
    if (fileMatch) return fileMatch[1];

    // If it's not a URL, it might be the ID itself
    if (!url.startsWith("http") && url.length > 20) {
        return url.trim();
    }

    return "";
}

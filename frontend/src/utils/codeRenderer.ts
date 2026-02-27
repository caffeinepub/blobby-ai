export function createIframeBlobUrl(htmlContent: string): string {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    return URL.createObjectURL(blob);
}

export function revokeIframeBlobUrl(url: string): void {
    URL.revokeObjectURL(url);
}

export function downloadHtmlFile(htmlContent: string, filename: string = 'blobby-app.html'): void {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function extractHtmlFromMarkdown(text: string): string | null {
    // Try to extract full HTML document
    const fullHtmlMatch = text.match(/```(?:html)?\s*(<!DOCTYPE html[\s\S]*?<\/html>)\s*```/i);
    if (fullHtmlMatch) return fullHtmlMatch[1];

    // Try to extract HTML code block
    const htmlBlockMatch = text.match(/```html\s*([\s\S]*?)\s*```/i);
    if (htmlBlockMatch) return htmlBlockMatch[1];

    // Check if the text itself looks like HTML
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        return text;
    }

    return null;
}

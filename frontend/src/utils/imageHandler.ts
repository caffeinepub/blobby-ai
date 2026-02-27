export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function createThumbnailUrl(file: File): string {
    return URL.createObjectURL(file);
}

export function revokeThumbnailUrl(url: string): void {
    URL.revokeObjectURL(url);
}

export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!isImageFile(file)) {
        return { valid: false, error: 'Please upload an image file (JPG, PNG, GIF, WebP, etc.)' };
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        return { valid: false, error: 'Image must be smaller than 10MB' };
    }
    return { valid: true };
}

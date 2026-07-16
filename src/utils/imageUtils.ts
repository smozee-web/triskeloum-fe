// Builds complete image URL by prepending base URL if needed
export const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    // Uploaded files are only served under the /api/v1/uploads mount
    // (see app.bootstrap.ts / index.route.v1.ts) — VITE_BASE_WITHOUT_ORIGIN
    // is just the bare origin, so it 404s without the /api/v1 prefix.
    return `${import.meta.env.VITE_BASE_URL}/${imagePath}`;
};
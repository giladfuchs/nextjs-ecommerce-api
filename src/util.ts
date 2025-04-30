export function title_to_handle(title: string): string {
    const handle = title.trim().replace(/\s+/g, '-'); // Replace spaces with dash
    return handle
}
/**
 * Converts file size in bytes to a more readable format (such as KB, MB, GB, etc.).
 *
 * @param {number} file - File size in bytes.
 * @returns {string} The file size formatted in the appropriate units (example: "1.23 MB").
 *
 * @example
 * // Usage examples:
 * const fileSize = useFileSize(new Blob([1048576])) ||  useFileSize(1048576); // 1048576 bytes = 1 MB
 * console.log(fileSize); // Output: "1.00 MB"
 */
function useFileSize(file) {
    if (!(file instanceof Blob)) return "Invalid file";
    const units = ["bytes", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "NB", "DB"]; // Add units, customize global standards
    let size = file.size;
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    
    // Show results of reading the entire file
    return size.toFixed(2) + ' ' + units[i];
}


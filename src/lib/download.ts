/** Hands text content to the browser as a file download. */
export const downloadText = (
  filename: string,
  content: string,
  mime = "application/octet-stream",
): void => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

/** `4608` -> `4.5 KB`, for a download's size line. */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

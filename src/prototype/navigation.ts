export const startScreenId = "sign-in";
export function screenIdFromHash(hash: string): string {
  try {
    return decodeURIComponent(hash.replace(/^#/, "")) || startScreenId;
  } catch {
    return startScreenId;
  }
}

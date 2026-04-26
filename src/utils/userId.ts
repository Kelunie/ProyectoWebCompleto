// src/utils/userId.ts

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns a random user ID.
 * ⚠️ Temporary: a new ID is generated every time the app starts.
 * Replace with MMKV/AsyncStorage later for persistence.
 */
export async function getUserId(): Promise<string> {
  return generateUUID();
}
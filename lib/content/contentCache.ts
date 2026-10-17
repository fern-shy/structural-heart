import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Content } from "@/types/content";

const CACHE_KEY = "structural-heart:content-cache:v1";

/** Returns the last successfully fetched content tree, or null if none/invalid. */
export async function readCachedContent(): Promise<Content | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Content;
    if (!parsed || !Array.isArray(parsed.categories)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Persists the latest fetched content tree for instant, offline startup. */
export async function writeCachedContent(content: Content): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(content));
  } catch {
    // Caching is best-effort; ignore write failures.
  }
}

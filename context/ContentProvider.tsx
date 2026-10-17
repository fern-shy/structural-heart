import bundledContent from "@/data/content";
import { readCachedContent, writeCachedContent } from "@/lib/content/contentCache";
import { fetchContent } from "@/lib/content/fetchContent";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { Content } from "@/types/content";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ContentSource = "firestore" | "cache" | "bundled";

type ContentContextValue = {
  content: Content | null;
  loading: boolean;
  error: Error | null;
  /** Where the currently displayed content came from. */
  source: ContentSource;
  /** Re-fetch from Firestore (e.g. pull-to-refresh). */
  refresh: () => void;
};

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<ContentSource>("bundled");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setLoading(true);

    // Show cached content immediately while we revalidate from the network.
    const cached = await readCachedContent();
    if (cached && mounted.current) {
      setContent(cached);
      setSource("cache");
    }

    if (!isFirebaseConfigured) {
      if (mounted.current) {
        setContent((prev) => prev ?? cached ?? bundledContent);
        setSource(cached ? "cache" : "bundled");
        setLoading(false);
      }
      return;
    }

    try {
      const fresh = await fetchContent();
      if (!mounted.current) return;
      // Treat an empty Firestore as "not yet seeded" and keep the fallback.
      if (fresh.categories.length > 0) {
        setContent(fresh);
        setSource("firestore");
        setError(null);
        void writeCachedContent(fresh);
      } else if (!cached) {
        setContent(bundledContent);
        setSource("bundled");
      }
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
      // Fall back to bundled snapshot only if we have nothing to show.
      setContent((prev) => prev ?? cached ?? bundledContent);
      if (!cached) setSource("bundled");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load]);

  const refresh = useCallback(() => {
    void load(false);
  }, [load]);

  return (
    <ContentContext.Provider value={{ content, loading, error, source, refresh }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return ctx;
}

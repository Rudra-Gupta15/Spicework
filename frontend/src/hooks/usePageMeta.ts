import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { NAVIGATION } from "@/config/navigation";
import type { ResolvedPageMeta } from "@/types/navigation";

/** Flat `path -> meta` lookup, built once at module load. */
const META_BY_PATH = new Map<string, ResolvedPageMeta>();

for (const item of NAVIGATION) {
  if (item.path) {
    META_BY_PATH.set(item.path, {
      title: item.title ?? item.label,
      subtitle: item.subtitle,
    });
  }

  for (const child of item.children ?? []) {
    META_BY_PATH.set(child.path, {
      title: child.title ?? child.label,
      subtitle: child.subtitle,
    });
  }
}

/**
 * Resolves the header title/subtitle for the active route from the
 * navigation config, so pages never repeat that metadata.
 */
export const usePageMeta = (): ResolvedPageMeta => {
  const { pathname } = useLocation();

  return useMemo(
    () => META_BY_PATH.get(pathname) ?? { title: "Spiceworks" },
    [pathname],
  );
};

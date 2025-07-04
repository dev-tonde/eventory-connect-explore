import { useEffect } from "react";
import { updatePageMetadata, type PageMetadata } from "@/lib/metadata";

/**
 * Custom hook to update page metadata (title, description, keywords, image, url).
 * Automatically updates when any metadata property changes.
 */
export const useMetadata = (metadata: PageMetadata) => {
  useEffect(() => {
    updatePageMetadata(metadata);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    metadata.title,
    metadata.description,
    metadata.keywords,
    metadata.image,
    metadata.url,
  ]);
};

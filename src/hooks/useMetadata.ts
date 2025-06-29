
import { useEffect } from 'react';
import { updatePageMetadata, type PageMetadata } from '@/lib/metadata';

export const useMetadata = (metadata: PageMetadata) => {
  useEffect(() => {
    updatePageMetadata(metadata);
  }, [metadata.title, metadata.description, metadata.keywords, metadata.image, metadata.url]);
};

import { useState } from 'react';

export function useIngestion() {
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [ingestSuccess, setIngestSuccess] = useState(false);

  const triggerIngestion = async () => {
    setIsIngesting(true);
    setIngestError(null);
    setIngestSuccess(false);

    try {
      const res = await fetch('/api/v1/ingest', {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Ingestion trigger failed');
      }

      setIngestSuccess(true);
      setTimeout(() => setIngestSuccess(false), 5000);
    } catch (err: any) {
      setIngestError(err.message || 'Failed to start ingestion');
    } finally {
      setIsIngesting(false);
    }
  };

  return { triggerIngestion, isIngesting, ingestError, ingestSuccess };
}

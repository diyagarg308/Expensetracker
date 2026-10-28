import { useState, useEffect } from "react";
export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    if (!url) return;

    let isCancelled = false;

    async function executeFetch() {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}: ${response.statusText || "Request failed"}`);
        }
        const json = await response.json();
        if (!isCancelled) {
          setData(json);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "An unexpected network error occurred.");
          setData(null);
          setLoading(false);
        }
      }
    }

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [url, reloadIndex]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadIndex(i => i + 1);
  };

  return { data, loading, error, retry, setData };
}

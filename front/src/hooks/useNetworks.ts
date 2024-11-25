import { useState, useEffect } from "react";

interface Network {
  networkName: string;
  chainId: string;
  subnet: string;
  ipBootNode: string;
}

const useNetworks = () => {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworks = async () => {
    try {
      setError(null); // Limpia errores previos
      const response = await fetch("http://localhost:5555/networks");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNetworks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching networks:", err);
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  return { networks, fetchNetworks, error };
};

export default useNetworks;
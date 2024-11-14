import React, { useEffect, useState } from "react";
import axios from "axios";

interface NetworkDetailsProps {
  networkName: string;
}

interface NetworkDetailsData {
  networkName: string;
  chainId: string;
  subnet: string;
  ipBootNode: string;
}

const NetworkDetails: React.FC<NetworkDetailsProps> = ({ networkName }) => {
  const [networkDetails, setNetworkDetails] = useState<NetworkDetailsData | null>(null);

  useEffect(() => {
    const fetchNetworkDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5555/network-details/${networkName}`);
        setNetworkDetails(response.data);
      } catch (error) {
        console.error("Error fetching network details:", error);
      }
    };

    fetchNetworkDetails();
  }, [networkName]);

  if (!networkDetails) {
    return <p>Cargando detalles de la red...</p>;
  }

  return (
    <div className="mt-4 p-4 border rounded-lg shadow-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Detalles de la Red</h3>
      <p><strong>Nombre de la Red:</strong> {networkDetails.networkName}</p>
      <p><strong>Chain ID:</strong> {networkDetails.chainId}</p>
      <p><strong>Subnet:</strong> {networkDetails.subnet}</p>
      <p><strong>IP Boot Node:</strong> {networkDetails.ipBootNode}</p>
    </div>
  );
};

export default NetworkDetails;

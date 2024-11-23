import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import NetworkCard from "./NetworkCard";
import { NetworkDetailsData } from "../types";

const NetworkDetails: React.FC = () => {
  const { networkName } = useParams<{ networkName: string }>();
  const [networkDetails, setNetworkDetails] = useState<NetworkDetailsData | null>(null);

  useEffect(() => {
    if (!networkName) return;
    axios
      .get(`http://localhost:5555/network-details/${networkName}`)
      .then((response) => setNetworkDetails(response.data))
      .catch((error) => console.error("Error fetching network details:", error));
  }, [networkName]);

  if (!networkDetails) return <p>Loading details...</p>;

  return (
    <div className="mt-4 p-4 border rounded-lg shadow-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Network details</h3>
      <NetworkCard {...networkDetails} />
    </div>
  );
};

export default NetworkDetails;

import React from "react";
import NetworkCard from "./NetworkCard";
import { Network } from "../types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NetworkList: React.FC<{ networks: Network[]; refreshNetworks?: () => void }> = ({
  networks,
  refreshNetworks,
}) => {
  const handleDeleteNetwork = async (networkName: string) => {
    try {
      const response = await fetch(`http://localhost:5555/delete-network/${networkName}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(`Network "${networkName}" has been eliminated.`);
        refreshNetworks?.(); // Refrescar la lista de redes después de la eliminación
      } else {
        toast.error(`Error eliminating the network: ${response.statusText}`);
      }
    } catch (error) {
      toast.error(`Error in deletion request: ${error}` );
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Private networks</h2>
      {networks.length === 0 ? (
        <p>No networks created yet.</p>
      ) : (
        <ul>
          {networks.map((network) => (
            <li key={network.networkName}>
              <NetworkCard
                {...network}
                onDelete={handleDeleteNetwork}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NetworkList;

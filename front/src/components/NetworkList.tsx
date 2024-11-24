import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Network {
  networkName: string;
  chainId: string;
  subnet: string;
  ipBootNode: string;
}

interface NetworkListProps {
  networks: Network[];
  onNetworkClick: (network: Network) => void;
  refreshNetworks?: () => void;
}

const NetworkList: React.FC<NetworkListProps> = ({ networks, onNetworkClick, refreshNetworks}) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
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
    <div className="flex flex-col w-full border border-gray-300 rounded-lg p-4 shadow-md"> 
      <h2 className="text-lg font-bold mb-4">Listado de Redes</h2>
      {statusMessage && <p className="status-message">{statusMessage}</p>}
      <table className="table-auto w-full border-collapse border border-gray-300 shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Network Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Chain ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Subnet</th>
            <th className="border border-gray-300 px-4 py-2 text-left">IP Boot Node</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {networks.map((network) => (
            <tr key={network.networkName} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-1">{network.networkName}</td>
              <td className="border border-gray-300 px-4 py-1">{network.chainId}</td>
              <td className="border border-gray-300 px-4 py-1">{network.subnet}</td>
              <td className="border border-gray-300 px-4 py-1">{network.ipBootNode}</td>
              <td className="border border-gray-300 px-4 py-1">
                <button
                  onClick={() => onNetworkClick(network)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-1 mt-4 rounded"
                >
                  Show nodes
                </button>
                
                <button
                  onClick={() => handleDeleteNetwork(network.networkName)}
                  className="bg-red-500 hover:bg-blue-600 text-white font-bold py-1 px-1 mt-4 rounded"
                >
                  Eliminate network
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NetworkList;

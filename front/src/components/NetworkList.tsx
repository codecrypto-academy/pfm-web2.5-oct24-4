import React, { useState } from "react";

interface Network {
  networkName: string;
  chainId: string;
  subnet: string;
  ipBootNode: string;
}

interface NetworkListProps {
  networks: Network[];
  refreshNetworks?: () => void;
}

const NetworkList: React.FC<NetworkListProps> = ({ networks, refreshNetworks }) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleDeleteNetwork = async (networkName: string) => {
    try {
      const response = await fetch(`http://localhost:5555/delete-network/${networkName}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStatusMessage(`La red "${networkName}" ha sido eliminada.`);
        refreshNetworks?.(); // Refrescar la lista de redes después de la eliminación

        // Eliminar el mensaje después de 3 segundos
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        console.error("Error al eliminar la red:", response.statusText);
      }
    } catch (error) {
      console.error("Error en la solicitud de eliminación:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Redes Privadas</h2>

      {/* Mensaje de estado */}
      {statusMessage && (
        <div className="mb-4 p-2 text-green-600 bg-green-100 rounded">
          {statusMessage}
        </div>
      )}

      {networks.length === 0 ? (
        <p>No hay redes creadas aún.</p>
      ) : (
        <ul>
          {networks.map((network, index) => (
            <li key={index} className="mb-4">
              <div className="p-4 bg-gray-100 rounded-md shadow-sm">
                <h3 className="text-lg font-semibold">{network.networkName}</h3>
                <p><strong>Chain ID:</strong> {network.chainId}</p>
                <p><strong>Subnet:</strong> {network.subnet}</p>
                <p><strong>IP Boot Node:</strong> {network.ipBootNode}</p>

                {/* Botón de eliminar */}
                <button
                  onClick={() => handleDeleteNetwork(network.networkName)}
                  className="ml-4 text-sm text-red-500 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NetworkList;

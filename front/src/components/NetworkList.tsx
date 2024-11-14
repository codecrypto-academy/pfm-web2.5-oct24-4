import React from "react";

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
  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Redes Privadas</h2>

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
                  onClick={() => {
                    // Aquí agregas la lógica para eliminar la red (puede llamar a la API correspondiente)
                    console.log(`Eliminar red: ${network.networkName}`);
                    refreshNetworks?.(); // Actualiza la lista después de eliminar
                  }}
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



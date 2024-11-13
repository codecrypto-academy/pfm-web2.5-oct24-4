import React from "react";

interface NetworkListProps {
    networks: string[];
  }

const NetworkList: React.FC<NetworkListProps> = ({ networks }) => {

    return (
        <div className="max-w-md mx-auto p-4 border rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Redes Privadas</h2>
    
          {networks.length === 0 ? (
            <p>No hay redes creadas aún.</p>
          ) : (
            <ul>
              {networks.map((network, index) => (
                <li key={index} className="mb-2">
                  <div className="p-2 bg-gray-100 rounded-md shadow-sm">
                    {network}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
};

export default NetworkList;

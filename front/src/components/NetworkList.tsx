import React, { useState } from "react";
import NewNodeForm from "./NewNodeForm"; // Assuming you have this component

interface Network {
  networkName: string;
  chainId: string;
  subnet: string;
  ipBootNode: string;
}

interface Node {
  id: string;
  nodeNumber: number;
}

interface NetworkListProps {
  networks: Network[];
  refreshNetworks?: () => void;
}

const NetworkList: React.FC<NetworkListProps> = ({ networks, refreshNetworks }) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [showAddNodeForm, setShowAddNodeForm] = useState(false);

  const handleDeleteNetwork = async (networkName: string) => {
    try {
      const response = await fetch(`http://localhost:5555/delete-network/${networkName}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStatusMessage(`La red "${networkName}" ha sido eliminada.`);
        refreshNetworks?.();

        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        console.error("Error al eliminar la red:", response.statusText);
      }
    } catch (error) {
      console.error("Error al eliminar la red:", error);
    }
  };

  const handleShowNodes = async (network: Network) => {
    setSelectedNetwork(network);
    setShowAddNodeForm(false);

    try {
      const response = await fetch(`http://localhost:5555/networks/${network.networkName}/nodes`);
      if (response.ok) {
        const data = await response.json();
        setNodes(data);
      } else {
        setNodes([]);
        console.error("Error fetching nodes:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching nodes:", error);
      setNodes([]);
    }
  };

  const handleAddNode = async (nodeData: { nodeNumber: number }) => {
    if (selectedNetwork) {
      try {
        const response = await fetch(`http://localhost:5555/networks/${selectedNetwork.networkName}/add-node`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nodeData),
        });

        if (response.ok) {
          alert("Nodo añadido exitosamente.");
          handleShowNodes(selectedNetwork); // Refresh the nodes
          setShowAddNodeForm(false);
        } else {
          console.error("Error al añadir nodo:", response.statusText);
        }
      } catch (error) {
        console.error("Error al añadir nodo:", error);
      }
    }
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* Network Table */}
      <div>
        <h2>Listado de Redes</h2>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
        <table border="1" style={{ width: "500px", textAlign: "left" }}>
          <thead>
            <tr>
              <th>Network Name</th>
              <th>Chain ID</th>
              <th>Subnet</th>
              <th>IP Boot Node</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {networks.map((network) => (
              <tr key={network.networkName}>
                <td>{network.networkName}</td>
                <td>{network.chainId}</td>
                <td>{network.subnet}</td>
                <td>{network.ipBootNode}</td>
                <td>
                  <button onClick={() => handleShowNodes(network)}>Mostrar Nodos</button>
                  <button onClick={() => handleDeleteNetwork(network.networkName)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nodes Table */}
      {selectedNetwork && (
        <div>
          <h2>Nodos de la Red: {selectedNetwork.networkName}</h2>
          {nodes.length > 0 ? (
            <table border="1" style={{ width: "400px", textAlign: "left" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Node Number</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => (
                  <tr key={node.id}>
                    <td>{node.id}</td>
                    <td>{node.nodeNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay nodos disponibles.</p>
          )}
          <button onClick={() => setShowAddNodeForm(true)}>Añadir Nuevo Nodo</button>

          {/* Add Node Form */}
          {showAddNodeForm && (
            <NewNodeForm
              addNodeToNetwork={(nodeData) => handleAddNode(nodeData)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkList;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState, createContext } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CreateNetworkForm from './components/CreateNetworkForm';
import NetworkList from "./components/NetworkList";
import NetworkDetails from './components/NetworkDetails';
import BlockList from './components/BlockList';
import useNetworks from './hooks/useNetworks';
import NodeList from './components/NodeList';
import NewNodeForm from './components/NewNodeForm';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Balance } from './components/Balance';
import { Faucet } from './components/Faucet';
import { Transfer } from './components/Transfer';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

interface Network {
  networkName: string;
  chainId: string;
  subnet: string;
  ipBootNode: string;
}

const App: React.FC = () => {
  const { networks, fetchNetworks, error } = useNetworks();
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [showAddNodeForm, setShowAddNodeForm] = useState(false);
  const [showNodeList, setShowNodeList] = useState(true);

  const handleShowNodes = (network: Network) => {
    setSelectedNetwork(network);
    fetchNodes(network.networkName);
  };

  const fetchNodes = async (networkName: string) => {
    try {
      const response = await fetch(`http://localhost:5555/networks/${networkName}/nodes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Nodes fetched:', data);
      setNodes(data);
    } catch (error) {
      console.error('Error fetching nodes:', error);
    }
  };

  

  const addNodeToNetwork = (data: { nodeNumber: number }) => {
    if (selectedNetwork) {
      // Aquí puedes agregar el nodo a la red. En este caso, solo se añade a la lista de nodos
      setNodes([...nodes, { id: String(nodes.length + 1), nodeNumber: String(data.nodeNumber) }]);
      setShowAddNodeForm(false); // Ocultar el formulario después de agregar el nodo
    }
  };

   // Función para cerrar el componente NodeList
   const handleDismissNodeList = () => {
    setShowNodeList(false); // Cambiar el estado para ocultar NodesTable
   }

    const handleDismissAddNodeForm = () => {
      setShowAddNodeForm(false); // Cambiar el estado para ocultar NodesTable
    }

    const removeNode = (id: string) => {
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
    };

  return (
    <Router>
    <div className="app-container">
    <ToastContainer/>
      <Header />
      
      <main className="py-10">
      <Routes>
        <Route path="/" element={<Navigate to="/networks" />} />
        <Route
          path="/networks"
          element={
            <div>
              <CreateNetworkForm onNetworkCreated={fetchNetworks} />

              {/* Contenedor flex para los tres componentes */}
              <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-between mx-auto mx-4 my-8">

                {/* Network List - Toma un 1/3 del ancho en pantallas grandes */}
                <div className="flex-grow-[2] basis-1/2 lg:basis-1/3">
                {error ? (
                    <p className="text-red-500">Error: {error}</p>
                  ) : (
                  <NetworkList networks={networks} handleShowNodes={handleShowNodes} refreshNetworks={fetchNetworks} />
                )}
                  </div>

                {/* Nodes Table - Solo se muestra si hay una red seleccionada */}
                <div className="flex-grow-[1] basis-1/4 lg:basis-1/3">
                  {selectedNetwork && showNodeList ? (
                    <NodeList
                      selectedNetwork={selectedNetwork}
                      nodes={nodes}
                      setShowAddNodeForm={setShowAddNodeForm}
                      onDismiss={handleDismissNodeList}
                      removeNode={removeNode}
                    />
                  ) : (
                    <p className="text-gray-400 italic">Seleccione una red para ver los nodos.</p>
                  )}
                </div>

                {/* Node Form - Solo se muestra si showAddNodeForm es true */}
                <div className="flex-grow-[1] basis-1/4 lg:basis-1/3">
                  {showAddNodeForm && (
                    <NewNodeForm 
                    addNodeToNetwork={addNodeToNetwork}
                    onDismiss={handleDismissAddNodeForm}
                    />
                  ) 
                }
                </div>
              </div>
            </div>
          }
        />
        {/* Ruta para detalles de red */}
        <Route path="/network/:networkName" element={<NetworkDetails />} />
        {/* Ruta para los bloques de una red específica */}
        <Route path="/network/:networkName/blocks" element={<BlockList />} />
        {/* Ruta para ver todos los bloques */}
        <Route path="/blocks" element={<div>Show all blocks (TODO)</div>} />
      </Routes>
      </main>
      <Footer />
    </div>
    </Router>  
    );
};

export const UserContext = createContext({});

export default App;

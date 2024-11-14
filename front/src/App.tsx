import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CreateNetworkForm from './components/CreateNetworkForm';
import NetworkList from "./components/NetworkList";

interface Network {
  networkName: string;
  chainId: string;
  subnet: string;
  ipBootNode: string;
}

const App: React.FC = () => {
  const [networks, setNetworks] = useState<Network[]>([]);
  
  const fetchNetworks = async () => {
    try {
      const response = await fetch('http://localhost:5555/networks');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Networks fetched:", data); // Asegúrate de ver los datos en la consola
      setNetworks(data);
    } catch (error) {
      console.error("Error fetching networks:", error);
    }
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  return (
    <div className="app-container">
      <Header />
      <main className="py-10">
        <div className="max-w-screen-lg mx-auto">

        <CreateNetworkForm onNetworkCreated={fetchNetworks} /> {/* Paso de función de actualización */}

          <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Listado de Redes Privadas</h2>
        <NetworkList networks={networks} refreshNetworks={fetchNetworks} /> {/* Pasar fetchNetworks como refreshNetworks */}

      </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;

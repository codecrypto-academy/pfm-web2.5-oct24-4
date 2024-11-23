import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CreateNetworkForm from './components/CreateNetworkForm';
import NetworkList from "./components/NetworkList";
import NetworkDetails from './components/NetworkDetails';
import BlockList from './components/BlockList';
import useNetworks from './hooks/useNetworks';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  const { networks, fetchNetworks, error } = useNetworks();

  return (
    <Router>
      <div className="app-container">
      <ToastContainer />
        <Header />
        <main className="py-10">
          <div className="max-w-screen-lg mx-auto">
            {/* Formulario y listado principal */}
            <CreateNetworkForm onNetworkCreated={fetchNetworks} />
            {/* Configuración de rutas */}
            <Routes>
            <Route path="/" element={<Navigate to="/networks" />} />
            <Route
              path="/networks"
              element={
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Private network list</h2>
                  {error ? (
                    <p className="text-red-500">Error: {error}</p>
                  ) : (
                    <NetworkList networks={networks} refreshNetworks={fetchNetworks} />
                  )}
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
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;

import React, { useState } from "react";
import axios from "axios";

interface CreateNetworkFormProps {
  onNetworkCreated: () => void;
}

const CreateNetworkForm: React.FC<CreateNetworkFormProps> = ({ onNetworkCreated }) => {
  const [networkName, setNetworkName] = useState("");
  const [chainId, setChainId] = useState("");
  const [subnet, setSubnet] = useState("");
  const [ipBootNode, setIpBootNode] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!networkName || !chainId || !subnet || !ipBootNode) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5555/create-network", {
        networkName,
        chainId,
        subnet,
        ipBootNode,
      });

      console.log(response.data); // Verifica la respuesta

      if (response.data.message) {
        setMessage(`Red creada con éxito: ${response.data.message}`);
        setTimeout(() => setMessage(""), 3000); // Mensaje desaparece después de 5 segundos
      }

      setError("");
      setNetworkName("");
      setChainId("");
      setSubnet("");
      setIpBootNode("");
      onNetworkCreated();
      setShowForm(false); // Ocultar el formulario tras la creación
    } catch (err) {
      setError("Error al crear la red. Inténtalo nuevamente.");
      setMessage("");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-md">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4"
        >
          New Network
        </button>
      )}

      {/* Mensaje de éxito visible independientemente de showForm */}
      {message && <div className="text-green-600 mb-4">{message}</div>}
      
      {showForm && (
        <>
          <h2 className="text-xl font-bold mb-4">Crear Red</h2>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="networkName" className="block text-sm font-medium">
                Nombre de la Red
              </label>
              <input
                id="networkName"
                type="text"
                value={networkName}
                onChange={(e) => setNetworkName(e.target.value)}
                className="w-full p-2 mt-2 border rounded-md"
                placeholder="Ingrese el nombre de la red"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="chainId" className="block text-sm font-medium">
                Chain ID
              </label>
              <input
                id="chainId"
                type="text"
                value={chainId}
                onChange={(e) => setChainId(e.target.value)}
                className="w-full p-2 mt-2 border rounded-md"
                placeholder="Ingrese el Chain ID"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="subnet" className="block text-sm font-medium">
                Subnet
              </label>
              <input
                id="subnet"
                type="text"
                value={subnet}
                onChange={(e) => setSubnet(e.target.value)}
                className="w-full p-2 mt-2 border rounded-md"
                placeholder="Ingrese el Subnet"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="ipBootNode" className="block text-sm font-medium">
                IP Boot Node
              </label>
              <input
                id="ipBootNode"
                type="text"
                value={ipBootNode}
                onChange={(e) => setIpBootNode(e.target.value)}
                className="w-full p-2 mt-2 border rounded-md"
                placeholder="Ingrese la IP Boot Node"
              />
            </div>
            
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Crear Red
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default CreateNetworkForm;

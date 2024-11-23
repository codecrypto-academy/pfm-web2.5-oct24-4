import React, { useState } from "react";
import axios from "axios";
import InputField from "./InputField";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      setError("All fields are mandatory.");
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
        toast.success(`Network created successfully: ${response.data.message}`);
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
      toast.error("Error creating the network. Try again later...");
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
          <h2 className="text-xl font-bold mb-4">Create New Network</h2>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <InputField
                id="networkName"
                label="Network name"
                value={networkName}
                onChange={(e) => setNetworkName(e.target.value)}
                placeholder="Enter the Network name"
              />
            </div>

            <div className="mb-4">
              <InputField
                id="chainId"
                label="Chain ID"
                value={chainId}
                onChange={(e) => setChainId(e.target.value)}
                placeholder="Enter the Chain ID"
              />
            </div>

            <div className="mb-4">
              <InputField
                id="subnet"
                label="Subnet"
                value={subnet}
                onChange={(e) => setSubnet(e.target.value)}
                placeholder="Enter the Subnet"
              />
            </div>

            <div className="mb-4">
              <InputField
                id="ipBootNode"
                label="IP Boot Node"
                value={ipBootNode}
                onChange={(e) => setIpBootNode(e.target.value)}
                placeholder="Enter the IP Boot Node"
              />
            </div>
            
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create network
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default CreateNetworkForm;

import React, { useState } from "react";
import axios from "axios";

interface CreateNetworkFormProps {
  onNetworkCreated: () => void;
}

const CreateNetworkForm: React.FC<CreateNetworkFormProps> = ({ onNetworkCreated }) => {
  const [networkName, setNetworkName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!networkName) {
      setError("El nombre de la red es obligatorio.");
      return;
    }

    try {
      // Hacemos la solicitud al backend
      const response = await axios.post("http://localhost:5555/create-network", {
        networkName,
      });

      setMessage(response.data.message);
      setError(""); // Limpiar errores
      setNetworkName(""); // Limpiar el campo del formulario
      onNetworkCreated(); // Llamada a la actualización del listado
    } catch (err) {
      setError("Error al crear la red. Inténtalo nuevamente.");
      setMessage(""); // Limpiar mensaje de éxito
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Crear Red</h2>
      
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {message && <div className="text-green-600 mb-2">{message}</div>}
      
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
        
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Crear Red
        </button>
      </form>
    </div>
  );
};

export default CreateNetworkForm;

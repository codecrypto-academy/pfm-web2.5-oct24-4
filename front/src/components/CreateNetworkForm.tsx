import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InputField from "./InputField";
import { toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useForm, useFieldArray } from "react-hook-form";

interface Network {
  id: string;
  chainId: number;
  subnet: string;
  ipBootnode: string;
  alloc: string[];
  nodos: {
    type: string;
    name: string;
    ip: string;
    port: number;
  }[];
}

interface CreateNetworkFormProps {
  onNetworkCreated: () => void;
}

const CreateNetworkForm: React.FC<CreateNetworkFormProps> = ({ onNetworkCreated }) => {
  
  const [chainId, setChainId] = useState("");
  const [subnet, setSubnet] = useState("");
  const [ipBootnode, setIpBootnode] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const params = useParams();
  const [network, setNetwork] = useState<Network | null>(null);
  let id = params.id;
  useEffect(() => {
    if (id) {
      fetch(`http://localhost:5555/${id}`).then((response) => {
        response.json().then((data) => {
          console.log(data);
          setNetwork(data);
        });
      }); 
    } else {
      setNetwork({
        id: "",
        chainId: 0,
        subnet: "",
        ipBootnode: "",
        alloc: [
          "C077193960479a5e769f27B1ce41469C89Bec299",
        ],
        nodos: [
          {
            type: "",
            name: "",
            ip: "",
            port: 0,
          },
        ],
      })
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !chainId || !subnet || !ipBootnode) {
      setError("All fields are mandatory.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5555/create-network", {
        id,
        chainId,
        subnet,
        ipBootnode,
      });

      console.log(response.data); // Verifica la respuesta

      if (response.data.message) {
        toast.success(`Network created successfully: ${response.data.message}`);
      }

      setError("");
      setid("");
      setChainId("");
      setSubnet("");
      setIpBootnode("");
      onNetworkCreated();
      setShowForm(false); // Ocultar el formulario tras la creación
    } catch (err) {
      toast.error("Error creating the network. Try again later...");
      setMessage("");
    }
  };
  
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    values: network,
  });

  const {
    fields: allocFields,
    append: allocAppend,
    remove: allocRemove,
  } = useFieldArray({
    control,
    name: "alloc",
  });

  const {
    fields: nodosFields,
    append: nodosAppend,
    remove: nodosRemove,
  } = useFieldArray({
    control,
    name: "nodos",
  });

  const onSubmit = (data: any) => {
    console.log(data);
    fetch("http://localhost:5555", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => {
      response.json().then((data) => {
        console.log(data);
      });
    });

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

      <div
        className={`transition-all duration-500 ease-in-out transform ${
          showForm ? "opacity-100 max-h-screen scale-100" : "opacity-0 max-h-0 scale-95"
        } overflow-hidden`}
      >
        {showForm && (
        <>
          <h2 className="text-xl font-bold mb-4">Create New Network</h2>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <InputField
                id="id"
                label="Network name"
                value={id}
                onChange={(e) => setid(e.target.value)}
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
                id="ipBootnode"
                label="IP Boot Node"
                value={ipBootnode}
                onChange={(e) => setIpBootnode(e.target.value)}
                placeholder="Enter the IP Boot Node"
              />
            </div>
            <h2 className="text-xl font-bold mb-4">Create New Network</h2>
            <div className="flex gap-4">
              <button
              type="submit"
              className="w-full p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Create
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)} // Ocultar formulario
              className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Cancel
            </button>
            </div>
            
            
          </form>
        </>
      )}
      </div> 
    </div>
  );
};

export default CreateNetworkForm;

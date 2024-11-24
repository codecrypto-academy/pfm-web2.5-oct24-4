import React from 'react';

interface Node {
  id: string;
  nodeNumber: string;
}

interface NodesTableProps {
  selectedNetwork: { networkName: string };
  nodes: Node[];
  setShowAddNodeForm: React.Dispatch<React.SetStateAction<boolean>>;
  onDismiss: () => void;
  removeNode: (id: string) => void;
}

const NodeList: React.FC<NodesTableProps> = ({ selectedNetwork, nodes, setShowAddNodeForm, onDismiss, removeNode  }) => {

  return (
    <div className="flex flex-col w-full border border-gray-300 rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-bold mb-4">Nodos de la Red: {selectedNetwork.networkName}</h2>
      {nodes.length > 0 ? (
        <table className="table-auto w-full border-collapse border border-gray-300 shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Node Number</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr key={node.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{node.id}</td>
                <td className="border border-gray-300 px-4 py-2">{node.nodeNumber}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => removeNode(node.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No hay nodos disponibles.</p>
      )}

      <div className='flex gap-4'>
        <button
              onClick={() => setShowAddNodeForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 mt-4 rounded"
            >
              Add New Node
            </button>

            <button
              onClick={onDismiss}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 mt-4 rounded"
            >
              Cerrar
            </button>
      </div>
      
    </div>
  );
};

export default NodeList;

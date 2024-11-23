import { useEffect, useState } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';



interface Block {
  blockNumber: number;
  timestamp: number;
  hash: string;
  transactionCount: number;
}

const BlockList = () => {
  const { networkName } = useParams<{ networkName: string }>();
  const navigate = useNavigate ();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlocks = async () => {
      if (!networkName) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5555/network/${networkName}/blocks`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setBlocks(data);
        } else {
          console.error("The response is not an array:", data);
        }
      } catch (error) {
        setError((error as Error).message);
        console.error('Error getting the blocks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, [networkName]);

  const handleViewAllBlocks = () => {
    navigate("/blocks");
  };

  if (loading) {
    return <p>Cargando bloques...</p>;
  }

  if (!Array.isArray(blocks)) {
    return <p>Failed to load blocks.</p>;
  }

  return (
    <div className="mt-4 p-4 border rounded-lg shadow-md bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Last 10 Blocks of {networkName}</h2>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <ul className="space-y-4">
          {blocks.map((block) => (
            <li
              key={block.blockNumber}
              className="p-4 border rounded-lg shadow-sm bg-white hover:bg-gray-100"
            >
              <p>
                <strong>Block number:</strong> {block.blockNumber}
              </p>
              <p>
                <strong>Timestamp:</strong> {new Date(block.timestamp).toLocaleString()}
              </p>
              <p>
                <strong>Hash:</strong> {block.hash}
              </p>
              <p>
                <strong>Transactions:</strong> {block.transactionCount}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BlockList;

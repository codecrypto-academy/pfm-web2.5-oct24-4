import React from "react";
import { Link } from "react-router-dom";

interface NetworkCardProps {
  networkName: string;
  chainId: string;
  subnet: string;
  ipBootNode: string;
  onDelete?: (networkName: string) => void;
}

const NetworkCard: React.FC<NetworkCardProps> = ({
  networkName,
  chainId,
  subnet,
  ipBootNode,
  onDelete,
}) => {
  return (
    <div className="p-4 bg-gray-100 rounded-md shadow-sm">
      <h3 className="text-lg font-semibold">{networkName}</h3>
      <p><strong>Chain ID:</strong> {chainId}</p>
      <p><strong>Subnet:</strong> {subnet}</p>
      <p><strong>IP Boot Node:</strong> {ipBootNode}</p>

      <Link to={`/network/${networkName}/blocks`}>
        <button className="ml-4 text-sm text-blue-500 hover:underline">
          Show Blocks
        </button>
      </Link>

      {onDelete && (
        <button
          onClick={() => onDelete(networkName)}
          className="ml-4 text-sm text-red-500 hover:underline"
        >
          Eliminate
        </button>
      )}
    </div>
  );
};

export default NetworkCard;

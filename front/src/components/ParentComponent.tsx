import React, { useState } from "react";
import NodeList from "./NodeList";

const ParentComponent: React.FC = () => {
  const [nodes, setNodes] = useState([
    { id: "1", nodeNumber: "Node 1" },
    { id: "2", nodeNumber: "Node 2" },
    { id: "3", nodeNumber: "Node 3" },
  ]);

  const removeNode = (id: string) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
  };

  return (
    <NodeList
      selectedNetwork={{ networkName: "My Network" }}
      nodes={nodes}
      setShowAddNodeForm={() => {}}
      onDismiss={() => {}}
      removeNode={removeNode} // Pasamos la función
    />
  );
};

export default ParentComponent;

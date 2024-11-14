import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import IsAlive from "./IsAlive";
import { FaPlay, FaStop, FaRedo, FaCog } from "react-icons/fa"; // Import icons

function ListNetworks() {
  const [networks, setNetworks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000")
      .then((response) => response.json())
      .then((data) => setNetworks(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>Network ID</th>
            <th>Chain ID (Name)</th>
            <th>IP</th>
            <th>Status</th>
            <th>Nodes Number</th>
            <th>Start</th>
            <th>Stop</th>
            <th>Restart</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {networks.map((network) => (
            <tr key={network.id}>
              <td>{network.id}</td>
              <td>{network.name}</td>
              <td>{network.ip}</td>
              <td>{network.status}</td>
              <td>{network.nodeCount}</td>
              <td>
                <button className={`btn ${network.start ? 'btn-play' : 'btn-secondary'}`}>
                  {network.start ? <FaPlay /> : ''}
                </button>
              </td>
              <td>
                <button className={`btn ${network.stop ? 'btn-stop' : 'btn-secondary'}`}>
                  {network.stop ? <FaStop /> : ''}
                </button>
              </td>
              <td>
                <button className={`btn ${network.restart ? 'btn-retry' : 'btn-secondary'}`}>
                  {network.restart ? <FaRedo /> : ''}
                </button>
              </td>
              <td>
                <button className={`btn ${network.options ? 'btn-config' : 'btn-secondary'}`}>
                  {network.options ? <FaCog /> : ''}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListNetworks;

import React from 'react';
import { FaGithub, FaTwitter, FaInstagram, FaTiktok, FaPlay, FaStop, FaRedo, FaCog } from 'react-icons/fa';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

export default function Home() {
  const networkData = [
    {
      id: '123',
      name: 'node1',
      ip: '172.16.220.0/24',
      status: '✓',
      nodeCount: 2,
      start: true,
      stop: true,
      restart: true,
      options: true,
    },
    {
      id: '444555',
      name: 'node2',
      ip: '172.16.200.0/24',
      status: '✓',
      nodeCount: 5,
      start: true,
      stop: true,
      restart: true,
      options: true,
    },
  ];

  return (
    <div className="network-table-container">
      
      <div className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h1 className="title">Build Private Ethereum Networks</h1>

        <div className="header-items">
          <Link className="header-item1" to="/nodos">Nodos</Link>
          <Link className="header-item1" to="/faucet">Faucet</Link>
        </div>

      </div>

      <div className="body">
        <table className="network-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>IP</th>
              <th>Status</th>
              <th>Numero de nodos</th>
              <th>Start</th>
              <th>Stop</th>
              <th>Restart</th>
              <th>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {networkData.map((network) => (
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

        <div className="button-container">
          <Link to="/network-setup">
            <button className="btn btn-primary">CREAR RED</button>
          </Link> 
      </div>

      </div>

      

      <div className="footer">
        <div className="quick-links">
          <h4>Enlaces rápidos</h4>
          <a href="#">Quienes somos</a>
          <a href="#">Privacidad</a>
          <a href="#">Términos y condiciones</a>
        </div>

        <div className="contact-container">
          
            <h4>Contacto</h4>
            <a href="mailto:contact@optin.com">contact@optin.com</a>
        </div>

        <div className="social-links">
            <a href="#" className="social-link">
              <FaTiktok />
            </a>
            <a href="#" className="social-link">
              <FaGithub />
            </a>
            <a href="#" className="social-link">
              <FaTwitter />
            </a>
            <a href="#" className="social-link">
              <FaInstagram />
            </a>
        </div>
      </div>
    </div> 
  );
};

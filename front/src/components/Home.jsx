import React from 'react';
import { FaGithub, FaTwitter, FaInstagram, FaTiktok, FaPlay, FaStop, FaRedo, FaCog } from 'react-icons/fa';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import ListNetworks from "./ListNetworks";

export default function Home() {

  return (
            
    <div className="network-table-container">
      {/* We create a Header with two links to access the Nodes and Faucet sections' */}
      
      <div className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h1 className="title">Build Private Ethereum Networks</h1>

        <div className="header-items">
          <Link className="header-item1" to="/nodos">Nodos</Link>
          <Link className="header-item1" to="/faucet">Faucet</Link>
          {/* We invoque the ListNetworks component to render it fully from outside the Home.jsx file' */}
          
        </div>

      </div>

      <div className="container">
      <h1>Home</h1>
      {/* Render ListNetworks immediately */}
      <ListNetworks />

      {/* We now proceed to create the button to add new networks' */}
      
        <div className="button-container">
          <Link to="/network-setup">
            <button className="btn btn-primary">CREATE NETWORK</button>
          </Link>      </div>
      </div>

      
      <div className="footer">
        {/* We create footnote with all our personal contact information' */}
      
        <div className="quick-links">
          <h4>Quick links</h4>
          <a href="#">About us</a>
          <a href="#">Privacy</a>
          <a href="#">Terms & Conditions </a>
        </div>

        <div className="contact-container">
          
            <h4>Contact</h4>
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

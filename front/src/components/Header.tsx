import React from 'react';
import { FaEthereum } from 'react-icons/fa';
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="bg-indigo-600 text-white p-4">
      <div className="flex justify-between items-center max-w-screen-lg mx-auto">
        <div className="flex items-center">
          <FaEthereum className="text-4xl mr-2" />
          <h1 className="text-3xl font-semibold">Build Private Ethereum Networks</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <Link to={`/`}> 
            <li><a href="#home" className="hover:text-yellow-300">Home</a></li>
            </Link>
            <Link to={`/faucet`}> 
              <li><a href="#faucet" className="hover:text-yellow-300">Faucet</a></li>
            </Link>
            <li><a href="#about" className="hover:text-yellow-300">About</a></li>
            <li><a href="#contact" className="hover:text-yellow-300">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

import React, { useState } from 'react';

const CreateNetworkForm: React.FC = () => {
  const [networkName, setNetworkName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Creating network: ${networkName}`);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-semibold mb-4">Create Private Network</h2>
      <label htmlFor="networkName" className="block text-sm font-medium text-gray-700">Network Name</label>
      <input
        type="text"
        id="networkName"
        value={networkName}
        onChange={(e) => setNetworkName(e.target.value)}
        className="w-full p-3 mt-2 mb-4 border border-gray-300 rounded-lg"
        placeholder="Enter network name"
        required
      />
      <button type="submit" className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        Create Network
      </button>
    </form>
  );
};

export default CreateNetworkForm;

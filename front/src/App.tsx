import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CreateNetworkForm from './components/CreateNetworkForm';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="py-10">
        <div className="max-w-screen-lg mx-auto">
          <CreateNetworkForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;

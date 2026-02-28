import React from 'react';
import Header from './components/Header/Header';
import PriceCalculator from './components/PriceCalculator/PriceCalculator';
import MessageBuilder from './components/MessageBuilder/MessageBuilder';

const App: React.FC = () => {
  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto p-4 flex flex-col gap-4">
        <PriceCalculator />
        <MessageBuilder />
      </main>
    </div>
  );
};

export default App;

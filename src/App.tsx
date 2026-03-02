import React from 'react';
import Header from './components/Header/Header';
import PriceCalculator from './components/PriceCalculator/PriceCalculator';
import MessageBuilder from './components/MessageBuilder/MessageBuilder';

const App: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <Header />
      <main className="glass-container flex-col gap-4 w-full max-w-3xl items-stretch">
        <PriceCalculator />
        <MessageBuilder />
      </main>
    </div>
  );
};

export default App;

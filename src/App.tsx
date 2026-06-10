import React from 'react';
import Header from './components/Header/Header';
import PriceCalculator from './components/PriceCalculator/PriceCalculator';
import MessageBuilder from './components/MessageBuilder/MessageBuilder';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-4">
        <Header />
        <main className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
          <PriceCalculator />
          <MessageBuilder />
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;

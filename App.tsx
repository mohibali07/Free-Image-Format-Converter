
import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ImageConverter from './components/ImageConverter';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <ImageConverter />
      </main>
      <Footer />
    </div>
  );
};

export default App;

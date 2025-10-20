
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
        Free Image Converter
      </h1>
      <p className="text-slate-400 mt-2 text-lg">
        Fast, private, and entirely in your browser.
      </p>
    </header>
  );
};

export default Header;

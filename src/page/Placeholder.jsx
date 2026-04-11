import React from 'react';
import { Link } from 'react-router-dom';

const Placeholder = ({ title }) => {
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-muted mb-8">This page is under construction.</p>
      <Link to="/" className="px-6 py-2 bg-primary text-dark font-bold rounded-full hover:bg-primary/90 transition-colors">
        Back to Home
      </Link>
    </div>
  );
};

export default Placeholder;

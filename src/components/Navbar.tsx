import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-fla-red shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">FLA BIBI</span>
          </Link>
          
          <div className="flex space-x-4">
            <Link
              to="/"
              className="text-white hover:text-bet-yellow transition-colors"
            >
              Próximos Jogos
            </Link>
            <Link
              to="/history"
              className="text-white hover:text-bet-yellow transition-colors"
            >
              Histórico
            </Link>
            <Link
              to="/admin"
              className="text-white hover:text-bet-yellow transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
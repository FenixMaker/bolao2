import React from 'react';
import { Trophy, Users, Target } from 'lucide-react';

export default function HomePage() {
  const currentGame = {
    homeTeam: 'Flamengo',
    awayTeam: 'Fluminense',
    homeScore: 2,
    awayScore: 0,
    currentTime: "75'",
  };

  const bets = [
    { id: '1', userName: 'João', homeScore: 2, awayScore: 0 },
    { id: '2', userName: 'Maria', homeScore: 3, awayScore: 1 },
    { id: '3', userName: 'Pedro', homeScore: 1, awayScore: 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Current Game Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img
              src="https://images.unsplash.com/photo-1583243552802-94ccb4200150?w=128&h=128&fit=crop"
              alt="Flamengo"
              className="w-16 h-16 object-contain"
            />
            <div className="text-4xl font-bold">{currentGame.homeScore}</div>
            <div className="text-2xl">vs</div>
            <div className="text-4xl font-bold">{currentGame.awayScore}</div>
            <img
              src="https://images.unsplash.com/photo-1583243552802-94ccb4200150?w=128&h=128&fit=crop"
              alt="Fluminense"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div className="text-2xl font-bold text-fla-red">
            {currentGame.currentTime}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <Users className="h-8 w-8 text-fla-red" />
          <div>
            <div className="text-sm text-gray-600">Total de Apostas</div>
            <div className="text-2xl font-bold">{bets.length}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <Target className="h-8 w-8 text-fla-red" />
          <div>
            <div className="text-sm text-gray-600">Palpite Mais Próximo</div>
            <div className="text-2xl font-bold">João (2x0)</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <Trophy className="h-8 w-8 text-fla-red" />
          <div>
            <div className="text-sm text-gray-600">Status</div>
            <div className="text-2xl font-bold">Em andamento</div>
          </div>
        </div>
      </div>

      {/* Bets List */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 bg-fla-red text-white font-bold rounded-t-lg">
          Palpites
        </div>
        <div className="divide-y divide-gray-200">
          {bets.map((bet) => (
            <div
              key={bet.id}
              className="p-4 flex items-center justify-between bg-bet-yellow bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              <span className="font-medium">{bet.userName}</span>
              <span className="text-lg font-bold">
                {bet.homeScore} x {bet.awayScore}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
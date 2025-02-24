export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  status: 'upcoming' | 'live' | 'finished';
  currentTime?: string;
}

export interface Bet {
  id: string;
  userId: string;
  gameId: string;
  homeScore: number;
  awayScore: number;
  userName: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  isAdmin: boolean;
}
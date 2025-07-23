import React from 'react';
import { GameSession, User } from '../types';
import { ArrowPathIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

interface GameResultScreenProps {
  session: GameSession;
  currentUser: User;
  onRematch: (opponent: User) => void;
  onExit: () => void;
}

const GameResultScreen: React.FC<GameResultScreenProps> = ({ session, currentUser, onRematch, onExit }) => {
  const isWinner = session.winnerId === currentUser.id;
  const isDraw = !session.winnerId;

  const getResultText = () => {
    if (isDraw) return "It's a Draw!";
    if (isWinner) return "You Won!";
    return "You Lost!";
  };

  const getResultColor = () => {
    if (isDraw) return "text-yellow-500 dark:text-yellow-400";
    if (isWinner) return "text-green-500 dark:text-green-400";
    return "text-red-500 dark:text-red-400";
  };
  
  const opponent = session.user.id === currentUser.id ? session.opponent : session.user;

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 overflow-y-auto items-center justify-center">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl text-center">
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${getResultColor()}`}>{getResultText()}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
                {isDraw ? "A hard-fought battle ends in a stalemate." : isWinner ? `Congratulations! You defeated ${opponent.name}.` : `A valiant effort, but ${opponent.name} was faster this time.`}
            </p>

            <div className="grid grid-cols-2 gap-4 text-left border-t border-b border-gray-200 dark:border-gray-700 py-6">
                {/* Your Results */}
                <div>
                    <div className="flex items-center mb-3">
                         <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full mr-3"/>
                         <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{currentUser.name} (You)</h2>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Score:</span> {session.userScore} / {session.questions.length}</p>
                        <p><span className="font-semibold">Total Time:</span> {session.userTime.toFixed(1)}s</p>
                    </div>
                </div>

                {/* Opponent's Results */}
                <div>
                     <div className="flex items-center mb-3">
                         <img src={opponent.avatarUrl} alt={opponent.name} className="w-10 h-10 rounded-full mr-3"/>
                         <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{opponent.name}</h2>
                    </div>
                     <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Score:</span> {session.opponentScore} / {session.questions.length}</p>
                        <p><span className="font-semibold">Total Time:</span> {session.opponentTime.toFixed(1)}s</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                 <button
                    onClick={() => onRematch(opponent)}
                    className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center font-semibold text-lg"
                >
                    <ArrowPathIcon className="w-5 h-5 mr-2" />
                    Rematch
                </button>
                 <button
                    onClick={onExit}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-md flex items-center justify-center font-semibold text-lg"
                >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                    Exit
                </button>
            </div>
        </div>
    </div>
  );
};

export default GameResultScreen;

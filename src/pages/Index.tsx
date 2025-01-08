import { useState } from 'react';
import StarBackground from '../components/StarBackground';
import WordInput from '../components/WordInput';
import WordList from '../components/WordList';
import SpeedControl from '../components/SpeedControl';
import Game from '../components/Game';

const Index = () => {
  const [gameState, setGameState] = useState<'setup' | 'playing'>('setup');
  const [pairs, setPairs] = useState<Array<{ term: string; definition: string }>>([
    { term: 'りんご', definition: 'apple' },
    { term: 'じこ', definition: 'accident' },
    { term: 'まち', definition: 'town' }
  ]);
  const [speed, setSpeed] = useState(500);

  const handleAddPair = (term: string, definition: string) => {
    setPairs([...pairs, { term, definition }]);
  };

  const handleRemovePair = (index: number) => {
    setPairs(pairs.filter((_, i) => i !== index));
  };

  const handleGameOver = (finalScore: number) => {
    setGameState('setup');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarBackground />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Word Asteroid Game
        </h1>

        {gameState === 'setup' ? (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-secondary/30 backdrop-blur-sm p-6 rounded-lg space-y-6">
              <h2 className="text-xl font-semibold">How to Play</h2>
              <p>
                Add word pairs (terms and their definitions) to create your game list.
                Words will fall as asteroids, and you'll need to type the matching
                term or definition before they reach the bottom.
              </p>
              <div className="bg-secondary/50 p-4 rounded">
                <h3 className="font-medium mb-2">Example:</h3>
                <p>If "りんご" falls, type "apple" to destroy it.</p>
                <p>If "apple" falls, type "りんご" to destroy it.</p>
              </div>
            </div>

            <WordInput onAddPair={handleAddPair} />
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Word List</h2>
              <WordList pairs={pairs} onRemovePair={handleRemovePair} />
            </div>

            <SpeedControl speed={speed} onSpeedChange={setSpeed} />

            {pairs.length > 0 && (
              <button
                onClick={() => setGameState('playing')}
                className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 
                         transition-colors rounded-lg text-white font-medium"
              >
                Start Game
              </button>
            )}
          </div>
        ) : (
          <Game 
            pairs={pairs}
            speed={speed}
            onGameOver={handleGameOver}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
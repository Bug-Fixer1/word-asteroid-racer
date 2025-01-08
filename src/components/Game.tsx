import { useState, useEffect, useRef } from 'react';

interface GameProps {
  pairs: Array<{ term: string; definition: string }>;
  speed: number;
  onGameOver: (score: number) => void;
}

interface Asteroid {
  id: number;
  word: string;
  answer: string;
  position: number;
  status: 'falling' | 'correct' | 'incorrect';
}

const Game = ({ pairs, speed, onGameOver }: GameProps) => {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Adjusted speed calculation to make the game slower overall
  const gameSpeed = 2000 - (speed * 1.5) + 500; // Base falling duration in ms

  useEffect(() => {
    if (pairs.length === 0) return;
    
    const interval = setInterval(() => {
      const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
      const showTerm = Math.random() > 0.5;
      
      setAsteroids(prev => [...prev, {
        id: Date.now(),
        word: showTerm ? randomPair.term : randomPair.definition,
        answer: showTerm ? randomPair.definition : randomPair.term,
        position: Math.random() * 80, // Random horizontal position
        status: 'falling'
      }]);
    }, 3000); // Increased interval between asteroids to 3 seconds

    return () => clearInterval(interval);
  }, [pairs, level]);

  useEffect(() => {
    if (wordsCompleted >= 10) {
      setLevel(l => l + 1);
      setWordsCompleted(0);
    }
  }, [wordsCompleted]);

  const handleInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const answer = input.trim().toLowerCase();
    
    const asteroid = asteroids.find(a => 
      a.status === 'falling' && 
      a.answer.toLowerCase() === answer
    );

    if (asteroid) {
      setScore(s => s + 100);
      setWordsCompleted(w => w + 1);
      setAsteroids(prev => prev.map(a => 
        a.id === asteroid.id ? { ...a, status: 'correct' } : a
      ));
    }

    setInput('');
  };

  const handleAsteroidHitBottom = (asteroid: Asteroid) => {
    if (asteroid.status === 'falling') {
      setScore(s => s - 50);
      setAsteroids(prev => prev.map(a => 
        a.id === asteroid.id ? { ...a, status: 'incorrect' } : a
      ));
    }
  };

  // Organize completed asteroids into columns
  const getCompletedAsteroidStyle = (index: number) => {
    const column = index % 3; // 3 columns
    const row = Math.floor(index / 3);
    return {
      position: 'absolute' as const,
      left: `${column * 33 + 2}%`,
      bottom: `${row * 80 + 120}px`,
      transition: 'all 0.5s ease-out',
    };
  };

  // Filter and sort completed asteroids
  const completedAsteroids = asteroids.filter(a => a.status !== 'falling');
  const fallingAsteroids = asteroids.filter(a => a.status === 'falling');

  return (
    <div className="relative h-[calc(100vh-200px)] overflow-hidden">
      <div className="absolute top-4 left-4 space-y-2">
        <div className="text-xl font-bold">Score: {score}</div>
        <div>Level: {level}</div>
      </div>
      
      {fallingAsteroids.map(asteroid => (
        <div
          key={asteroid.id}
          className={`asteroid ${asteroid.status}`}
          style={{
            left: `${asteroid.position}%`,
            animationDuration: `${gameSpeed * (1 / level)}ms`,
          }}
          onAnimationEnd={() => handleAsteroidHitBottom(asteroid)}
        >
          <div className="asteroid-content">
            {asteroid.word}
          </div>
        </div>
      ))}

      {completedAsteroids.map((asteroid, index) => (
        <div
          key={asteroid.id}
          className={`asteroid ${asteroid.status}`}
          style={getCompletedAsteroidStyle(index)}
        >
          <div className="asteroid-content">
            {asteroid.word}
            {asteroid.status === 'incorrect' && (
              <div className="text-sm opacity-75">
                Answer: {asteroid.answer}
              </div>
            )}
          </div>
        </div>
      ))}

      <form 
        onSubmit={handleInput}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="game-input"
          placeholder="Type the matching word..."
          autoFocus
        />
      </form>
    </div>
  );
};

export default Game;
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  isRetry?: boolean;
}

const Game = ({ pairs, speed, onGameOver }: GameProps) => {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [missedWords, setMissedWords] = useState(0);
  const [showLevelDialog, setShowLevelDialog] = useState(false);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [isGameActive, setIsGameActive] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Significantly slower base speed calculation (4x slower than before)
  const gameSpeed = (8000 - (speed * 1.5) + 2000); // Base falling duration in ms

  useEffect(() => {
    if (pairs.length === 0 || !isGameActive) return;
    
    const interval = setInterval(() => {
      const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
      const showTerm = Math.random() > 0.5;
      
      setAsteroids(prev => [...prev, {
        id: Date.now(),
        word: showTerm ? randomPair.term : randomPair.definition,
        answer: showTerm ? randomPair.definition : randomPair.term,
        position: Math.random() * 80,
        status: 'falling'
      }]);
    }, 3000); // Interval between asteroids

    return () => clearInterval(interval);
  }, [pairs, level, isGameActive]);

  useEffect(() => {
    if (wordsCompleted >= 10) {
      setShowLevelDialog(true);
      setLevel(l => l + 1);
      setWordsCompleted(0);
      setAsteroids([]); // Clear current asteroids for new level
    }
  }, [wordsCompleted]);

  useEffect(() => {
    if (missedWords >= 3) {
      setIsGameActive(false);
      setShowGameOverDialog(true);
      setAsteroids([]);
    }
  }, [missedWords]);

  const handleInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isGameActive) return;

    const answer = input.trim().toLowerCase();
    
    const asteroid = asteroids.find(a => 
      a.status === 'falling' && 
      a.answer.toLowerCase() === answer
    );

    if (asteroid) {
      setScore(s => s + 100);
      setWordsCompleted(w => w + 1);
      setAsteroids(prev => prev.filter(a => a.id !== asteroid.id));
      toast.success("Correct!");
    } else {
      // Show incorrect message and mark the current falling asteroid as incorrect
      setAsteroids(prev => prev.map(a => {
        if (a.status === 'falling') {
          toast.error(`Incorrect! The answer was: ${a.answer}`);
          // Create a new red asteroid with the same word
          const retryAsteroid: Asteroid = {
            ...a,
            id: Date.now(),
            position: Math.random() * 80,
            status: 'falling',
            isRetry: true
          };
          setTimeout(() => {
            setAsteroids(current => [...current, retryAsteroid]);
          }, 1000);
          return { ...a, status: 'incorrect' };
        }
        return a;
      }));
    }

    setInput('');
  };

  const handleAsteroidHitBottom = (asteroid: Asteroid) => {
    if (asteroid.status === 'falling') {
      setScore(s => s - 50);
      setMissedWords(m => m + 1);
      toast.error(`Missed! The answer was: ${asteroid.answer}`);
      setAsteroids(prev => prev.filter(a => a.id !== asteroid.id));
    }
  };

  const handleGameOver = () => {
    onGameOver(score);
    setShowGameOverDialog(false);
  };

  return (
    <div className="relative h-[calc(100vh-200px)] overflow-hidden">
      <div className="absolute top-4 left-4 space-y-2">
        <div className="text-xl font-bold">Score: {score}</div>
        <div>Level: {level}</div>
        <div>Lives: {3 - missedWords}</div>
      </div>
      
      {asteroids.map(asteroid => (
        <div
          key={asteroid.id}
          className={`asteroid ${asteroid.status} ${asteroid.isRetry ? 'bg-[#ea384c]/20' : ''}`}
          style={{
            left: `${asteroid.position}%`,
            animationDuration: `${gameSpeed * (1 / level)}ms`,
          }}
          onAnimationEnd={() => handleAsteroidHitBottom(asteroid)}
        >
          <div className={`asteroid-content ${asteroid.isRetry ? 'border-[#ea384c]/50' : ''}`}>
            {asteroid.word}
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
          disabled={!isGameActive}
        />
      </form>

      <Dialog open={showLevelDialog} onOpenChange={setShowLevelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Level Up!</DialogTitle>
            <DialogDescription>
              Congratulations! You've reached Level {level}. 
              The asteroids will fall slightly faster now.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowLevelDialog(false)}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showGameOverDialog} onOpenChange={setShowGameOverDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Game Over!</DialogTitle>
            <DialogDescription>
              Your final score: {score}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleGameOver}>Play Again</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Game;
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

interface LastChanceCorrection {
  word: string;
  answer: string;
  isActive: boolean;
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
  const [lastChanceCorrection, setLastChanceCorrection] = useState<LastChanceCorrection>({
    word: '',
    answer: '',
    isActive: false
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const gameSpeed = (8000 - (speed * 1.5) + 2000);

  useEffect(() => {
    if (pairs.length === 0 || !isGameActive || lastChanceCorrection.isActive) return;
    
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
    }, 3000);

    return () => clearInterval(interval);
  }, [pairs, level, isGameActive, lastChanceCorrection.isActive]);

  useEffect(() => {
    if (wordsCompleted >= 10) {
      setShowLevelDialog(true);
      setLevel(l => l + 1);
      setWordsCompleted(0);
      setAsteroids([]);
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
    
    if (lastChanceCorrection.isActive) {
      if (answer === lastChanceCorrection.answer.toLowerCase()) {
        setLastChanceCorrection({ word: '', answer: '', isActive: false });
        toast.success("Correct! But be faster next time!");
        setInput('');
      } else {
        toast.error("That's still not correct. Try again!");
      }
      return;
    }

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
      setAsteroids(prev => prev.map(a => {
        if (a.status === 'falling') {
          toast.error(`Incorrect! Try again!`);
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
      if (asteroid.isRetry) {
        // If a red asteroid hits the bottom, it's game over
        setIsGameActive(false);
        setShowGameOverDialog(true);
        setAsteroids([]);
        return;
      }

      setScore(s => s - 50);
      setLastChanceCorrection({
        word: asteroid.word,
        answer: asteroid.answer,
        isActive: true
      });
      
      // Create the red retry asteroid for later
      const retryAsteroid: Asteroid = {
        ...asteroid,
        id: Date.now(),
        position: Math.random() * 80,
        status: 'falling',
        isRetry: true
      };
      
      setTimeout(() => {
        if (isGameActive) {
          setAsteroids(current => [...current, retryAsteroid]);
        }
      }, 1000);

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
      
      {lastChanceCorrection.isActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-black/90 p-6 rounded-lg text-center z-50 border-2 border-red-500">
          <h3 className="text-xl font-bold mb-4">Incorrect!</h3>
          <p className="mb-4">The word was: {lastChanceCorrection.word}</p>
          <p className="mb-4">The correct answer is: {lastChanceCorrection.answer}</p>
          <p>Type the correct answer to continue</p>
        </div>
      )}

      {asteroids.map(asteroid => (
        <div
          key={asteroid.id}
          className={`asteroid ${asteroid.status} ${asteroid.isRetry ? 'bg-[#ea384c]/20' : ''}`}
          style={{
            left: `${asteroid.position}%`,
            animationDuration: `${gameSpeed * (1 / level)}ms`,
            animationPlayState: lastChanceCorrection.isActive ? 'paused' : 'running'
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
          placeholder={lastChanceCorrection.isActive ? "Type the correct answer..." : "Type the matching word..."}
          autoFocus
          disabled={!isGameActive && !lastChanceCorrection.isActive}
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
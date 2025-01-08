import { useState } from 'react';

interface WordInputProps {
  onAddPair: (term: string, definition: string) => void;
}

const WordInput = ({ onAddPair }: WordInputProps) => {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term && definition) {
      onAddPair(term, definition);
      setTerm('');
      setDefinition('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Term (e.g. りんご)"
          className="game-input"
        />
        <input
          type="text"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          placeholder="Definition (e.g. apple)"
          className="game-input"
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 
                 transition-colors rounded-lg text-white font-medium"
      >
        Add Word Pair
      </button>
    </form>
  );
};

export default WordInput;
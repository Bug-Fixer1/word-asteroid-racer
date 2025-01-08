interface WordListProps {
  pairs: Array<{ term: string; definition: string }>;
  onRemovePair: (index: number) => void;
}

const WordList = ({ pairs, onRemovePair }: WordListProps) => {
  return (
    <div className="word-list">
      {pairs.map((pair, index) => (
        <div key={index} className="word-pair">
          <span>{pair.term} - {pair.definition}</span>
          <button
            onClick={() => onRemovePair(index)}
            className="text-white/50 hover:text-white"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default WordList;
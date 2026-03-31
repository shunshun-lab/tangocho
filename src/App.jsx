import React, { useState, useMemo } from 'react';
import { words, CATEGORIES, STATUS } from './data/words.js';
import FlashCard from './components/FlashCard.jsx';
import WordList from './components/WordList.jsx';

const ALL_CATEGORY = 'すべて';

function App() {
  const [mode, setMode] = useState('flash'); // 'flash' | 'list'
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statuses, setStatuses] = useState({}); // { [wordId]: STATUS }

  const categories = [ALL_CATEGORY, ...Object.values(CATEGORIES)];

  const filteredWords = useMemo(() => {
    if (selectedCategory === ALL_CATEGORY) return words;
    return words.filter((w) => w.category === selectedCategory);
  }, [selectedCategory]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    setCurrentIndex((i) => Math.min(i + 1, filteredWords.length - 1));
  };

  const handlePrev = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const handleStatusChange = (wordId, status) => {
    setStatuses((prev) => {
      if (prev[wordId] === status) {
        // toggle off
        const next = { ...prev };
        delete next[wordId];
        return next;
      }
      return { ...prev, [wordId]: status };
    });
  };

  // Progress stats for filteredWords
  const progressStats = useMemo(() => {
    const total = filteredWords.length;
    const known = filteredWords.filter((w) => statuses[w.id] === STATUS.KNOWN).length;
    const unknown = filteredWords.filter((w) => statuses[w.id] === STATUS.UNKNOWN).length;
    const skip = filteredWords.filter((w) => statuses[w.id] === STATUS.SKIP).length;
    return { total, known, unknown, skip };
  }, [filteredWords, statuses]);

  const pct = (n) => (progressStats.total > 0 ? (n / progressStats.total) * 100 : 0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>📖 単語帳</h1>
        <p>英単語フラッシュカード — {filteredWords.length} 語</p>
      </header>

      {/* Mode Tabs */}
      <div className="controls">
        <div className="mode-tabs">
          <button
            className={`mode-tab ${mode === 'flash' ? 'active' : ''}`}
            onClick={() => setMode('flash')}
          >
            🃏 フラッシュカード
          </button>
          <button
            className={`mode-tab ${mode === 'list' ? 'active' : ''}`}
            onClick={() => setMode('list')}
          >
            📋 一覧
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-stats">
          <span className="stat">
            <span className="dot known" />
            覚えた: {progressStats.known}
          </span>
          <span className="stat">
            <span className="dot unknown" />
            まだ: {progressStats.unknown}
          </span>
          <span className="stat">
            <span className="dot skip" />
            スキップ: {progressStats.skip}
          </span>
          <span style={{ color: '#94a3b8' }}>
            合計 {progressStats.total} 語
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-segment known" style={{ width: `${pct(progressStats.known)}%` }} />
          <div className="progress-segment unknown" style={{ width: `${pct(progressStats.unknown)}%` }} />
          <div className="progress-segment skip" style={{ width: `${pct(progressStats.skip)}%` }} />
        </div>
      </div>

      {/* Main Content */}
      {mode === 'flash' ? (
        <FlashCard
          words={filteredWords}
          currentIndex={currentIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          onStatusChange={handleStatusChange}
          statuses={statuses}
        />
      ) : (
        <WordList words={filteredWords} statuses={statuses} />
      )}
    </div>
  );
}

export default App;

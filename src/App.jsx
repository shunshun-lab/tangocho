import React, { useEffect, useMemo, useState } from 'react';
import { words as defaultWords, STATUS } from './data/words.js';
import FlashCard from './components/FlashCard.jsx';
import WordList from './components/WordList.jsx';

const ALL_CATEGORY = 'すべて';
const LS_KEY = 'tangocho.customWords.v1';

function maxId(list) {
  let m = 0;
  for (const w of list) m = Math.max(m, Number(w.id) || 0);
  return m;
}

function parseMarkdownWordInput(markdown, startingId = 1) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  let category = '未分類';
  let id = startingId;
  const out = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // "## ブロックチェーン・Web3" -> category
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      category = h2[1];
      continue;
    }

    // "- [ ] VC (...) — 説明" (also accept "-" without checkbox)
    const item = line.match(/^-\s*(?:\[[ xX]\]\s*)?(.*?)\s*(?:—|--)\s*(.+)\s*$/);
    if (!item) continue;

    const term = item[1].trim();
    const meaning = item[2].trim();
    if (!term || !meaning) continue;

    out.push({
      id,
      category,
      word: term,
      meaning,
      example: '',
    });
    id += 1;
  }

  return out;
}

function App() {
  const [mode, setMode] = useState('flash'); // 'flash' | 'list'
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statuses, setStatuses] = useState({}); // { [wordId]: STATUS }
  const [customWords, setCustomWords] = useState([]);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState(null); // { added, total }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setCustomWords(parsed);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(customWords));
    } catch {
      // ignore
    }
  }, [customWords]);

  const allWords = useMemo(() => [...defaultWords, ...customWords], [customWords]);

  const categories = useMemo(() => {
    const set = new Set();
    for (const w of allWords) {
      if (w?.category) set.add(w.category);
    }
    return [ALL_CATEGORY, ...Array.from(set)];
  }, [allWords]);

  const filteredWords = useMemo(() => {
    if (selectedCategory === ALL_CATEGORY) return allWords;
    return allWords.filter((w) => w.category === selectedCategory);
  }, [selectedCategory, allWords]);

  // keep "words" variable name used below
  const words = allWords;

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

  const handleImport = () => {
    const nextId = maxId(words) + 1;
    const parsed = parseMarkdownWordInput(importText, nextId);
    if (parsed.length === 0) {
      setImportResult({ added: 0, total: words.length });
      return;
    }

    setCustomWords((prev) => [...prev, ...parsed]);
    setImportResult({ added: parsed.length, total: words.length + parsed.length });
    setImportText('');
  };

  const handleClearImported = () => {
    setCustomWords([]);
    setImportResult({ added: 0, total: defaultWords.length });
    setSelectedCategory(ALL_CATEGORY);
    setCurrentIndex(0);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📖 単語帳</h1>
        <p>英単語フラッシュカード — {filteredWords.length} 語</p>
      </header>

      {/* Import (Markdown) */}
      <div className="import-panel">
        <div className="import-header">
          <h2>取り込み（Markdown）</h2>
          <div className="import-actions">
            <button className="import-btn" onClick={handleImport} disabled={!importText.trim()}>
              取り込む
            </button>
            <button className="import-btn secondary" onClick={handleClearImported} disabled={customWords.length === 0}>
              取り込み分をクリア
            </button>
          </div>
        </div>
        <textarea
          className="import-textarea"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder={'例:\n## ブロックチェーン・Web3\n- [ ] VC (Verifiable Credentials) — W3C標準の検証可能な資格情報\n- [ ] DID — 分散型識別子\n'}
          rows={6}
        />
        {importResult && (
          <div className="import-result">
            追加: {importResult.added} / 総数: {importResult.total}
          </div>
        )}
      </div>

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

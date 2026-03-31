import React from 'react';
import { STATUS } from '../data/words.js';

const statusLabel = {
  [STATUS.KNOWN]: '覚えた',
  [STATUS.UNKNOWN]: 'まだ',
  [STATUS.SKIP]: 'スキップ',
  [STATUS.NONE]: '未確認',
};

function WordList({ words, statuses }) {
  if (words.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">📋</div>
        <p>単語が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="wordlist-section">
      <div className="wordlist-header">
        <h2>単語一覧</h2>
        <span className="word-count">{words.length} 語</span>
      </div>

      {words.map((word) => {
        const status = statuses[word.id] || STATUS.NONE;
        return (
          <div className="word-card" key={word.id}>
            <div className={`word-status-dot ${status}`} title={statusLabel[status]} />
            <div className="word-info">
              <div className="word-english">{word.word}</div>
              <div className="word-japanese">{word.meaning}</div>
              <div className="word-example">{word.example}</div>
            </div>
            <div className="word-category-badge">{word.category}</div>
          </div>
        );
      })}
    </div>
  );
}

export default WordList;

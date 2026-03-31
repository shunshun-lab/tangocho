import React, { useEffect, useRef } from 'react';
import { Flashcard } from 'react-quizlet-flashcard';
import { STATUS } from '../data/words.js';

function FlashCard({ words, currentIndex, onNext, onPrev, onStatusChange, statuses }) {
  const word = words[currentIndex];
  const totalWords = words.length;
  const flipRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') onNext();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === ' ') {
        e.preventDefault();
        if (flipRef.current) flipRef.current.click();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onNext, onPrev]);

  if (!word) {
    return (
      <div className="empty-state">
        <div className="icon">📚</div>
        <p>このカテゴリーに単語がありません</p>
      </div>
    );
  }

  const currentStatus = statuses[word.id] || STATUS.NONE;

  const frontContent = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.78rem', color: '#818cf8', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {word.category}
      </div>
      <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b', marginBottom: '10px', letterSpacing: '-0.5px' }}>
        {word.word}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '8px' }}>
        クリックして意味を確認
      </div>
    </div>
  );

  const backContent = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.7rem', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
        {word.meaning}
      </div>
      <div style={{ fontSize: '0.88rem', color: '#64748b', fontStyle: 'italic', maxWidth: '380px', lineHeight: '1.5' }}>
        "{word.example}"
      </div>
      <div style={{ fontSize: '0.78rem', color: '#818cf8', marginTop: '14px', fontWeight: 600 }}>
        {word.word}
      </div>
    </div>
  );

  return (
    <div className="flashcard-section">
      <div className="card-counter">
        {totalWords > 0 ? `${currentIndex + 1} / ${totalWords} 語` : ''}
      </div>

      <div style={{ width: '100%', maxWidth: 560, cursor: 'pointer' }} ref={flipRef}>
        <Flashcard
          front={{ html: frontContent }}
          back={{ html: backContent }}
          style={{
            width: '100%',
            height: '240px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -3px rgba(79,70,229,0.12), 0 4px 6px -2px rgba(0,0,0,0.05)',
            border: '1.5px solid #e0e7ff',
          }}
          frontStyle={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)' }}
          backStyle={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #ede9fe 100%)' }}
        />
      </div>

      <div className="card-navigation">
        <button className="nav-btn" onClick={onPrev} disabled={currentIndex === 0} title="前へ（←）">
          ‹
        </button>
        <span className="card-index">{currentIndex + 1} / {totalWords}</span>
        <button className="nav-btn" onClick={onNext} disabled={currentIndex === totalWords - 1} title="次へ（→）">
          ›
        </button>
      </div>

      <div className="status-buttons">
        <button
          className={`status-btn known ${currentStatus === STATUS.KNOWN ? 'active' : ''}`}
          onClick={() => onStatusChange(word.id, STATUS.KNOWN)}
          title="覚えた"
        >
          ✓ 覚えた
        </button>
        <button
          className={`status-btn unknown ${currentStatus === STATUS.UNKNOWN ? 'active' : ''}`}
          onClick={() => onStatusChange(word.id, STATUS.UNKNOWN)}
          title="まだ"
        >
          ✗ まだ
        </button>
        <button
          className={`status-btn skip ${currentStatus === STATUS.SKIP ? 'active' : ''}`}
          onClick={() => onStatusChange(word.id, STATUS.SKIP)}
          title="スキップ"
        >
          → スキップ
        </button>
      </div>

      <p className="hint-text">← → キーでナビゲート・Spaceでカードを反転</p>
    </div>
  );
}

export default FlashCard;

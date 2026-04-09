import { useEffect, useMemo, useRef, useState } from 'react';
import Button from './ui/Button.jsx';
import { Rating } from '../lib/scheduler/scheduler.js';
import { db } from '../lib/db.js';
import { fetchDueCardIds, fetchNewCardIds, getCardWithContent, submitReview, suspendCard } from '../lib/reviews.js';

export default function ReviewSession({ user, mode, onExit }) {
  const [queue, setQueue] = useState([]); // cardIds
  const [idx, setIdx] = useState(0);
  const [card, setCard] = useState(null); // {card, content, state}
  const [revealed, setRevealed] = useState(false);
  const [typedRecall, setTypedRecall] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [revealedAt, setRevealedAt] = useState(null);
  const [stats, setStats] = useState({ reviewed: 0, again: 0 });

  const inputRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const settings = await db.studySettings.get(user.id);
      if (!alive) return;
      setTypedRecall(Boolean(settings?.typedRecallDefault));

      const now = Date.now();
      const dueIds = mode === 'newOnly' ? [] : await fetchDueCardIds({ userId: user.id, deckId: null, now, limit: 200 });
      const newCap = settings?.newPerDay ?? 10;
      const newIds = mode === 'reviewOnly' ? [] : await fetchNewCardIds({ userId: user.id, deckId: null, limit: newCap });

      const merged = mode === 'reviewOnly' ? dueIds : mode === 'newOnly' ? newIds : [...dueIds, ...newIds];
      setQueue(merged);
      setIdx(0);
    })();
    return () => {
      alive = false;
    };
  }, [mode, user.id]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const cardId = queue[idx];
      if (!cardId) {
        setCard(null);
        return;
      }
      const c = await getCardWithContent(cardId);
      if (!alive) return;
      setCard(c);
      setRevealed(false);
      setTypedAnswer('');
      setRevealedAt(null);
      // Focus typed recall input early (optional, never blocking reveal)
      setTimeout(() => {
        if (typedRecall && inputRef.current) inputRef.current.focus();
      }, 0);
    })();
    return () => {
      alive = false;
    };
  }, [idx, queue, typedRecall]);

  const total = queue.length;
  const progress = total > 0 ? Math.round(((idx + 1) / total) * 100) : 0;

  const front = card?.content?.front || '';
  const back = card?.content?.back || '';

  const canReveal = Boolean(card);

  const reveal = () => {
    if (!canReveal) return;
    setRevealed(true);
    setRevealedAt(Date.now());
  };

  const grade = async (rating) => {
    if (!card) return;
    const now = Date.now();
    await submitReview({
      userId: user.id,
      deckId: card.card.deckId,
      cardId: card.card.id,
      rating,
      now,
      typedAnswer: typedRecall ? typedAnswer : null,
      revealedAt,
      mode: typedRecall ? 'typed' : 'self',
    });

    setStats((s) => ({
      reviewed: s.reviewed + 1,
      again: s.again + (rating === Rating.AGAIN ? 1 : 0),
    }));

    // In-session immediate relearn for AGAIN: push to end (minimal friction).
    if (rating === Rating.AGAIN) {
      setQueue((q) => [...q, card.card.id]);
    }
    setIdx((i) => Math.min(i + 1, queue.length)); // allow landing on "done"
  };

  const skipForever = async () => {
    if (!card) return;
    const now = Date.now();
    await suspendCard({ userId: user.id, cardId: card.card.id, now });
    setIdx((i) => Math.min(i + 1, queue.length));
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onExit();
      if (e.key === ' ' || e.key === 'Enter') {
        // Reveal first; if already revealed, do nothing (avoid accidental grading)
        if (!revealed) {
          e.preventDefault();
          reveal();
        }
      }
      if (!revealed) return;
      if (e.key === '1') grade(Rating.AGAIN);
      if (e.key === '2') grade(Rating.HARD);
      if (e.key === '3') grade(Rating.GOOD);
      if (e.key === '4') grade(Rating.EASY);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, card, typedAnswer, typedRecall, revealedAt, onExit]);

  if (total === 0) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC' }}>今日のキューは空です</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>レビューが溜まる前に、少量の新規を追加すると回しやすいです。</div>
          <div style={{ marginTop: 12 }}>
            <Button onClick={onExit}>戻る</Button>
          </div>
        </div>
      </div>
    );
  }

  const done = idx >= total;
  if (done) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#F8FAFC' }}>セッション完了</div>
          <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Pill label="Reviewed" value={stats.reviewed} />
            <Pill label="Again" value={stats.again} />
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 10 }}>レビュー履歴は全て保存され、次回のdue計算に使われます。</div>
          <div style={{ marginTop: 12 }}>
            <Button onClick={onExit}>ダッシュボードへ</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>
          {idx + 1} / {total}（{progress}%）
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#94A3B8', display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={typedRecall} onChange={(e) => setTypedRecall(e.target.checked)} />
            typed recall
          </label>
          <Button variant="ghost" onClick={onExit} style={{ padding: '8px 10px' }}>
            終了（Esc）
          </Button>
        </div>
      </div>

      <div style={{ marginTop: 10, background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: '22px 18px', minHeight: 260 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#F8FAFC', lineHeight: 1.25, whiteSpace: 'pre-wrap' }}>{front}</div>

        {!revealed ? (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: '#64748B' }}>まず思い出す（数秒でOK）。次に答えを開示。</div>
            {typedRecall && (
              <div style={{ marginTop: 12 }}>
                <input
                  ref={inputRef}
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="（任意）思い出した答えを入力"
                  style={{
                    width: '100%',
                    background: '#0B1220',
                    border: '1px solid #334155',
                    borderRadius: 12,
                    padding: '10px 12px',
                    color: '#E2E8F0',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <Button onClick={reveal} style={{ padding: '12px 18px' }}>
                答えを見る（Space/Enter）
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#93C5FD', marginBottom: 10 }}>Answer</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{back}</div>

            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              <GradeButton k="1" label="Again" hint="忘れた/曖昧" onClick={() => grade(Rating.AGAIN)} />
              <GradeButton k="2" label="Hard" hint="思い出せたが重い" onClick={() => grade(Rating.HARD)} />
              <GradeButton k="3" label="Good" hint="普通に思い出せた" onClick={() => grade(Rating.GOOD)} />
              <GradeButton k="4" label="Easy" hint="余裕で想起" onClick={() => grade(Rating.EASY)} />
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="secondary" onClick={skipForever}>
                もう出さなくていい
              </Button>
            </div>

            <div style={{ marginTop: 10, fontSize: 11, color: '#64748B' }}>ショートカット: 1/2/3/4 で採点</div>
          </div>
        )}
      </div>
    </div>
  );
}

function GradeButton({ k, label, hint, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#0B1220',
        border: '1px solid #334155',
        borderRadius: 14,
        padding: '12px 12px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.12s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#F8FAFC' }}>{label}</div>
        <div style={{ fontSize: 11, color: '#94A3B8', border: '1px solid #334155', borderRadius: 999, padding: '2px 8px' }}>{k}</div>
      </div>
      <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>{hint}</div>
    </button>
  );
}

function Pill({ label, value }) {
  return (
    <div style={{ background: '#0B1220', border: '1px solid #334155', borderRadius: 999, padding: '6px 10px', fontSize: 12, color: '#E2E8F0' }}>
      <span style={{ color: '#94A3B8', marginRight: 6 }}>{label}</span>
      <span style={{ fontWeight: 800 }}>{value}</span>
    </div>
  );
}


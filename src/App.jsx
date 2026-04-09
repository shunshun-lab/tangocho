import { useCallback, useEffect, useMemo, useState } from 'react';
import { CARDS } from './data/cards.js';

const LS_CUSTOM_CARDS = 'tangocho.customCards.v1';
const LS_KNOWN = 'tangocho.knownCardIds.v1';

const CATEGORY_COLORS = {
  'ブロックチェーン・Web3': { bg: '#EFF6FF', border: '#3B82F6', tag: '#2563EB' },
  'スタートアップ・ファイナンス': { bg: '#FEF3C7', border: '#F59E0B', tag: '#D97706' },
  '地方創生・行政': { bg: '#ECFDF5', border: '#10B981', tag: '#059669' },
  'AI・機械学習': { bg: '#F5F3FF', border: '#8B5CF6', tag: '#7C3AED' },
  '航空・ドローン工学': { bg: '#FFF1F2', border: '#F43F5E', tag: '#E11D48' },
  '電気機械・ロータ工学': { bg: '#FFF7ED', border: '#F97316', tag: '#EA580C' },
  '経済学・マクロ': { bg: '#F0FDF4', border: '#22C55E', tag: '#16A34A' },
  'コミュニティ・プロダクト設計': { bg: '#EFF6FF', border: '#0EA5E9', tag: '#0284C7' },
  '哲学・思想': { bg: '#FAF5FF', border: '#A855F7', tag: '#9333EA' },
  'エネルギー・インフラ': { bg: '#FEFCE8', border: '#EAB308', tag: '#CA8A04' },
  'ビジネス・営業': { bg: '#F1F5F9', border: '#64748B', tag: '#475569' },
  'AI・機械学習（追加）': { bg: '#F5F3FF', border: '#8B5CF6', tag: '#7C3AED' },
  '電気機械・ロータ工学（追加）': { bg: '#FFF7ED', border: '#F97316', tag: '#EA580C' },
  '生物学・進化論': { bg: '#FDF2F8', border: '#EC4899', tag: '#DB2777' },
  '医学・発達': { bg: '#F0FDFA', border: '#14B8A6', tag: '#0D9488' },
  'ビジネス・商社': { bg: '#F1F5F9', border: '#64748B', tag: '#475569' },
  'カバラ・神秘主義': { bg: '#FFFBEB', border: '#D97706', tag: '#B45309' },
  '独自概念・造語': { bg: '#F0F9FF', border: '#38BDF8', tag: '#0284C7' },
  '香り・フレグランス': { bg: '#FDF4FF', border: '#D946EF', tag: '#C026D3' },
};

const DEFAULT_COLOR = { bg: '#F8FAFC', border: '#94A3B8', tag: '#64748B' };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function maxId(list) {
  let m = 0;
  for (const c of list) m = Math.max(m, Number(c.id) || 0);
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

    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      category = h2[1];
      continue;
    }

    // "- [ ] term — definition" (also accept "-" without checkbox)
    const item = line.match(/^-\s*(?:\[[ xX]\]\s*)?(.*?)\s*(?:—|--)\s*(.+)\s*$/);
    if (!item) continue;

    const term = item[1].trim();
    const definition = item[2].trim();
    if (!term || !definition) continue;

    out.push({ id, category, term, definition });
    id += 1;
  }

  return out;
}

export default function App() {
  const baseCards = useMemo(() => [...CARDS], []);

  const [customCards, setCustomCards] = useState([]);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState(null); // { added, total }

  const allCards = useMemo(() => [...baseCards, ...customCards], [baseCards, customCards]);
  const categories = useMemo(() => [...new Set(allCards.map((c) => c.category))], [allCards]);

  const [selectedCats, setSelectedCats] = useState(() => new Set(categories));
  const [flipped, setFlipped] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [deck, setDeck] = useState(() => shuffle(allCards));
  const [known, setKnown] = useState(() => new Set());
  const [showMenu, setShowMenu] = useState(false);
  const [studyMode, setStudyMode] = useState('all'); // "all" | "unknown"

  // load persisted custom cards + known ids
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_CUSTOM_CARDS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCustomCards(parsed);
      }
    } catch {
      // ignore
    }
    try {
      const rawKnown = localStorage.getItem(LS_KNOWN);
      if (rawKnown) {
        const parsed = JSON.parse(rawKnown);
        if (Array.isArray(parsed)) setKnown(new Set(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  // persist custom cards + known ids
  useEffect(() => {
    try {
      localStorage.setItem(LS_CUSTOM_CARDS, JSON.stringify(customCards));
    } catch {
      // ignore
    }
  }, [customCards]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KNOWN, JSON.stringify(Array.from(known)));
    } catch {
      // ignore
    }
  }, [known]);

  // When cards change (custom import), rebuild deck but keep selection best-effort
  useEffect(() => {
    setDeck(shuffle(allCards));
    setCurrentIdx(0);
    setFlipped(false);
    setSelectedCats((prev) => {
      // keep previously selected categories if still present; otherwise default to all
      const next = new Set();
      for (const c of categories) if (prev.has(c)) next.add(c);
      if (next.size === 0) return new Set(categories);
      return next;
    });
  }, [allCards, categories]);

  const filteredDeck = useMemo(() => {
    let d = deck.filter((c) => selectedCats.has(c.category));
    if (studyMode === 'unknown') d = d.filter((c) => !known.has(c.id));
    return d;
  }, [deck, selectedCats, studyMode, known]);

  const card = filteredDeck[currentIdx] || null;
  const colors = card ? (CATEGORY_COLORS[card.category] || DEFAULT_COLOR) : DEFAULT_COLOR;

  const resetDeck = useCallback(() => {
    setDeck(shuffle(allCards));
    setCurrentIdx(0);
    setFlipped(false);
  }, [allCards]);

  useEffect(() => {
    setCurrentIdx(0);
    setFlipped(false);
  }, [selectedCats, studyMode]);

  const next = useCallback(() => {
    setCurrentIdx((i) => Math.min(i + 1, filteredDeck.length - 1));
    setFlipped(false);
  }, [filteredDeck.length]);

  const prev = useCallback(() => {
    setCurrentIdx((i) => Math.max(i - 1, 0));
    setFlipped(false);
  }, []);

  const toggleKnown = useCallback((id) => {
    setKnown((prevSet) => {
      const s = new Set(prevSet);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const progress = filteredDeck.length > 0 ? ((currentIdx + 1) / filteredDeck.length) * 100 : 0;
  const knownInDeck = filteredDeck.filter((c) => known.has(c.id)).length;

  const handleImport = () => {
    const nextId = maxId(allCards) + 1;
    const parsed = parseMarkdownWordInput(importText, nextId);
    if (parsed.length === 0) {
      setImportResult({ added: 0, total: allCards.length });
      return;
    }
    setCustomCards((prevList) => [...prevList, ...parsed]);
    setImportResult({ added: parsed.length, total: allCards.length + parsed.length });
    setImportText('');
  };

  const handleClearImported = () => {
    setCustomCards([]);
    setImportResult({ added: 0, total: baseCards.length });
    setCurrentIdx(0);
    setFlipped(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        fontFamily: "'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif",
        color: '#E2E8F0',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#F8FAFC' }}>MMD DAO 単語帳</h1>
        <p style={{ fontSize: 13, color: '#94A3B8', margin: '4px 0 0' }}>
          ChatGPT全履歴より自動抽出 — {allCards.length}語（ベース {CARDS.length}語）
        </p>
      </div>

      {/* Import */}
      <div style={{ maxWidth: 720, margin: '0 auto 12px', background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8' }}>取り込み（Markdown）</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              style={{
                background: !importText.trim() ? '#1E293B' : '#3B82F6',
                border: 'none',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 13,
                color: !importText.trim() ? '#475569' : '#fff',
                cursor: !importText.trim() ? 'default' : 'pointer',
              }}
            >
              取り込む
            </button>
            <button
              onClick={handleClearImported}
              disabled={customCards.length === 0}
              style={{
                background: customCards.length === 0 ? '#1E293B' : '#334155',
                border: '1px solid #475569',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 13,
                color: customCards.length === 0 ? '#475569' : '#E2E8F0',
                cursor: customCards.length === 0 ? 'default' : 'pointer',
              }}
            >
              取り込み分をクリア
            </button>
          </div>
        </div>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder={'例:\n## ブロックチェーン・Web3\n- [ ] VC (Verifiable Credentials) — W3C標準の検証可能な資格情報\n- [ ] DID — 分散型識別子\n'}
          rows={5}
          style={{
            width: '100%',
            background: '#0B1220',
            border: '1px solid #334155',
            borderRadius: 10,
            padding: '10px 12px',
            color: '#E2E8F0',
            fontSize: 12,
            lineHeight: 1.5,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            boxSizing: 'border-box',
          }}
        />
        {importResult && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8' }}>
            追加: {importResult.added} / 総数: {importResult.total}
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div style={{ maxWidth: 720, margin: '0 auto 12px', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, padding: '6px 14px', fontSize: 13 }}>
          {filteredDeck.length === 0 ? '0 / 0' : `${currentIdx + 1} / ${filteredDeck.length}`}
        </span>
        <span style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#4ADE80' }}>
          覚えた: {knownInDeck} / {filteredDeck.length}
        </span>
        <button onClick={() => setShowMenu((m) => !m)} style={{ background: '#334155', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#E2E8F0', cursor: 'pointer' }}>
          {showMenu ? '閉じる' : '設定'}
        </button>
        <button onClick={resetDeck} style={{ background: '#334155', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#E2E8F0', cursor: 'pointer' }}>
          シャッフル
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ maxWidth: 720, margin: '0 auto 16px', background: '#1E293B', borderRadius: 4, height: 4, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)', transition: 'width 0.3s ease' }} />
      </div>

      {/* Settings panel */}
      {showMenu && (
        <div style={{ maxWidth: 720, margin: '0 auto 16px', background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8' }}>モード：</span>
            <button onClick={() => setStudyMode('all')} style={{ marginLeft: 8, background: studyMode === 'all' ? '#3B82F6' : '#475569', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: '#fff', cursor: 'pointer' }}>
              全カード
            </button>
            <button onClick={() => setStudyMode('unknown')} style={{ marginLeft: 6, background: studyMode === 'unknown' ? '#3B82F6' : '#475569', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: '#fff', cursor: 'pointer' }}>
              未習得のみ
            </button>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>カテゴリ選択：</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button onClick={() => setSelectedCats(new Set(categories))} style={{ background: '#475569', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#fff', cursor: 'pointer' }}>
              全選択
            </button>
            <button onClick={() => setSelectedCats(new Set())} style={{ background: '#475569', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#fff', cursor: 'pointer' }}>
              全解除
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {categories.map((cat) => {
              const c = CATEGORY_COLORS[cat] || DEFAULT_COLOR;
              const on = selectedCats.has(cat);
              const count = allCards.filter((x) => x.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    const s = new Set(selectedCats);
                    if (on) s.delete(cat);
                    else s.add(cat);
                    setSelectedCats(s);
                  }}
                  style={{
                    background: on ? c.tag : '#334155',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: 11,
                    color: '#fff',
                    cursor: 'pointer',
                    opacity: on ? 1 : 0.5,
                    transition: 'all 0.2s',
                  }}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Card */}
      {card ? (
        <div style={{ maxWidth: 720, margin: '0 auto 20px', perspective: 1000 }}>
          <div
            onClick={() => setFlipped((f) => !f)}
            style={{
              minHeight: 280,
              cursor: 'pointer',
              borderRadius: 16,
              background: flipped ? colors.bg : '#1E293B',
              border: `2px solid ${colors.border}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '32px 24px',
              transition: 'all 0.35s ease',
              position: 'relative',
              boxShadow: `0 4px 24px ${colors.border}33`,
              boxSizing: 'border-box',
            }}
          >
            {/* Category tag */}
            <span
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                background: colors.tag,
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 20,
              }}
            >
              {card.category}
            </span>

            {/* Known badge */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleKnown(card.id);
              }}
              style={{
                position: 'absolute',
                top: 14,
                right: 16,
                background: known.has(card.id) ? '#4ADE80' : '#475569',
                border: 'none',
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 11,
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {known.has(card.id) ? '覚えた' : '未習得'}
            </button>

            {/* Content */}
            {!flipped ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#F8FAFC', lineHeight: 1.3, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{card.term}</div>
                <div style={{ fontSize: 13, color: '#64748B' }}>タップで答えを見る</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: colors.tag, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{card.term}</div>
                <div style={{ fontSize: 18, fontWeight: 500, color: '#1E293B', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{card.definition}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: 40, color: '#94A3B8' }}>
          <p style={{ fontSize: 18 }}>該当するカードがありません</p>
          <p style={{ fontSize: 14 }}>設定からカテゴリを選択するか、モードを変更してください</p>
        </div>
      )}

      {/* Navigation */}
      {card && (
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={prev}
            disabled={currentIdx === 0}
            style={{
              background: currentIdx === 0 ? '#1E293B' : '#334155',
              border: '1px solid #475569',
              borderRadius: 10,
              padding: '10px 28px',
              fontSize: 15,
              color: currentIdx === 0 ? '#475569' : '#E2E8F0',
              cursor: currentIdx === 0 ? 'default' : 'pointer',
            }}
          >
            ← 前
          </button>
          <button
            onClick={() => setFlipped((f) => !f)}
            style={{
              background: '#3B82F6',
              border: 'none',
              borderRadius: 10,
              padding: '10px 28px',
              fontSize: 15,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {flipped ? '問題に戻る' : '答えを見る'}
          </button>
          <button
            onClick={next}
            disabled={currentIdx >= filteredDeck.length - 1}
            style={{
              background: currentIdx >= filteredDeck.length - 1 ? '#1E293B' : '#334155',
              border: '1px solid #475569',
              borderRadius: 10,
              padding: '10px 28px',
              fontSize: 15,
              color: currentIdx >= filteredDeck.length - 1 ? '#475569' : '#E2E8F0',
              cursor: currentIdx >= filteredDeck.length - 1 ? 'default' : 'pointer',
            }}
          >
            次 →
          </button>
        </div>
      )}

      {/* Keyboard hint */}
      <div style={{ maxWidth: 720, margin: '16px auto 0', textAlign: 'center', fontSize: 11, color: '#475569' }}>
        キーボード: ← → で移動 / Space・Enter で反転
      </div>
    </div>
  );
}

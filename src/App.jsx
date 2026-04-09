import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import ReviewSession from './components/ReviewSession.jsx';
import { db } from './lib/db.js';
import { LS_ACTIVE_USER, loginWithEmail } from './lib/seed.js';

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

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home'); // home | review
  const [reviewMode, setReviewMode] = useState('dueFirst'); // dueFirst | reviewOnly | newOnly
  const [email, setEmail] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const id = localStorage.getItem(LS_ACTIVE_USER);
      if (!id) return;
      const u = await db.users.get(id);
      if (!alive) return;
      if (u) setUser(u);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onStartReview = ({ mode }) => {
    setReviewMode(mode);
    setPage('review');
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
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#F8FAFC' }}>tangocho</h1>
        <p style={{ fontSize: 13, color: '#94A3B8', margin: '6px 0 0' }}>想起 → 開示 → 自己採点（SRS）</p>
      </div>

      {!user ? (
        <div style={{ maxWidth: 520, margin: '0 auto', background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#F8FAFC' }}>ログイン（ローカル）</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>MVPではローカル端末内のユーザーとして保存します。</div>
          <div style={{ marginTop: 12 }}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email（例: you@example.com）"
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
          <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={async () => {
                const u = await loginWithEmail(email);
                setUser(u);
              }}
              style={{
                background: '#3B82F6',
                border: 'none',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              ログイン
            </button>
            <button
              onClick={async () => {
                const u = await loginWithEmail('dev@local');
                setUser(u);
              }}
              style={{
                background: '#334155',
                border: '1px solid #475569',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 14,
                fontWeight: 700,
                color: '#E2E8F0',
                cursor: 'pointer',
              }}
            >
              devで続行
            </button>
          </div>
        </div>
      ) : page === 'home' ? (
        <Dashboard user={user} onStartReview={onStartReview} />
      ) : (
        <ReviewSession
          user={user}
          mode={reviewMode === 'dueFirst' ? 'dueFirst' : reviewMode}
          onExit={() => setPage('home')}
        />
      )}
    </div>
  );
}

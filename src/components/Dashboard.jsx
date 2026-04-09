import { useEffect, useMemo, useState } from 'react';
import Button from './ui/Button.jsx';
import { db } from '../lib/db.js';
import { getDueCounts } from '../lib/reviews.js';

export default function Dashboard({ user, onStartReview }) {
  const [counts, setCounts] = useState({ due: 0, newTotal: 0 });
  const [settings, setSettings] = useState(null);

  const now = Date.now();

  useEffect(() => {
    let alive = true;
    (async () => {
      const c = await getDueCounts({ userId: user.id, now: Date.now() });
      const s = await db.studySettings.get(user.id);
      if (!alive) return;
      setCounts(c);
      setSettings(s);
    })();
    return () => {
      alive = false;
    };
  }, [user.id]);

  const newAvailableToday = useMemo(() => {
    const cap = settings?.newPerDay ?? 10;
    return Math.min(counts.newTotal, cap);
  }, [counts.newTotal, settings?.newPerDay]);

  const estMins = useMemo(() => {
    // rough: 12s per review, 18s per new
    const reviewSecs = counts.due * 12;
    const newSecs = newAvailableToday * 18;
    return Math.max(1, Math.round((reviewSecs + newSecs) / 60));
  }, [counts.due, newAvailableToday]);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC' }}>今日の学習</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>レビュー優先。短時間で終わる設計です。</div>
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>ユーザー: {user.email}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 14 }}>
        <Stat title="Due reviews" value={counts.due} hint="期限切れ・本日分を優先" />
        <Stat title="New available" value={newAvailableToday} hint={`本日の新規上限: ${settings?.newPerDay ?? 10}`} />
        <Stat title="Estimated time" value={`${estMins} min`} hint="目安。集中が切れたら止めてOK" />
        <Stat title="Streak" value="—" hint="MVP: 次ステップで実装" />
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button
          onClick={() => onStartReview({ mode: 'dueFirst' })}
          disabled={counts.due === 0 && newAvailableToday === 0}
          style={{ padding: '12px 18px' }}
        >
          学習を開始
        </Button>
        <Button variant="secondary" onClick={() => onStartReview({ mode: 'reviewOnly' })} disabled={counts.due === 0}>
          レビューのみ
        </Button>
        <Button variant="secondary" onClick={() => onStartReview({ mode: 'newOnly' })} disabled={newAvailableToday === 0}>
          新規のみ
        </Button>
      </div>

      {(counts.due > 0 || newAvailableToday > 0) && (
        <div style={{ marginTop: 14, fontSize: 12, color: '#94A3B8' }}>
          コツ: まず「思い出す」→ 次に「答えを見る」→ 最後に自己採点。認識問題（多肢選択）はデフォルトにしません。
        </div>
      )}
    </div>
  );
}

function Stat({ title, value, hint }) {
  return (
    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.02em' }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC', marginTop: 6 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748B', marginTop: 6 }}>{hint}</div>
    </div>
  );
}


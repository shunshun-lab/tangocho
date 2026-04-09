import { db } from './db.js';
import { newId } from './ids.js';
import { createBaselineScheduler, Rating } from './scheduler/scheduler.js';

const scheduler = createBaselineScheduler();

export async function getDueCounts({ userId, now }) {
  const dueStates = await db.reviewStates
    .where('userId')
    .equals(userId)
    .and((s) => s.nextDueAt != null && s.nextDueAt <= now)
    .toArray();
  const dueCardIds = dueStates.map((s) => s.cardId);
  const dueCards = dueCardIds.length ? await db.cards.bulkGet(dueCardIds) : [];
  const due = dueCards.filter((c) => c && c.status === 'active' && !c.archivedAt).length;

  const activeCards = await db.cards.where({ userId, status: 'active' }).toArray();
  const states = await db.reviewStates.where('userId').equals(userId).toArray();
  const seenSet = new Set(states.map((s) => s.cardId));
  const newTotal = activeCards.filter((c) => !c.archivedAt && !seenSet.has(c.id)).length;
  return { due, newTotal };
}

export async function fetchDueCardIds({ userId, deckId, now, limit = 50 }) {
  let q = db.reviewStates.where('userId').equals(userId);
  if (deckId) q = q.and((s) => s.deckId === deckId);
  const dueStates = await q.and((s) => s.nextDueAt != null && s.nextDueAt <= now).toArray();
  dueStates.sort((a, b) => (a.nextDueAt || 0) - (b.nextDueAt || 0));
  const orderedIds = dueStates.map((s) => s.cardId);
  const cards = orderedIds.length ? await db.cards.bulkGet(orderedIds) : [];
  const activeIdSet = new Set(
    cards
      .filter((c) => c && c.status === 'active' && !c.archivedAt)
      .map((c) => c.id)
  );
  const filtered = orderedIds.filter((id) => activeIdSet.has(id));
  return filtered.slice(0, limit);
}

export async function fetchNewCardIds({ userId, deckId, limit = 10 }) {
  const cards = await db.cards.where({ userId, status: 'active' }).toArray();
  const states = await db.reviewStates.where('userId').equals(userId).toArray();
  const seenSet = new Set(states.map((s) => s.cardId));
  const filtered = cards
    .filter((c) => (!deckId ? true : c.deckId === deckId))
    .filter((c) => !c.archivedAt && !seenSet.has(c.id))
    .sort((a, b) => a.createdAt - b.createdAt);
  return filtered.slice(0, limit).map((c) => c.id);
}

export async function getCardWithContent(cardId) {
  const card = await db.cards.get(cardId);
  if (!card) return null;
  const content = await db.cardContents.get(cardId);
  const state = await db.reviewStates.get(cardId);
  return { card, content, state };
}

export async function suspendCard({ userId, cardId, now }) {
  const card = await db.cards.get(cardId);
  if (!card) return null;
  if (card.userId !== userId) throw new Error('forbidden');

  const updated = { ...card, status: 'suspended', updatedAt: now };
  await db.cards.put(updated);

  // optional event log entry for traceability (not a review rating)
  await db.reviewLogs.add({
    id: newId('rlog'),
    userId,
    deckId: card.deckId,
    cardId,
    reviewedAt: now,
    rating: 'suspend',
    scheduler: scheduler.name,
    mode: 'action',
  });

  return updated;
}

export async function submitReview({
  userId,
  deckId,
  cardId,
  rating,
  now,
  typedAnswer = null,
  revealedAt = null,
  mode = 'self',
}) {
  if (!Object.values(Rating).includes(rating)) throw new Error('invalid rating');

  const prev = await db.reviewStates.get(cardId);
  const scheduled = scheduler.schedule({
    prevState: prev?.memory || null,
    rating,
    now,
  });

  const nextState = {
    cardId,
    userId,
    deckId,
    nextDueAt: scheduled.nextDueAt,
    lastReviewedAt: now,
    lapseCount: (prev?.lapseCount || 0) + (rating === Rating.AGAIN ? 1 : 0),
    againCount: (prev?.againCount || 0) + (rating === Rating.AGAIN ? 1 : 0),
    isLeech: Boolean(scheduled.memory?.isLeech),
    memory: scheduled.memory,
  };

  const log = {
    id: newId('rlog'),
    userId,
    deckId,
    cardId,
    reviewedAt: now,
    rating,
    scheduler: scheduler.name,
    typedAnswer,
    revealedAt,
    mode,
  };

  await db.transaction('rw', db.reviewStates, db.reviewLogs, async () => {
    await db.reviewStates.put(nextState);
    await db.reviewLogs.add(log);
  });

  return { nextState, log };
}


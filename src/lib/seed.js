import { db } from './db.js';
import { newId } from './ids.js';
import { CARDS } from '../data/cards.js';

export const LS_ACTIVE_USER = 'tangocho.activeUserId.v1';

export async function getOrCreateActiveUser() {
  const existingId = localStorage.getItem(LS_ACTIVE_USER);
  if (existingId) {
    const u = await db.users.get(existingId);
    if (u) return u;
  }

  const id = newId('usr');
  const user = {
    id,
    email: 'dev@local',
    createdAt: Date.now(),
  };
  await db.users.add(user);
  localStorage.setItem(LS_ACTIVE_USER, id);
  await ensureDefaultSettings(id);
  await ensureSeedDeck(id);
  return user;
}

export async function loginWithEmail(emailRaw) {
  const email = String(emailRaw || '').trim().toLowerCase();
  if (!email) throw new Error('email required');

  let user = await db.users.where('email').equals(email).first();
  if (!user) {
    user = { id: newId('usr'), email, createdAt: Date.now() };
    await db.users.add(user);
    await ensureDefaultSettings(user.id);
    await ensureSeedDeck(user.id);
  }

  localStorage.setItem(LS_ACTIVE_USER, user.id);
  return user;
}

export async function ensureDefaultSettings(userId) {
  const existing = await db.studySettings.get(userId);
  if (existing) return existing;

  const settings = {
    userId,
    newPerDay: 10,
    reviewSoftCap: 80,
    typedRecallDefault: false,
    updatedAt: Date.now(),
  };
  await db.studySettings.put(settings);
  return settings;
}

export async function ensureSeedDeck(userId) {
  const existing = await db.decks.where({ userId, name: 'Default' }).first();
  if (existing) return existing;

  const now = Date.now();
  const deck = {
    id: newId('deck'),
    userId,
    name: 'Default',
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await db.transaction('rw', db.decks, db.cards, db.cardContents, async () => {
    await db.decks.add(deck);

    const cards = CARDS.map((c) => {
      const cardId = newId('card');
      return {
        card: {
          id: cardId,
          userId,
          deckId: deck.id,
          status: 'active',
          createdAt: now,
          updatedAt: now,
          archivedAt: null,
          legacy: { id: c.id, category: c.category },
        },
        content: {
          cardId,
          front: c.term,
          back: c.definition,
          pronunciation: null,
          example: null,
          note: c.category || null,
          tags: c.category ? [c.category] : [],
          source: 'seed:src/data/cards.js',
        },
      };
    });

    await db.cards.bulkAdd(cards.map((x) => x.card));
    await db.cardContents.bulkAdd(cards.map((x) => x.content));
  });

  return deck;
}


import Dexie from 'dexie';

export const DB_NAME = 'tangocho.db.v1';

export const db = new Dexie(DB_NAME);

// Notes:
// - Keep tables denormalized enough for fast "due queue" reads.
// - Store ReviewLog as append-only event log; ReviewState is current snapshot.
db.version(1).stores({
  users: '&id, email, createdAt',
  studySettings: '&userId, newPerDay, reviewSoftCap, typedRecallDefault, updatedAt',

  decks: '&id, userId, name, archivedAt, createdAt, updatedAt',

  cards: '&id, userId, deckId, status, createdAt, updatedAt, archivedAt',
  cardContents: '&cardId, front, back, pronunciation, example, note, tags, source',

  reviewStates: '&cardId, userId, deckId, nextDueAt, lastReviewedAt, lapseCount, againCount, isLeech',
  reviewLogs: '&id, userId, deckId, cardId, reviewedAt, rating',
});


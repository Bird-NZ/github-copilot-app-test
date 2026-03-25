import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { readData, updateData } from './dataStore.js';

export async function signup(email, password) {
  const existing = readData().users.find(user => user.email === email);
  if (existing) throw new Error('EMAIL_EXISTS');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: uuid(), email, passwordHash, createdAt: new Date().toISOString() };

  updateData(state => {
    state.users.push(user);
    return state;
  });

  return { id: user.id, email: user.email };
}

export async function signin(email, password) {
  const user = readData().users.find(item => item.email === email);
  if (!user) throw new Error('INVALID_CREDENTIALS');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('INVALID_CREDENTIALS');

  const session = {
    token: uuid(),
    userId: user.id,
    email: user.email,
    createdAt: new Date().toISOString()
  };

  updateData(state => {
    state.sessions.push(session);
    return state;
  });

  return { token: session.token, user: { id: user.id, email: user.email } };
}

export function signout(token) {
  updateData(state => {
    state.sessions = state.sessions.filter(session => session.token !== token);
    return state;
  });
}

export function getSession(token) {
  const session = readData().sessions.find(item => item.token === token);
  return session ? { userId: session.userId, email: session.email, createdAt: session.createdAt } : null;
}

import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const usersByEmail = new Map();
const sessionsByToken = new Map();

export async function signup(email, password) {
  if (usersByEmail.has(email)) throw new Error('EMAIL_EXISTS');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: uuid(), email, passwordHash, createdAt: new Date().toISOString() };
  usersByEmail.set(email, user);
  return { id: user.id, email: user.email };
}

export async function signin(email, password) {
  const user = usersByEmail.get(email);
  if (!user) throw new Error('INVALID_CREDENTIALS');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('INVALID_CREDENTIALS');
  const token = uuid();
  sessionsByToken.set(token, { userId: user.id, email: user.email, createdAt: new Date().toISOString() });
  return { token, user: { id: user.id, email: user.email } };
}

export function signout(token) {
  sessionsByToken.delete(token);
}

export function getSession(token) {
  return sessionsByToken.get(token) || null;
}

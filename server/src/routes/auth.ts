import { Hono } from 'hono';
import type { Env, User } from '../types';
import { hashPassword, verifyPassword, createToken } from '../services/auth';

export const authRoute = new Hono<{ Bindings: Env }>();

authRoute.post('/register', async (c) => {
  try {
    const { email, password, displayName } = await c.req.json<{
      email: string;
      password: string;
      displayName?: string;
    }>();

    if (!email || !password) {
      return c.json({ error: 'email and password are required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    const existing = await c.env.INTERNAL_DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    )
      .bind(email)
      .first();

    if (existing) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    await c.env.INTERNAL_DB.prepare(
      'INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)'
    )
      .bind(id, email, passwordHash, displayName || null)
      .run();

    const token = await createToken({ id, email }, c.env.JWT_SECRET);

    return c.json({ token, user: { id, email, displayName: displayName || null } }, 201);
  } catch (error) {
    console.error('Error registering user:', error);
    return c.json({ error: 'Failed to register user' }, 500);
  }
});

authRoute.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json<{
      email: string;
      password: string;
    }>();

    if (!email || !password) {
      return c.json({ error: 'email and password are required' }, 400);
    }

    const user = await c.env.INTERNAL_DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    )
      .bind(email)
      .first<User>();

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const token = await createToken({ id: user.id, email: user.email }, c.env.JWT_SECRET);

    return c.json({
      token,
      user: { id: user.id, email: user.email, displayName: user.display_name },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return c.json({ error: 'Failed to login' }, 500);
  }
});

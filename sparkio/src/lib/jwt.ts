import jwt from 'jsonwebtoken';

// Support both new format (JWT_ACCESS_TOKEN_SECRET) and legacy format (JWT_SECRET)
const ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback-secret-change-in-production';

if (!process.env.JWT_ACCESS_TOKEN_SECRET && !process.env.JWT_SECRET) {
  // In production, you should fail fast during startup if these are missing.
  console.warn('JWT secrets are not set. Using fallback secret. This is insecure for production!');
}

export interface JwtAccessPayload {
  sub: string; // user id
  role: string;
  type: 'access';
}

export interface JwtRefreshPayload {
  sub: string; // user id
  sid: string; // session id
  type: 'refresh';
}

export function signAccessToken(payload: Omit<JwtAccessPayload, 'type'>): string {
  const ttlSeconds = Number(process.env.JWT_ACCESS_TOKEN_TTL_SECONDS ?? 900);
  return jwt.sign({ ...payload, type: 'access' as const }, ACCESS_SECRET, {
    expiresIn: ttlSeconds,
  });
}

export function signRefreshToken(payload: Omit<JwtRefreshPayload, 'type'>): string {
  const ttlSeconds = Number(process.env.JWT_REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 30);
  return jwt.sign({ ...payload, type: 'refresh' as const }, REFRESH_SECRET, {
    expiresIn: ttlSeconds,
  });
}

export function verifyAccessToken(token: string): JwtAccessPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtAccessPayload;
}

export function verifyRefreshToken(token: string): JwtRefreshPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtRefreshPayload;
}



import { SignJWT, jwtVerify } from 'jose';

// Support both new format (JWT_ACCESS_TOKEN_SECRET) and legacy format (JWT_SECRET)
const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

if (!process.env.JWT_ACCESS_TOKEN_SECRET && !process.env.JWT_SECRET) {
  // In production, you should fail fast during startup if these are missing.
  console.warn('JWT secrets are not set. Using fallback secret. This is insecure for production!');
}

export interface JwtAccessPayload {
  sub: string; // user id
  role: string;
  type: 'access';
  [key: string]: any; // Allow extra claims
}

export interface JwtRefreshPayload {
  sub: string; // user id
  sid: string; // session id
  type: 'refresh';
  [key: string]: any; // Allow extra claims
}

export async function signAccessToken(payload: Omit<JwtAccessPayload, 'type'>): Promise<string> {
  const ttlSeconds = Number(process.env.JWT_ACCESS_TOKEN_TTL_SECONDS ?? 900);
  return new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: Omit<JwtRefreshPayload, 'type'>): Promise<string> {
  const ttlSeconds = Number(process.env.JWT_REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 30);
  return new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<JwtAccessPayload> {
  const { payload } = await jwtVerify(token, ACCESS_SECRET);
  return payload as unknown as JwtAccessPayload;
}

export async function verifyRefreshToken(token: string): Promise<JwtRefreshPayload> {
  const { payload } = await jwtVerify(token, REFRESH_SECRET);
  return payload as unknown as JwtRefreshPayload;
}



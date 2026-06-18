import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

function getSecret(): string {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

export function signToken(payload: JwtPayload): string {
  const expiresIn = (process.env['JWT_EXPIRES_IN'] ?? '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign(payload, getSecret(), { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload;
}

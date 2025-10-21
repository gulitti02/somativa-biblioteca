import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-changeme';

export type JwtUser = { sub: string; role?: string; email?: string };

export function getTokenFromHeader(request: Request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return null;
  return token;
}

export function verifyToken(request: Request): JwtUser | null {
  try {
    const token = getTokenFromHeader(request);
    if (!token) return null;
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return { sub: payload.sub, role: payload.role, email: payload.email };
  } catch (err) {
    return null;
  }
}

export function requireAuth(request: Request) {
  const user = verifyToken(request);
  if (!user) throw new Error('Unauthorized');
  return user;
}

export function requireAdmin(request: Request) {
  const user = verifyToken(request);
  if (!user) throw new Error('Unauthorized');
  if (user.role !== 'admin') throw new Error('Forbidden');
  return user;
}

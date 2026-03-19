import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
}

export function authenticate(request: NextRequest): { user: AuthUser | null; error?: string; status?: number } {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return { user: null, error: 'Authentication required', status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as AuthUser;
    return { user: decoded };
  } catch (error) {
    return { user: null, error: 'Invalid or expired token', status: 401 };
  }
}

export function requireAdmin(user: AuthUser): { error?: string; status?: number } {
  if (user.role !== 'ADMIN') {
    return { error: 'Admin access required', status: 403 };
  }
  return {};
}
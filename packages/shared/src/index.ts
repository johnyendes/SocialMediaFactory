// Shared types and utilities

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'USER';
  organizationId?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

export interface AgentRequest {
  type: 'courseforge' | 'blog' | 'social' | 'tech' | 'app' | 'bot' | 'content';
  prompt: string;
  parameters?: Record<string, any>;
}

export interface AgentResponse {
  success: boolean;
  result?: any;
  error?: string;
}

export interface FactoryResult {
  type: string;
  content: string;
  metadata?: Record<string, any>;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    ME: `${API_BASE_URL}/api/auth/me`,
  },
  AGENT: {
    EXECUTE: `${API_BASE_URL}/api/agent/execute`,
    COURSEFORGE: `${API_BASE_URL}/api/agent/courseforge`,
    BLOG: `${API_BASE_URL}/api/agent/blog`,
    SOCIAL: `${API_BASE_URL}/api/agent/social`,
    TECH: `${API_BASE_URL}/api/agent/tech`,
  },
  ADMIN: {
    USERS: `${API_BASE_URL}/api/admin/users`,
    ORGANIZATIONS: `${API_BASE_URL}/api/admin/organizations`,
    SECURITY: `${API_BASE_URL}/api/admin/security`,
  },
};
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface GeneratedPage {
  id: string;
  title: string;
  prompt: string;
  html: string;
  css: string;
  js: string;
  createdAt: number;
  publishedId?: string;
  userId?: string;
}

export type Tab = 'generator' | 'history';

export interface GenerationResponse {
  html: string;
  css: string;
  js: string;
  title: string;
}
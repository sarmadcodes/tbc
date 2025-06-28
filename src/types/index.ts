export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  featured: boolean;
  readTime: number;
  slug: string;
  views?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  social: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}
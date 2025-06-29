import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  Clock, 
  Tag, 
  Search, 
  Filter,
  Eye,
  ChevronRight
} from 'lucide-react';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Article } from '../types';

const Articles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      // First, try to get all published articles without ordering (in case createdAt field is missing)
      let articlesQuery;
      
      try {
        // Try with ordering first
        articlesQuery = query(
          collection(db, 'articles'),
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        );
      } catch (error) {
        console.log('Ordering failed, fetching without order:', error);
        // If ordering fails, just get published articles
        articlesQuery = query(
          collection(db, 'articles'),
          where('published', '==', true)
        );
      }
      
      const snapshot = await getDocs(articlesQuery);
      
      console.log('Firestore snapshot size:', snapshot.size); // Debug log
      
      const articlesData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw document data:', doc.id, data); // Debug log
        
        return {
          id: doc.id,
          ...data,
          // Handle Firestore Timestamp conversion
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
          // Handle empty or missing category - use 'Uncategorized' for empty strings
          category: (data.category && data.category.trim() !== '') ? data.category : 'Uncategorized',
          // Ensure required fields have defaults
          author: data.author || 'Unknown Author',
          excerpt: data.excerpt || '',
          readTime: data.readTime || 1,
          imageUrl: data.imageUrl || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          views: data.views || 0,
          title: data.title || 'Untitled',
          content: data.content || '',
          slug: data.slug || doc.id,
          published: data.published || false,
          featured: data.featured || false
        };
      }) as Article[];
      
      // Sort articles by creation date (most recent first)
      articlesData.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('Processed articles:', articlesData); // Debug log
      setArticles(articlesData);
      
      // Extract unique categories (filter out empty ones and 'Uncategorized')
      const uniqueCategories = [...new Set(
        articlesData
          .map(article => article.category)
          .filter(cat => cat && cat.trim() !== '' && cat !== 'Uncategorized')
      )];
      
      // Add 'Uncategorized' if there are any uncategorized articles
      const hasUncategorized = articlesData.some(article => article.category === 'Uncategorized');
      if (hasUncategorized) {
        uniqueCategories.push('Uncategorized');
      }
      
      console.log('Categories found:', uniqueCategories); // Debug log
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Error fetching articles:', error);
      
      // Fallback: try to get all documents from articles collection
      try {
        console.log('Trying fallback fetch...');
        const fallbackQuery = collection(db, 'articles');
        const fallbackSnapshot = await getDocs(fallbackQuery);
        
        console.log('Fallback snapshot size:', fallbackSnapshot.size);
        
        const fallbackData = fallbackSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Fallback document:', doc.id, data);
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
            category: (data.category && data.category.trim() !== '') ? data.category : 'Uncategorized',
            author: data.author || 'Unknown Author',
            excerpt: data.excerpt || '',
            readTime: data.readTime || 1,
            imageUrl: data.imageUrl || '',
            tags: Array.isArray(data.tags) ? data.tags : [],
            views: data.views || 0,
            title: data.title || 'Untitled',
            content: data.content || '',
            slug: data.slug || doc.id,
            published: data.published !== false, // Default to true if not specified
            featured: data.featured || false
          };
        }).filter(article => article.published); // Filter published articles
        
        setArticles(fallbackData);
        
        const fallbackCategories = [...new Set(
          fallbackData
            .map(article => article.category)
            .filter(cat => cat && cat.trim() !== '')
        )];
        setCategories(fallbackCategories);
        
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(article =>
        (article.title && article.title.toLowerCase().includes(searchLower)) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchLower)) ||
        (article.category && article.category.toLowerCase().includes(searchLower)) ||
        (article.author && article.author.toLowerCase().includes(searchLower)) ||
        (article.content && article.content.toLowerCase().includes(searchLower))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    console.log('Filtered articles:', filtered); // Debug log
    setFilteredArticles(filtered);
  };

  const ArticleCard = ({ article }: { article: Article }) => (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <Link to={`/articles/${article.slug || article.id}`} className="block">
        {/* Article Image */}
        {article.imageUrl ? (
          <div className="aspect-video overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
            <Eye size={32} className="text-gold-600" />
          </div>
        )}

        {/* Article Content */}
        <div className="p-6">
          {/* Category Badge */}
          <div className="mb-3">
            <span className="inline-block bg-gold-100 text-gold-800 px-3 py-1 rounded-full text-xs font-medium">
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-3 line-clamp-2 hover:text-gold-700 transition-colors">
            {article.title}
          </h2>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {article.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User size={12} />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={12} />
                <span>
                  {article.createdAt instanceof Date 
                    ? article.createdAt.toLocaleDateString()
                    : new Date(article.createdAt).toLocaleDateString()
                  }
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{article.readTime} min</span>
              </div>
            </div>
            
            {/* Read More Arrow */}
            <ChevronRight size={16} className="text-gold-600" />
          </div>
        </div>
      </Link>
    </motion.article>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Loading Skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mb-8"></div>
            
            {/* Filters Skeleton */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-10 bg-gray-300 rounded-full flex-1"></div>
                <div className="h-10 bg-gray-300 rounded-full w-40"></div>
              </div>
            </div>

            {/* Articles Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="aspect-video bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded w-20 mb-3"></div>
                    <div className="h-6 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-300 rounded w-32"></div>
                      <div className="h-4 bg-gray-300 rounded w-4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Articles - The Broken Column</title>
        <meta name="description" content="Explore our collection of insightful articles on politics, society, and current affairs." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4">
              Articles
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover insightful perspectives on politics, society, and the issues that shape our world
            </p>
          </motion.div>



          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent min-w-[150px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <p className="text-gray-600">
              {filteredArticles.length === 0 
                ? 'No articles found'
                : `${filteredArticles.length} article${filteredArticles.length === 1 ? '' : 's'} found`
              }
            </p>
          </motion.div>

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No articles have been published yet. Check back soon!'
                }
              </p>
              {/* Show raw data for debugging */}
              <details className="text-left bg-gray-100 p-4 rounded">
                <summary className="cursor-pointer">Debug: Show raw articles data</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(articles, null, 2)}
                </pre>
              </details>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Articles;

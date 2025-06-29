import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, Tag, ArrowLeft, Share2, Heart, Eye } from 'lucide-react';
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Article } from '../types';
import toast from 'react-hot-toast';

const ArticleDetail: React.FC = () => {
  const { id } = useParams(); // This could be either slug or document ID
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchArticle = useCallback(async (identifier: string) => {
    try {
      let articleData = null;
      let docId = identifier;

      // First, try to fetch by document ID directly
      try {
        const docRef = doc(db, 'articles', identifier);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          articleData = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          } as Article;
          docId = docSnap.id;
        }
      } catch (error) {
        console.log('Direct ID fetch failed, trying slug lookup...');
      }

      // If direct ID fetch fails, try to find by slug
      if (!articleData) {
        try {
          const articlesQuery = query(
            collection(db, 'articles'),
            where('slug', '==', identifier),
            where('published', '==', true)
          );
          
          const querySnapshot = await getDocs(articlesQuery);
          
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            articleData = {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
            } as Article;
            docId = doc.id;
          }
        } catch (error) {
          console.error('Slug lookup failed:', error);
        }
      }

      if (articleData) {
        setArticle(articleData);
        
        // Increment view count using the actual document ID
        try {
          const docRef = doc(db, 'articles', docId);
          await updateDoc(docRef, {
            views: increment(1)
          });
        } catch (error) {
          console.error('Error updating view count:', error);
        }
      } else {
        console.error('Article not found');
        setArticle(null);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchArticle(id);
    }
  }, [id, fetchArticle]);

  const handleShare = useCallback(async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  }, [article]);

  const handleLike = useCallback(() => {
    setLiked(prev => !prev);
    toast.success(liked ? 'Removed from favorites' : 'Added to favorites');
  }, [liked]);

  // Optimized loading state with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Skeleton Loading */}
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-32 mb-8"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-12 bg-gray-300 rounded w-full mb-6"></div>
            <div className="flex space-x-4 mb-8">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
            <div className="h-64 bg-gray-300 rounded-xl mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or may have been removed.</p>
            <Link
              to="/articles"
              className="inline-flex items-center space-x-2 bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
            >
              <ArrowLeft size={20} />
              <span>Back to Articles</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} - The Broken Column</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={article.imageUrl} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-20">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              to="/articles"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Articles</span>
            </Link>
          </motion.div>

          {/* Article Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block bg-gold-100 text-gold-800 px-3 py-1 rounded-full text-sm font-medium">
                {article.category || 'Uncategorized'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <User size={18} />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={18} />
                <span>{article.createdAt?.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={18} />
                <span>{article.readTime} min read</span>
              </div>
              {article.views && (
                <div className="flex items-center space-x-2">
                  <Eye size={18} />
                  <span>{article.views} views</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 mb-8">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                  liked
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <Heart size={18} className={liked ? 'fill-current' : ''} />
                <span>{liked ? 'Liked' : 'Like'}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-300 text-gray-600 hover:border-gray-400 bg-white transition-all duration-200"
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>
            </div>
          </motion.header>

          {/* Featured Image with Progressive Loading */}
          {article.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="relative">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl"></div>
                )}
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className={`w-full h-64 md:h-96 object-cover rounded-xl shadow-lg transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                  loading="lazy"
                />
              </div>
            </motion.div>
          )}

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
          >
            <div className="prose prose-lg max-w-none">
              {article.content && article.content.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                )
              ))}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Tag size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Back to Articles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <Link
              to="/articles"
              className="inline-flex items-center space-x-2 bg-gold-500 hover:bg-gold-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft size={20} />
              <span>More Articles</span>
            </Link>
          </motion.div>
        </article>
      </div>
    </>
  );
};

export default ArticleDetail;

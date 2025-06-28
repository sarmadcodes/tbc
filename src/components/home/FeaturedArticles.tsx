import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Article } from '../../types';

const FeaturedArticles: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedArticles();
  }, []);

  const fetchFeaturedArticles = async () => {
    try {
      const articlesQuery = query(
        collection(db, 'articles'),
        where('published', '==', true),
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      
      const snapshot = await getDocs(articlesQuery);
      const articles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Article[];
      
      setFeaturedArticles(articles);
    } catch (error) {
      console.error('Error fetching featured articles:', error);
      // Fallback to mock data if Firebase fails
      setFeaturedArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="space-y-12"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900">
              Featured Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Carefully curated articles that showcase the extraordinary in our everyday world
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            </div>
          )}

          {/* Featured Articles Grid */}
          {!loading && (
            <>
              {featuredArticles.length > 0 ? (
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredArticles.map((article) => (
                    <motion.article
                      key={article.id}
                      className="group cursor-pointer"
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link to={`/articles/${article.id}`} className="block">
                        <div className="relative overflow-hidden rounded-xl mb-4">
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">No Image</span>
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                            <span className="bg-gold-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              {article.category}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-xl font-serif font-semibold text-gray-900 group-hover:text-gold-600 transition-colors leading-tight">
                            {article.title}
                          </h3>
                          
                          <p className="text-gray-600 leading-relaxed line-clamp-3">
                            {article.excerpt}
                          </p>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <User size={14} />
                                <span>{article.author}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock size={14} />
                                <span>{article.readTime} min</span>
                              </div>
                            </div>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </motion.div>
              ) : (
                <motion.div variants={itemVariants} className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowRight className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Featured Articles Yet</h3>
                  <p className="text-gray-500">Featured articles will appear here once they're published.</p>
                </motion.div>
              )}
            </>
          )}

          {/* View All Button */}
          <motion.div variants={itemVariants} className="text-center pt-8">
            <Link
              to="/articles"
              className="inline-flex items-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <span>View All Articles</span>
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedArticles;
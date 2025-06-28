import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Filter,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { collection, query, getDocs, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Article } from '../../types';
import toast from 'react-hot-toast';

const ArticleManager: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, statusFilter]);

  const fetchArticles = async () => {
    try {
      const articlesQuery = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(articlesQuery);
      const articlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Article[];
      
      setArticles(articlesData);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(article =>
        statusFilter === 'published' ? article.published : !article.published
      );
    }

    setFilteredArticles(filtered);
  };

  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await deleteDoc(doc(db, 'articles', articleId));
      setArticles(articles.filter(article => article.id !== articleId));
      toast.success('Article deleted successfully');
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    }
  };

  const togglePublishStatus = async (article: Article) => {
    try {
      const articleRef = doc(db, 'articles', article.id);
      await updateDoc(articleRef, {
        published: !article.published,
        updatedAt: new Date()
      });

      setArticles(articles.map(a => 
        a.id === article.id 
          ? { ...a, published: !a.published, updatedAt: new Date() }
          : a
      ));

      toast.success(`Article ${!article.published ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Error updating article status:', error);
      toast.error('Failed to update article status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-2">Manage your published content</p>
        </div>
        <Link
          to="/admin/articles/new"
          className="inline-flex items-center space-x-2 bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
        >
          <Plus size={20} />
          <span>New Article</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
              className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first article'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link
                to="/admin/articles/new"
                className="inline-flex items-center space-x-2 bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
              >
                <Plus size={20} />
                <span>Create Article</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredArticles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  {/* Article Image */}
                  <div className="flex-shrink-0">
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Eye size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Article Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Tag size={14} />
                            <span>{article.category}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User size={14} />
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{article.createdAt?.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          article.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 mt-4">
                      <Link
                        to={`/admin/articles/edit/${article.id}`}
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </Link>
                      
                      <button
                        onClick={() => togglePublishStatus(article)}
                        className={`inline-flex items-center space-x-1 text-sm font-medium ${
                          article.published 
                            ? 'text-yellow-600 hover:text-yellow-800' 
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {article.published ? <EyeOff size={16} /> : <Eye size={16} />}
                        <span>{article.published ? 'Unpublish' : 'Publish'}</span>
                      </button>
                      
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="inline-flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ArticleManager;
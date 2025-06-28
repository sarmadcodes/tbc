import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Eye, Upload, X, ArrowLeft } from 'lucide-react';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { Article } from '../../types';
import toast from 'react-hot-toast';

const ArticleEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    author: '',
    published: false,
    featured: false,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const categories = [
    'World Events',
    'Culture & Arts',
    'Science & Discovery',
    'Technology',
    'Human Interest',
    'Photography',
    'Politics',
    'Environment',
    'Health',
    'Business'
  ];

  useEffect(() => {
    if (isEditing && id) {
      fetchArticle(id);
    }
  }, [id, isEditing]);

  const fetchArticle = async (articleId: string) => {
    try {
      const docRef = doc(db, 'articles', articleId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as Omit<Article, 'id'>;
        setFormData({
          title: data.title || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          category: data.category || '',
          tags: data.tags?.join(', ') || '',
          author: data.author || '',
          published: data.published || false,
          featured: data.featured || false,
        });
        
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
        }
      } else {
        toast.error('Article not found');
        navigate('/admin/articles');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Failed to fetch article');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      const imageRef = ref(storage, `articles/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = imagePreview;
      
      // Upload new image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const articleData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || formData.content.substring(0, 200) + '...',
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        author: formData.author.trim() || 'Admin',
        imageUrl: imageUrl || '',
        published: publish || formData.published,
        featured: formData.featured,
        readTime: Math.ceil(formData.content.split(' ').length / 200), // Estimate reading time
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        updatedAt: serverTimestamp(),
      };

      if (isEditing && id) {
        // Update existing article
        const docRef = doc(db, 'articles', id);
        await updateDoc(docRef, articleData);
        toast.success('Article updated successfully');
      } else {
        // Create new article
        await addDoc(collection(db, 'articles'), {
          ...articleData,
          createdAt: serverTimestamp(),
          views: 0,
        });
        toast.success('Article created successfully');
      }

      navigate('/admin/articles');
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/articles')}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              {isEditing ? 'Edit Article' : 'New Article'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update your article content' : 'Create a new article for your readers'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Article Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter article title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-lg"
                required
              />
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Article Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write your article content here..."
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Article Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Brief description of the article (optional - will be auto-generated if empty)"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Featured Image
              </label>
              
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="image" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload an image
                      </span>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Article Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Article Details</h3>
              
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author */}
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Author name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Separate tags with commas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-gold-600 focus:ring-gold-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Article</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-gold-600 focus:ring-gold-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Published</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center space-x-2 bg-gold-500 hover:bg-gold-600 text-white px-4 py-3 rounded-full font-semibold transition-all duration-300 disabled:opacity-50"
              >
                <Save size={20} />
                <span>{loading ? 'Saving...' : 'Save Draft'}</span>
              </button>
              
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="w-full inline-flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full font-semibold transition-all duration-300 disabled:opacity-50"
              >
                <Eye size={20} />
                <span>{loading ? 'Publishing...' : 'Save & Publish'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default ArticleEditor;
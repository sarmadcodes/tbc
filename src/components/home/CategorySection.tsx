import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Globe, Palette, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategorySection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const categories = [
    {
      name: 'World Events',
      slug: 'world',
      description: 'Global perspectives on current affairs',
      icon: Globe,
      color: 'from-blue-500 to-blue-600',
      count: 24
    },
    {
      name: 'Culture & Arts',
      slug: 'culture',
      description: 'Celebrating human creativity and tradition',
      icon: Palette,
      color: 'from-purple-500 to-purple-600',
      count: 18
    },
    {
      name: 'Technology',
      slug: 'technology',
      description: 'Innovation changing our world',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      count: 21
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section className="py-20 bg-gray-50">
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
              Explore Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dive deep into the topics that matter most to you
            </p>
          </motion.div>

          {/* Categories Grid */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <motion.div
                  key={category.slug}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link 
                    to={`/articles?category=${category.slug}`}
                    className="block h-full"
                  >
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full group">
                      {/* Background Image/Pattern */}
                      <div className={`h-32 bg-gradient-to-br ${category.color} relative overflow-hidden`}>
                        <div className="absolute inset-0 opacity-20">
                          {category.slug === 'world' && (
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                          )}
                          {category.slug === 'culture' && (
                            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(255,255,255,0.2),transparent,rgba(255,255,255,0.2))] bg-[length:40px_40px]"></div>
                          )}
                          {category.slug === 'technology' && (
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:20px_20px]"></div>
                          )}
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className="text-xs text-white bg-black bg-opacity-20 px-2 py-1 rounded-full backdrop-blur-sm">
                            {category.count} articles
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                            <IconComponent className="text-white" size={24} />
                          </div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gold-600 transition-colors">
                          {category.name}
                        </h3>
                        
                        <p className="text-gray-600 leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CategorySection;

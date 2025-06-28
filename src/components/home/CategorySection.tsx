import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Globe, Palette, Microscope, TrendingUp, Heart, Camera } from 'lucide-react';
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
      name: 'Science & Discovery',
      slug: 'science',
      description: 'Breakthroughs that shape our future',
      icon: Microscope,
      color: 'from-green-500 to-green-600',
      count: 15
    },
    {
      name: 'Technology',
      slug: 'technology',
      description: 'Innovation changing our world',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      count: 21
    },
    {
      name: 'Human Interest',
      slug: 'human-interest',
      description: 'Stories that touch the heart',
      icon: Heart,
      color: 'from-pink-500 to-pink-600',
      count: 12
    },
    {
      name: 'Photography',
      slug: 'photography',
      description: 'Visual storytelling at its finest',
      icon: Camera,
      color: 'from-indigo-500 to-indigo-600',
      count: 9
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
                    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full group">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconComponent className="text-white" size={24} />
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {category.count} articles
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gold-600 transition-colors">
                        {category.name}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed">
                        {category.description}
                      </p>
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
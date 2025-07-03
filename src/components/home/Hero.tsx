import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const heroImage = "https://visitlocaltravel.com/blog/wp-content/uploads/2024/07/Beautiful-Sunset-in-Siem-Reap.png";

  return (
    <section className="relative h-screen flex items-start justify-center pt-32 overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: "easeOut" }}
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Stories That
            <span className="block text-gold-400">Shape Our World</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Discover premium journalism and in-depth analysis of the most compelling stories from around the globe
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link
              to="/articles"
              className="group relative inline-flex items-center space-x-2 bg-gold-500 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              {/* Loading overlay that slides from left to right */}
              <div className="absolute inset-0 bg-gold-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              
              {/* Button content */}
              <span className="relative z-10">Explore Articles</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button className="group inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold backdrop-blur-sm transition-all duration-300">
              <Play size={20} />
              <span>Watch Story</span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

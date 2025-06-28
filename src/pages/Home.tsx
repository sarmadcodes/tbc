import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/home/Hero';
import FeaturedArticles from '../components/home/FeaturedArticles';
import CategorySection from '../components/home/CategorySection';
import Newsletter from '../components/home/Newsletter';

const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>The Broken Column - Premium News & Analysis</title>
        <meta name="description" content="Premium digital magazine featuring in-depth analysis of world events, culture, and extraordinary stories from around the globe." />
      </Helmet>

      <Hero />
      <FeaturedArticles />
      <CategorySection />
      <Newsletter />
    </>
  );
};

export default Home;
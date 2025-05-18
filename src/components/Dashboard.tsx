import React from 'react';
import DashboardHome from './dashboard/DashboardHome';
import Categories from './dashboard/Categories';
import Blogs from './dashboard/Blogs';
import HeroSection from './dashboard/HeroSection';
import Banner from './dashboard/Banner';
import LatestUpdates from './dashboard/LatestUpdates';
import Sponser from './dashboard/Sponser';

interface DashboardProps {
  activeSection: string;
}

function Dashboard({ activeSection }: DashboardProps) {
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'categories':
        return <Categories />;
      case 'blogs':
        return <Blogs />;
      case 'hero':
        return <HeroSection />;
      case 'banner':
        return <Banner />;
      case 'updates':
        return <LatestUpdates />;
      case 'sponser':
        return <Sponser />;
      default:
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 capitalize">
              {activeSection}
            </h2>
            <p>Content for {activeSection} will be implemented soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8 capitalize">
        {activeSection}
      </h1>
      {renderContent()}
    </div>
  );
}

export default Dashboard;
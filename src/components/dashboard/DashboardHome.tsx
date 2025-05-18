import React, { useState, useEffect } from 'react';

const Snowflake = ({ style }) => {
  return (
    <div 
      className="text-blue-100 absolute animate-float pointer-events-none"
      style={style}
    >
      ❄
    </div>
  );
};

function DashboardHome() {
  const [snowflakes, setSnowflakes] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    blogs: 0,
    updates: 0,
    banners: 0
  });
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Create snowflakes
  useEffect(() => {
    const flakes = [];
    for (let i = 0; i < 30; i++) {
      flakes.push({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        fontSize: `${Math.random() * 10 + 10}px`,
        opacity: Math.random() * 0.8 + 0.2,
        animationDuration: `${Math.random() * 10 + 10}s`
      });
    }
    setSnowflakes(flakes);
    
    // Animate in the stats cards
    setTimeout(() => setIsVisible(true), 300);
    
    // Fetch data from APIs
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch updates
        const updatesResponse = await fetch('http://localhost:3300/api/latest-updates');
        const updatesData = await updatesResponse.json();
        
        // Store the updates data for display
        if (updatesData.data && updatesData.data.length > 0) {
          setLatestUpdates(updatesData.data);
        }
        
        // Fetch banners
        const bannersResponse = await fetch('http://localhost:3300/api/get/hero-banners');
        const bannersData = await bannersResponse.json();
        
        // Fetch blogs
        const blogsResponse = await fetch('http://localhost:3300/api/get/blogs');
        const blogsData = await blogsResponse.json();
        
        // Update stats with counts
        setStats({
          updates: updatesData.data ? updatesData.data.length : 0,
          banners: bannersData.data ? bannersData.data.length : 0,
          blogs: blogsData.data ? blogsData.data.length : 0
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 p-8 overflow-hidden">
      {/* Snow Effect */}
      {snowflakes.map((flake) => (
        <Snowflake
          key={flake.id}
          style={{
            left: flake.left,
            animationDelay: flake.animationDelay,
            fontSize: flake.fontSize,
            opacity: flake.opacity,
            animationDuration: flake.animationDuration
          }}
        />
      ))}
      
      {/* Dashboard Title */}
      <h1 className="text-4xl font-bold text-white text-center mb-8 animate-pulse">
        Notes Market Dashboard
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-middle"></div>
        </div>
      ) : error ? (
        <div className="text-white text-center p-4 bg-red-500 bg-opacity-30 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {[
              { title: 'Total Blogs', value: stats.blogs, icon: '📝', color: 'from-purple-500 to-purple-600' },
              { title: 'Hero Banners', value: stats.banners, icon: '🖼️', color: 'from-blue-500 to-blue-600' },
              { title: 'Latest Updates', value: stats.updates, icon: '🔄', color: 'from-emerald-500 to-emerald-600' },
            ].map((stat, index) => (
              <div
                key={stat.title}
                className={`
                  bg-gradient-to-r ${stat.color} rounded-lg shadow-lg p-6 
                  transition-all duration-700 transform
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}
                  hover:scale-105 hover:shadow-xl
                `}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-opacity-80 text-sm font-medium">{stat.title}</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  </div>
                  <div className="text-4xl">{stat.icon}</div>
                </div>
                <div className="mt-4 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                  <div className="h-full bg-white animate-pulse rounded-full" style={{ width: `${Math.random() * 60 + 40}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Latest Updates Section with Real Data */}
          <div className={`
            mt-8 bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-sm
            transition-all duration-1000
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}
          `}>
            <h2 className="text-xl font-bold text-white mb-4">Latest Updates</h2>
            <div className="space-y-3">
              {latestUpdates.length > 0 ? (
                latestUpdates.map((update, i) => (
                  <div key={update._id} className="bg-white bg-opacity-5 p-4 rounded-lg hover:bg-opacity-10 transition">
                    <h3 className="font-medium text-white">{update.title}</h3>
                    <p className="text-sm text-blue-100">{update.date}</p>
                    <p className="text-xs text-blue-200 mt-1">{update.readTime}</p>
                  </div>
                ))
              ) : (
                <div className="text-white text-center p-4">
                  No updates available
                </div>
              )}
            </div>
          </div>
          
          {/* Banner Preview */}
          <div className={`
            mt-8 bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-sm
            transition-all duration-1200
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}
          `}>
            {/* <h2 className="text-xl font-bold text-white mb-4">Banner Preview</h2> */}
            {/* <div className="relative h-40 rounded-lg overflow-hidden bg-gray-800">
              <div className="absolute inset-0 flex items-center justify-center text-white text-opacity-50">
                Preview of most recent banner
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                <p className="text-white font-medium">Notes Market</p>
              </div>
            </div> */}
          </div>
        </>
      )}
      
      {/* Animated snowballs */}
      <div className="fixed bottom-8 right-8 animate-bounce">
        <div className="w-12 h-12 bg-white rounded-full opacity-80 shadow-lg"></div>
      </div>
      <div className="fixed bottom-12 right-20 animate-bounce" style={{ animationDelay: "0.5s" }}>
        <div className="w-8 h-8 bg-white rounded-full opacity-60 shadow-lg"></div>
      </div>
      <div className="fixed bottom-16 right-12 animate-bounce" style={{ animationDelay: "1s" }}>
        <div className="w-6 h-6 bg-white rounded-full opacity-40 shadow-lg"></div>
      </div>
    </div>
  );
}

// Add snowflake animation
const styles = document.createElement('style');
styles.textContent = `
  @keyframes float {
    0% {
      transform: translateY(-10vh) rotate(0deg);
    }
    100% {
      transform: translateY(100vh) rotate(360deg);
    }
  }
  
  .animate-float {
    animation-name: float;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
`;
document.head.appendChild(styles);

export default DashboardHome;
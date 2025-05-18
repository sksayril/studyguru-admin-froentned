import React, { useState, useEffect } from 'react';
import { Menu, X, LayoutDashboard, ListPlus, Image, Bell, LogOut,Sparkle } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (token: string) => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'categories', label: 'Categories', icon: ListPlus },
    { id: 'blogs', label: 'Blogs', icon: ListPlus },
    { id: 'hero', label: 'Hero Section', icon: Image },
    { id: 'banner', label: 'Quiz', icon: Image },
    { id: 'updates', label: 'Latest Updates', icon: Bell },
    { id: 'sponser', label: 'Sponser ', icon: Sparkle },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 ease-in-out`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-100">
          <h2 className={`font-bold text-xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent ${!isSidebarOpen && 'hidden'}`}>
            Admin Panel
          </h2>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="mt-8">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all ${
                activeSection === item.id ? 'bg-gradient-to-r from-blue-100 to-green-100' : ''
              }`}
            >
              <item.icon size={20} className="text-gray-600" />
              {isSidebarOpen && (
                <span className="ml-4 text-gray-700">{item.label}</span>
              )}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-4 hover:bg-red-50 text-red-600 mt-8 transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-4">Logout</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Dashboard activeSection={activeSection} />
      </div>
    </div>
  );
}

export default App;
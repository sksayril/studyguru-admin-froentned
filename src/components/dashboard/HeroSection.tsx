import React, { useState, useEffect, useRef } from 'react';
import { Upload, Monitor, Smartphone, X, Plus, Image, Trash2, Link } from 'lucide-react';

function HeroSection() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState(''); // Added URL state
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [desktopPreview, setDesktopPreview] = useState(null);
  const [mobilePreview, setMobilePreview] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const desktopDropRef = useRef(null);
  const mobileDropRef = useRef(null);

  // Fetch existing banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('http://localhost:3300/api/get/hero-banners');
        if (!response.ok) {
          throw new Error('Failed to fetch banners');
        }
        const data = await response.json();
        setBanners(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (!file.type.match('image.*')) {
        setError('Please upload an image file');
        return;
      }
      
      if (type === 'desktop') {
        setDesktopFile(file);
        setDesktopPreview(URL.createObjectURL(file));
      } else {
        setMobileFile(file);
        setMobilePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (type === 'desktop') {
        setDesktopFile(file);
        setDesktopPreview(URL.createObjectURL(file));
      } else {
        setMobileFile(file);
        setMobilePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !url || !desktopFile || !mobileFile) {
      setError('Please fill all fields');
      return;
    }

    // Basic URL validation
    if (!url.match(/^(http|https):\/\/[^ "]+$/)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('url', url); // Added URL to form data
    formData.append('desktop', desktopFile);
    formData.append('mobile', mobileFile);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3300/api/upload-hero-banner', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload banner');
      }

      const result = await response.json();
      
      // Refresh banners list
      const bannersResponse = await fetch('http://localhost:3300/api/get/hero-banners');
      const bannersData = await bannersResponse.json();
      setBanners(bannersData.data);
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      setSuccessMessage('Banner uploaded successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete banner function
  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch('http://localhost:3300/api/delete-hero-banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete banner');
      }

      // Refresh banners list
      const bannersResponse = await fetch('http://localhost:3300/api/get/hero-banners');
      const bannersData = await bannersResponse.json();
      setBanners(bannersData.data);
      
      setSuccessMessage('Banner deleted successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl(''); // Reset URL
    setDesktopFile(null);
    setMobileFile(null);
    setDesktopPreview(null);
    setMobilePreview(null);
    setError(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Hero Banner Management</h2>
        <button 
          onClick={openModal}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
        >
          <Plus size={18} />
          Add Banner
        </button>
      </div>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')}>
            <X size={18} />
          </button>
        </div>
      )}
      
      {/* Banners List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Existing Banners</h3>
        
        {loading && <p className="text-gray-600">Loading banners...</p>}
        
        {!loading && banners.length === 0 && (
          <div className="text-center py-8">
            <Image className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">No banners found</p>
            <button 
              onClick={openModal} 
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            >
              Add Your First Banner
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6">
          {banners.map((banner) => (
            <div key={banner._id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-lg font-medium">{banner.title}</h4>
                  <p className="text-sm text-gray-500">ID: {banner._id}</p>
                </div>
                <button 
                  onClick={() => handleDeleteBanner(banner._id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                  disabled={deleteLoading}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              {/* Display banner URL */}
              <div className="mb-3 bg-gray-100 p-2 rounded text-sm flex items-center text-blue-600">
                <Link size={14} className="mr-2" />
                <a href={banner.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                  {banner.url}
                </a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center mb-2">
                    <Monitor size={16} className="text-gray-600 mr-2" />
                    <h5 className="text-sm font-medium">Desktop View</h5>
                  </div>
                  <img 
                    src={banner.desktop} 
                    alt={`${banner.title} Desktop`} 
                    className="w-full h-auto border rounded"
                  />
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center mb-2">
                    <Smartphone size={16} className="text-gray-600 mr-2" />
                    <h5 className="text-sm font-medium">Mobile View</h5>
                  </div>
                  <img 
                    src={banner.mobile} 
                    alt={`${banner.title} Mobile`} 
                    className="w-full h-auto border rounded"
                  />
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                <p>Created: {new Date(banner.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-full overflow-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-bold">Add New Banner</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                  <span>{error}</span>
                  <button onClick={() => setError(null)}>
                    <X size={18} />
                  </button>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                    Banner Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter banner title"
                  />
                </div>
                
                {/* URL Field */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center" htmlFor="url">
                    <Link size={16} className="mr-2" />
                    Banner URL
                  </label>
                  <input
                    id="url"
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/page"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the URL where users will be directed when they click on this banner</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Desktop Banner Upload */}
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
                      <Monitor size={16} className="mr-2" />
                      Desktop Banner
                    </label>
                    <div 
                      ref={desktopDropRef}
                      className={`border-2 border-dashed rounded-lg p-4 text-center ${desktopPreview ? 'border-green-300' : 'border-gray-300 hover:border-blue-400'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'desktop')}
                    >
                      {desktopPreview ? (
                        <div className="relative">
                          <img 
                            src={desktopPreview} 
                            alt="Desktop Preview" 
                            className="max-h-40 mx-auto"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              setDesktopFile(null);
                              setDesktopPreview(null);
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="mx-auto text-gray-400 mb-2" size={36} />
                          <p className="text-sm text-gray-500 mb-2">Drag & drop an image here or</p>
                          <label className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded cursor-pointer">
                            Browse Files
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, 'desktop')}
                              accept="image/*"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Mobile Banner Upload */}
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
                      <Smartphone size={16} className="mr-2" />
                      Mobile Banner
                    </label>
                    <div 
                      ref={mobileDropRef}
                      className={`border-2 border-dashed rounded-lg p-4 text-center ${mobilePreview ? 'border-green-300' : 'border-gray-300 hover:border-blue-400'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'mobile')}
                    >
                      {mobilePreview ? (
                        <div className="relative">
                          <img 
                            src={mobilePreview} 
                            alt="Mobile Preview" 
                            className="max-h-40 mx-auto"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              setMobileFile(null);
                              setMobilePreview(null);
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="mx-auto text-gray-400 mb-2" size={36} />
                          <p className="text-sm text-gray-500 mb-2">Drag & drop an image here or</p>
                          <label className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded cursor-pointer">
                            Browse Files
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, 'mobile')}
                              accept="image/*"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>Loading...</>
                    ) : (
                      <>
                        <Upload size={18} />
                        Upload Banner
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeroSection;
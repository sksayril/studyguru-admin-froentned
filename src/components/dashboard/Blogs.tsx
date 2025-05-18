import React, { useState, useEffect, useRef, DragEvent } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI('AIzaSyD7wUqCzkLVS2ELkAXdxgtW_O5IIC3Ct7g');

// Helper function to generate content using Google's Generative AI
async function generateBlogContent(title: string, excerpt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    
    const prompt = `Write an educational article using the following details:
Title: ${title}
Summary/Excerpt:: ${excerpt}

Rules:
1. The content must always be educational and informative.
2. Do NOT include any sexual, violent, discriminatory, or otherwise harmful content.
3. The content must be appropriate for all audiences.
4. Use plain text only — no Markdown, HTML, bullet points, or special formatting.
5. Generate plain text content (not Markdown or HTML), approximately 200-300 words long.
6. Focus strictly on the topic implied by the title and subtitle.
7. Include relevant facts, real-world examples, and helpful insights.

Make sure the output is clear, engaging, and suitable for a general blog audience.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
}

function Blogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isDeletingBlog, setIsDeletingBlog] = useState(false);
  
  // File upload states
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  
  // Form state
  const [blogForm, setBlogForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    readTime: '',
  });
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    _id: '',
    title: '',
    excerpt: '',
    content: '',
    category: '',
    readTime: '',
  });

  // Refs for file inputs
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const editMainImageInputRef = useRef<HTMLInputElement>(null);
  const editGalleryInputRef = useRef<HTMLInputElement>(null);

  // Fetch blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Function to fetch blogs from API
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.adhyan.guru/api/get/blogs');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBlogs(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch blogs. Please try again later.');
      console.error('Error fetching blogs:', err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Function to handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBlogForm({ ...blogForm, [name]: value });
  };

  // Function to handle edit form input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  // Function to delete blog
  const deleteBlog = async () => {
    if (!selectedBlog || !selectedBlog._id) {
      setError('No blog selected for deletion.');
      return;
    }
  
    try {
      setIsDeletingBlog(true);
      
      // Log the data we're sending for debugging
      console.log("Sending delete request with ID:", selectedBlog._id);
      
      // Send the request with proper headers
      const response = await fetch('https://api.adhyan.guru/api/delete-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ id: selectedBlog._id }),
      });
      
      // For debugging - log the response
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Error response data:", errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Close the delete confirmation modal and the view modal
      setShowDeleteModal(false);
      setShowViewModal(false);
      setSelectedBlog(null);
      
      // Refresh the blogs list
      fetchBlogs();
      
    } catch (err) {
      setError('Failed to delete blog. Please try again.');
      console.error('Error deleting blog:', err instanceof Error ? err.message : String(err));
    } finally {
      setIsDeletingBlog(false);
    }
  };
  // Generate content using AI
  const handleGenerateContent = async () => {
    if (!blogForm.title || !blogForm.excerpt) {
      setError('Please fill in both title and excerpt before generating content.');
      return;
    }

    try {
      setIsGeneratingContent(true);
      setError(null);
      
      const generatedContent = await generateBlogContent(blogForm.title, blogForm.excerpt);
      
      setBlogForm({
        ...blogForm,
        content: generatedContent,
        readTime: `${Math.max(3, Math.ceil(generatedContent.length / 1000))} min read`, // Estimate read time based on content length
      });
      
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error('Error generating content:', err instanceof Error ? err.message : String(err));
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // Handle main image selection
  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle gallery images selection
  const handleGalleryImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setGalleryFiles([...galleryFiles, ...filesArray]);
      
      // Create preview URLs for the new files
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setGalleryPreviews([...galleryPreviews, ...newPreviews]);
    }
  };

  // Handle drag events for main image
  const handleDragMainEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMain(true);
  };

  const handleDragMainLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMain(false);
  };

  const handleDropMain = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMain(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle drag events for gallery images
  const handleDragGalleryEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(true);
  };

  const handleDragGalleryLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);
  };

  const handleDropGallery = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setGalleryFiles([...galleryFiles, ...filesArray]);
      
      // Create preview URLs for the new files
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setGalleryPreviews([...galleryPreviews, ...newPreviews]);
    }
  };

  // Remove a gallery image
  const removeGalleryImage = (index: number) => {
    const newFiles = [...galleryFiles];
    const newPreviews = [...galleryPreviews];
    
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setGalleryFiles(newFiles);
    setGalleryPreviews(newPreviews);
  };

  // Function to add a new blog
  const addBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mainImage) {
      setError('Please upload a main image for the blog.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create form data object
      const formData = new FormData();
      
      // Append blog text data
      Object.entries(blogForm).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Append main image
      formData.append('image', mainImage);
      
      // Append gallery images
      galleryFiles.forEach((file) => {
        formData.append('gallery', file);
      });
      
      // Send the data to the server
      const response = await fetch('https://api.adhyan.guru/api/upload-blog', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Reset form state
      setBlogForm({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        readTime: '',
      });
      setMainImage(null);
      setMainImagePreview('');
      setGalleryFiles([]);
      setGalleryPreviews([]);
      setShowAddModal(false);
      
      // Fetch updated blogs
      fetchBlogs();
      
    } catch (err) {
      setError('Failed to add blog. Please try again.');
      console.error('Error adding blog:', err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Function to view blog details
  const viewBlogDetails = (blog: any) => {
    setSelectedBlog(blog);
    setShowViewModal(true);
  };

  // Function to edit blog
  const openEditBlog = (blog: any) => {
    setShowViewModal(false);
    setEditForm({
      _id: blog._id,
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      readTime: blog.readTime,
    });
    setShowEditModal(true);
  };

  // Function to update a blog
  const updateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create form data object
      const formData = new FormData();
      
      // Append blog text data
      Object.entries(editForm).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Send the data to the server
      const response = await fetch('https://api.adhyan.guru/api/update-blog', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setShowEditModal(false);
      
      // Fetch updated blogs
      fetchBlogs();
      
    } catch (err) {
      setError('Failed to update blog. Please try again.');
      console.error('Error updating blog:', err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Format content by replacing \n with line breaks
  const formatContent = (content: string) => {
    return content.split('\\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      galleryPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [mainImagePreview, galleryPreviews]);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Blogs</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Add New Blog
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Blogs Listing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && !blogs.length ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">Loading blogs...</p>
            </div>
          ) : blogs.length > 0 ? (
            blogs.map((blog) => (
              <div 
                key={blog._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                onClick={() => viewBlogDetails(blog)}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/api/placeholder/400/300';
                    }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <span>{blog.category}</span>
                    <span className="mx-1">•</span>
                    <span>{blog.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 line-clamp-2">{blog.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{blog.excerpt}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No blogs found. Add your first blog by clicking the "Add New Blog" button.</p>
            </div>
          )}
        </div>

        {/* Add Blog Modal */}
        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Add New Blog</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={addBlog}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={blogForm.title}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                    <textarea
                      name="excerpt"
                      value={blogForm.excerpt}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={2}
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">Content</label>
                      {(blogForm.title && blogForm.excerpt) && (
                        <button
                          type="button"
                          onClick={handleGenerateContent}
                          disabled={isGeneratingContent}
                          className="text-sm px-3 py-1 rounded bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingContent ? 'Generating...' : 'Generate with AI'}
                        </button>
                      )}
                    </div>
                    <textarea
                      name="content"
                      value={blogForm.content}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={6}
                      required
                    />
                    {isGeneratingContent && (
                      <div className="mt-2 text-sm text-blue-600">
                        Generating content using AI based on your title and excerpt...
                      </div>
                    )}
                  </div>

                  {/* Main Image Upload with Drag & Drop */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Main Image
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center ${
                        isDraggingMain ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      onDragEnter={handleDragMainEnter}
                      onDragOver={handleDragMainEnter}
                      onDragLeave={handleDragMainLeave}
                      onDrop={handleDropMain}
                      onClick={() => mainImageInputRef.current?.click()}
                    >
                      {mainImagePreview ? (
                        <div className="relative">
                          <img 
                            src={mainImagePreview} 
                            alt="Preview" 
                            className="mx-auto h-48 object-contain"
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMainImage(null);
                              setMainImagePreview('');
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="py-8">
                          <p className="text-gray-500">
                            Drag and drop image here, or click to select
                          </p>
                        </div>
                      )}
                      <input
                        ref={mainImageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleMainImageSelect}
                      />
                    </div>
                  </div>
                  
                  {/* Gallery Images Upload with Drag & Drop */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gallery Images
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center ${
                        isDraggingGallery ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      onDragEnter={handleDragGalleryEnter}
                      onDragOver={handleDragGalleryEnter}
                      onDragLeave={handleDragGalleryLeave}
                      onDrop={handleDropGallery}
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      {galleryPreviews.length > 0 ? (
                        <div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                            {galleryPreviews.map((preview, index) => (
                              <div key={index} className="relative">
                                <img 
                                  src={preview} 
                                  alt={`Gallery preview ${index + 1}`} 
                                  className="h-24 w-full object-cover rounded"
                                />
                                <button
                                  type="button"
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeGalleryImage(index);
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-gray-500 text-sm">
                            Drag and drop more images, or click to add more
                          </p>
                        </div>
                      ) : (
                        <div className="py-8">
                          <p className="text-gray-500">
                            Drag and drop gallery images here, or click to select
                          </p>
                        </div>
                      )}
                      <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleGalleryImagesSelect}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={blogForm.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label>
                    <input
                      type="text"
                      name="readTime"
                      value={blogForm.readTime}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g. 5 min read"
                      required
                    />
                  </div>

                  <div className="col-span-2 flex justify-end gap-4 mt-4">
                    <button
                      type="button"
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Blog'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Blog Modal */}
        {showViewModal && selectedBlog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedBlog.title}</h2>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <span>{selectedBlog.category}</span>
                <span className="mx-2">•</span>
                <span>{selectedBlog.date}</span>
                <span className="mx-2">•</span>
                <span>{selectedBlog.readTime}</span>
              </div>
              
              <div className="mb-6">
                <img 
                  src={selectedBlog.image} 
                  alt={selectedBlog.title} 
                  className="w-full h-64 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/api/placeholder/800/400';
                  }}
                />
              </div>
              
              <div className="prose max-w-none mb-6">
                {formatContent(selectedBlog.content)}
              </div>
              
              {selectedBlog.gallery && selectedBlog.gallery.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBlog.gallery.map((image: string, index: number) => (
                      <div key={index} className="h-48">
                        <img 
                          src={image} 
                          alt={`Gallery image ${index + 1}`} 
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/api/placeholder/400/300';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Blog
                </button>
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  onClick={() => openEditBlog(selectedBlog)}
                >
                  Edit Blog
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Blog Modal */}
{/* Edit Blog Modal */}
{showEditModal && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Blog</h2>
          <button 
            onClick={() => setShowEditModal(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={updateBlog}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea
                name="excerpt"
                value={editForm.excerpt}
                onChange={handleEditInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={2}
                required
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                name="content"
                value={editForm.content}
                onChange={handleEditInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={6}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={editForm.category}
                onChange={handleEditInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label>
              <input
                type="text"
                name="readTime"
                value={editForm.readTime}
                onChange={handleEditInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g. 5 min read"
                required
              />
            </div>

            <div className="col-span-2 flex justify-end gap-4 mt-4">
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Blog'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* Delete Confirmation Modal */}
  {showDeleteModal && selectedBlog && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
        
        <p className="mb-6">Are you sure you want to delete "{selectedBlog.title}"? This action cannot be undone.</p>
        
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            onClick={deleteBlog}
            disabled={isDeletingBlog}
          >
            {isDeletingBlog ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )}
</div>
</div>
);
}

export default Blogs;
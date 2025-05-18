import React, { useState, useEffect } from 'react';

function Sponsor() {
  // State for form fields
  const [name, setName] = useState('');
  const [contextColor, setContextColor] = useState('#3B82F6'); // Default blue color
  const [url, setUrl] = useState('');
  const [sponsors, setSponsors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSponsorId, setCurrentSponsorId] = useState(null);

  // Predefined colors
  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Gray', value: '#6B7280' },
  ];

  // Fetch existing sponsors on component mount
  useEffect(() => {
    fetchSponsors();
  }, []);

  // Function to fetch sponsors from API
  const fetchSponsors = async () => {
    try {
      const response = await fetch('https://api.adhyan.guru/api/getsponser');
      if (response.ok) {
        const data = await response.json();
        setSponsors(data);
        
        // If there's at least one sponsor, set form to edit mode and populate fields
        if (data.length > 0) {
          const sponsor = data[0];
          setName(sponsor.name || '');
          setContextColor(sponsor.contextColor || '#3B82F6');
          setUrl(sponsor.url || '');
          setCurrentSponsorId(sponsor._id);
          setIsEditMode(true);
        } else {
          resetForm();
          setIsEditMode(false);
          setCurrentSponsorId(null);
        }
      } else {
        console.error('Failed to fetch sponsors');
      }
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setName('');
    setContextColor('#3B82F6');
    setUrl('');
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim() || !url.trim()) {
      setMessage({ text: 'Please fill in all fields', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      let response;
      if (isEditMode) {
        // Update existing sponsor
        response = await fetch('https://api.adhyan.guru/api/update/sponser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: currentSponsorId,
            name,
            contextColor,
            url,
          }),
        });
      } else {
        // Create new sponsor
        // Only if there are no existing sponsors
        if (sponsors.length > 0) {
          setMessage({ text: 'Only one sponsor record is allowed. Please update the existing one.', type: 'error' });
          setIsSubmitting(false);
          return;
        }
        
        response = await fetch('https://api.adhyan.guru/api/addsponser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            contextColor,
            url,
          }),
        });
      }

      if (response.ok) {
        setMessage({ 
          text: isEditMode ? 'Sponsor updated successfully!' : 'Sponsor added successfully!', 
          type: 'success' 
        });
        
        // Refresh sponsor list
        fetchSponsors();
      } else {
        setMessage({ 
          text: isEditMode ? 'Failed to update sponsor. Please try again.' : 'Failed to add sponsor. Please try again.', 
          type: 'error' 
        });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred. Please try again later.', type: 'error' });
      console.error('Error with sponsor operation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to delete a sponsor
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sponsor?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('https://api.adhyan.guru/api/delete/sponser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: id
        }),
      });

      if (response.ok) {
        setMessage({ text: 'Sponsor deleted successfully!', type: 'success' });
        resetForm();
        setIsEditMode(false);
        setCurrentSponsorId(null);
        fetchSponsors();
      } else {
        setMessage({ text: 'Failed to delete sponsor. Please try again.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred. Please try again later.', type: 'error' });
      console.error('Error deleting sponsor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{isEditMode ? 'Update Sponsor' : 'Add New Sponsor'}</h2>
      
      {/* Form with validation */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6 mb-8">
        {message.text && (
          <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Sponsor Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter sponsor name"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">
            Website URL
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="https://example.com"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Brand Color
          </label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setContextColor(color.value)}
                className={`w-10 h-10 rounded-full border-2 ${contextColor === color.value ? 'border-black' : 'border-gray-200'}`}
                style={{ backgroundColor: color.value }}
                title={color.name}
                aria-label={`Select ${color.name} color`}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center">
            <span className="text-sm mr-2">Custom color:</span>
            <input
              type="color"
              value={contextColor}
              onChange={(e) => setContextColor(e.target.value)}
              className="h-8 w-12 cursor-pointer"
            />
            <span className="ml-2 text-sm font-mono">{contextColor}</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Sponsor' : 'Add Sponsor')}
          </button>
          
          {isEditMode && (
            <button
              type="button"
              onClick={() => handleDelete(currentSponsorId)}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4"
            >
              Delete Sponsor
            </button>
          )}
        </div>
      </form>
      
      {/* Display existing sponsors */}
      <div>
        <h3 className="text-xl font-bold mb-4">Current Sponsor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.length > 0 ? (
            sponsors.map((sponsor, index) => (
              <div 
                key={index} 
                className="border rounded-lg shadow-sm overflow-hidden" 
                style={{ borderLeft: `4px solid ${sponsor.contextColor || '#3B82F6'}` }}
              >
                <div className="p-4">
                  <h4 className="font-bold text-lg">{sponsor.name}</h4>
                  <a 
                    href={sponsor.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm mt-1 block"
                  >
                    {sponsor.url}
                  </a>
                  <div className="mt-2 flex items-center">
                    <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: sponsor.contextColor }}></span>
                    <span className="text-xs font-mono">{sponsor.contextColor}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No sponsor added yet. Use the form above to add one.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sponsor;
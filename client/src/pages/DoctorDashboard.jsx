import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatisticsDashboard from '../components/StatisticsDashboard';
import petImage from '../assets/indir (2).jpeg';

const API_URL = 'http://localhost:5001';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteStatus, setDeleteStatus] = useState({ isDeleting: false, id: null, error: '' });
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [filterByType, setFilterByType] = useState('');
  const [filterByAllergy, setFilterByAllergy] = useState('');
  const [filterByVaccination, setFilterByVaccination] = useState('');
  
  // View mode
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [showStats, setShowStats] = useState(true);
  
  // Doctor messages
  const [pendingMessages, setPendingMessages] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // API'den gelen veriyi tabloya uyumlu hale getir
  const formatPetData = (pet) => {
    return {
      id: pet.id,
      petName: pet.name,
      petType: pet.type,
      petRace: pet.race,
      petGender: pet.gender,
      petBirthdate: pet.birthdate,
      petMicrochipNumber: pet.microchip_number,
      petOwnerName: pet.owner_name,
      petOwnerContactNumber: pet.owner_contact,
      completedVaccinations: pet.completed_vaccinations,
      scheduledVaccinations: pet.scheduled_vaccinations,
      allergy: pet.allergy
    };
  };

  // Get pet type color
  const getTypeColor = (type) => {
    const colors = {
      'Dog': 'from-blue-500 to-cyan-500',
      'Cat': 'from-orange-500 to-amber-500',
      'Bird': 'from-green-500 to-emerald-500',
      'Rabbit': 'from-purple-500 to-pink-500',
      'Hamster': 'from-yellow-500 to-orange-500',
      'Other': 'from-gray-500 to-slate-500'
    };
    return colors[type] || colors['Other'];
  };

  // Get type icon
  const getTypeIcon = (type) => {
    if (!type) return '🐾';
    const typeLower = type.toLowerCase();
    if (typeLower.includes('dog')) return '🐕';
    if (typeLower.includes('cat')) return '🐱';
    if (typeLower.includes('bird')) return '🐦';
    if (typeLower.includes('rabbit')) return '🐰';
    if (typeLower.includes('hamster')) return '🐹';
    return '🐾';
  };

  // Check vaccination status
  const getVaccinationStatus = (pet) => {
    const hasCompleted = pet.completedVaccinations && pet.completedVaccinations.trim() !== '';
    const hasScheduled = pet.scheduledVaccinations && pet.scheduledVaccinations.trim() !== '';
    
    if (hasCompleted && hasScheduled) return 'both';
    if (hasCompleted) return 'completed';
    if (hasScheduled) return 'scheduled';
    return 'none';
  };

  // Get vaccination badge
  const getVaccinationBadge = (pet) => {
    const status = getVaccinationStatus(pet);
    const badges = {
      'completed': { text: 'Vaccinated', color: 'bg-green-500/20 text-green-300 border-green-400' },
      'scheduled': { text: 'Scheduled', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400' },
      'both': { text: 'Up to Date', color: 'bg-blue-500/20 text-blue-300 border-blue-400' },
      'none': { text: 'Pending', color: 'bg-red-500/20 text-red-300 border-red-400' }
    };
    return badges[status] || badges['none'];
  };

  // API'den tüm evcil hayvanları çek
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        console.log("Fetching pets from API...");
        
        const response = await fetch(`${API_URL}/api/pets`);
        console.log("API response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Pets fetched successfully:", data);
          setPets(data);
          setFilteredPets(data);
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch pets:", errorData);
          setError('Failed to load pets. Please try again.');
        }
      } catch (error) {
        console.error("Error fetching pets:", error);
        setError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
    fetchPendingMessages();
    
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchPendingMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingMessages = async () => {
    try {
      setMessagesLoading(true);
      const response = await fetch(`${API_URL}/api/chat/doctor/pending`);
      if (response.ok) {
        const data = await response.json();
        setPendingMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching pending messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(`${API_URL}/api/chat/doctor/message/${messageId}/read`, {
        method: 'PUT'
      });
      if (response.ok) {
        fetchPendingMessages();
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Filter pets
  useEffect(() => {
    let filtered = pets;

    // Search text filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(pet => {
        const formatted = formatPetData(pet);
        return (
          formatted.petName?.toLowerCase().includes(searchLower) ||
          formatted.petType?.toLowerCase().includes(searchLower) ||
          formatted.petRace?.toLowerCase().includes(searchLower) ||
          formatted.petOwnerName?.toLowerCase().includes(searchLower) ||
          formatted.petMicrochipNumber?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Type filter
    if (filterByType) {
      filtered = filtered.filter(pet => {
        const formatted = formatPetData(pet);
        return formatted.petType === filterByType;
      });
    }

    // Allergy filter
    if (filterByAllergy) {
      filtered = filtered.filter(pet => {
        const formatted = formatPetData(pet);
        if (filterByAllergy === 'with') {
          return formatted.allergy && formatted.allergy.trim() !== '';
        } else if (filterByAllergy === 'without') {
          return !formatted.allergy || formatted.allergy.trim() === '';
        } else {
          return formatted.allergy?.toLowerCase().includes(filterByAllergy.toLowerCase());
        }
      });
    }

    // Vaccination filter
    if (filterByVaccination) {
      filtered = filtered.filter(pet => {
        const formatted = formatPetData(pet);
        return getVaccinationStatus(formatted) === filterByVaccination;
      });
    }

    setFilteredPets(filtered);
  }, [searchText, filterByType, filterByAllergy, filterByVaccination, pets]);

  // Get unique types for filter
  const uniqueTypes = [...new Set(pets.map(pet => formatPetData(pet).petType).filter(Boolean))];

  const handleDeletePet = async (id) => {
    if (!id || deleteStatus.isDeleting) return;
    
    try {
      console.log(`Attempting to delete pet with ID: ${id}`);
      setDeleteStatus({ isDeleting: true, id, error: '' });
      
      const response = await fetch(`${API_URL}/api/pets/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'same-origin'
      });
      
      console.log(`Delete response status: ${response.status}`);
      
      if (response.ok) {
        console.log(`Successfully deleted pet with ID: ${id}`);
        const updatedPets = pets.filter(pet => pet.id !== id);
        setPets(updatedPets);
        setFilteredPets(updatedPets);
        setDeleteStatus({ isDeleting: false, id: null, error: '' });
      } else {
        let errorMessage = 'Failed to delete pet. Please try again.';
        try {
          const errorData = await response.json();
          console.error("Server responded with error:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error("Could not parse error response as JSON:", jsonError);
        }
        
        setDeleteStatus({ 
          isDeleting: false, 
          id: null, 
          error: errorMessage
        });
      }
    } catch (error) {
      console.error("Network error deleting pet:", error);
      setDeleteStatus({ 
        isDeleting: false, 
        id: null, 
        error: `Network error: ${error.message}. Please check your connection.`
      });
    }
  };

  const handleAddPet = () => {
    navigate('/doctor/add-pet');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/');
  };

  const clearFilters = () => {
    setSearchText('');
    setFilterByType('');
    setFilterByAllergy('');
    setFilterByVaccination('');
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-white/30 shadow-md">
                  <img
                    src={petImage}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="/doctor/dashboard" 
                   className="text-white hover:text-white/80 inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-white">
                  HOME
                </a>
                <a href="/doctor/add-pet" 
                   className="text-white/70 hover:text-white hover:border-white/70 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                  ADD NEW PET
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowMessages(true)}
                className="relative text-white hover:text-white/80 p-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {pendingMessages.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingMessages.length}
                  </span>
                )}
              </button>
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <button onClick={handleLogout} className="ml-3 text-white hover:text-white/80">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          {/* Header with Toggle */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Pet Records</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className={`glass-button px-4 py-2 rounded-md text-white font-medium ${showStats ? 'bg-white/30' : ''}`}
              >
                {showStats ? '📊 Hide Stats' : '📊 Show Stats'}
              </button>
            <button
              onClick={handleAddPet}
              className="glass-button px-4 py-2 rounded-md text-white font-medium"
            >
              + Add New Pet
            </button>
          </div>
          </div>

          {/* Statistics Dashboard */}
          {showStats && (
            <div className="mb-6">
              <StatisticsDashboard />
            </div>
          )}

          {/* Delete Status Error */}
          {deleteStatus.error && (
            <div className="mb-4 p-3 glass-card text-red-300 bg-red-900/20 text-center rounded-md">
              <p>{deleteStatus.error}</p>
            </div>
          )}

          {/* Loading ve Error State */}
          {loading && (
            <div className="glass-card p-6 text-center text-white">
              <p>Loading pet records...</p>
            </div>
          )}
          
          {error && (
            <div className="glass-card p-6 text-center text-red-300 bg-red-900/20">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-white/10 rounded hover:bg-white/20"
              >
                Retry
              </button>
            </div>
          )}

          {/* Filters */}
          {!loading && !error && (
            <div className="glass-card p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search pets..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50"
                />

                {/* Type Filter */}
                <select
                  value={filterByType}
                  onChange={(e) => setFilterByType(e.target.value)}
                  className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white"
                >
                  <option value="">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type} className="bg-gray-800">{type}</option>
                  ))}
                </select>

                {/* Allergy Filter */}
                <select
                  value={filterByAllergy}
                  onChange={(e) => setFilterByAllergy(e.target.value)}
                  className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white"
                >
                  <option value="">All Allergies</option>
                  <option value="with" className="bg-gray-800">With Allergy</option>
                  <option value="without" className="bg-gray-800">Without Allergy</option>
                </select>

                {/* Vaccination Filter */}
                <select
                  value={filterByVaccination}
                  onChange={(e) => setFilterByVaccination(e.target.value)}
                  className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white"
                >
                  <option value="">All Status</option>
                  <option value="completed" className="bg-gray-800">Vaccinated</option>
                  <option value="scheduled" className="bg-gray-800">Scheduled</option>
                  <option value="both" className="bg-gray-800">Up to Date</option>
                  <option value="none" className="bg-gray-800">Pending</option>
                </select>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="glass-button px-4 py-2 rounded-lg text-white font-medium"
                >
                  Clear Filters
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex justify-between items-center mt-4">
                <p className="text-white/70 text-sm">
                  Showing {filteredPets.length} of {pets.length} pets
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      viewMode === 'table' 
                        ? 'bg-white/30 text-white' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    📋 Table
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      viewMode === 'card' 
                        ? 'bg-white/30 text-white' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    🎴 Cards
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pet Table/Cards */}
          {!loading && !error && (
            <div className="glass-card">
              {filteredPets.length === 0 ? (
                <div className="p-6 text-center text-white">
                  <p>{searchText || filterByType || filterByAllergy || filterByVaccination 
                    ? 'No pets found matching your filters.' 
                    : 'No pets found. Add your first pet to get started!'}</p>
                </div>
              ) : viewMode === 'table' ? (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider whitespace-nowrap">Pet Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider whitespace-nowrap">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider whitespace-nowrap">Race</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider whitespace-nowrap">Gender</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider whitespace-nowrap">Birthdate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider whitespace-nowrap">Microchip</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider whitespace-nowrap">Owner</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider whitespace-nowrap">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredPets.map((pet) => {
                        const formattedPet = formatPetData(pet);
                        const vaccinationBadge = getVaccinationBadge(formattedPet);
                        return (
                          <tr key={formattedPet.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{getTypeIcon(formattedPet.petType)}</span>
                              {formattedPet.petName}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{formattedPet.petType}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{formattedPet.petRace || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{formattedPet.petGender || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                              {formattedPet.petBirthdate ? new Date(formattedPet.petBirthdate).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{formattedPet.petMicrochipNumber || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{formattedPet.petOwnerName || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{formattedPet.petOwnerContactNumber || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded text-xs border ${vaccinationBadge.color}`}>
                                {vaccinationBadge.text}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                              <button
                                onClick={() => handleDeletePet(formattedPet.id)}
                                disabled={deleteStatus.isDeleting && deleteStatus.id === formattedPet.id}
                                className="glass-button px-3 py-1 rounded text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
                              >
                                {deleteStatus.isDeleting && deleteStatus.id === formattedPet.id 
                                  ? 'Deleting...' 
                                  : 'Delete'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredPets.map((pet) => {
                    const formattedPet = formatPetData(pet);
                    const vaccinationBadge = getVaccinationBadge(formattedPet);
                    return (
                      <div
                        key={formattedPet.id}
                        className={`glass-card p-4 bg-gradient-to-br ${getTypeColor(formattedPet.petType)} border border-white/20 hover:border-white/40 transition-all`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl">{getTypeIcon(formattedPet.petType)}</span>
                            <div>
                              <h3 className="text-white font-bold text-lg">{formattedPet.petName}</h3>
                              <p className="text-white/80 text-sm">{formattedPet.petType}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">Race:</span>
                            <span className="text-white">{formattedPet.petRace || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">Gender:</span>
                            <span className="text-white">{formattedPet.petGender || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">Owner:</span>
                            <span className="text-white">{formattedPet.petOwnerName || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">Microchip:</span>
                            <span className="text-white">{formattedPet.petMicrochipNumber || 'N/A'}</span>
                          </div>
                        </div>

                        {formattedPet.allergy && (
                          <div className="mb-3 p-2 bg-red-500/20 rounded border border-red-500/30">
                            <p className="text-red-200 text-xs font-medium">⚠️ Allergy: {formattedPet.allergy}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <span className={`px-2 py-1 rounded text-xs border ${vaccinationBadge.color}`}>
                            {vaccinationBadge.text}
                          </span>
                          <button
                            onClick={() => handleDeletePet(formattedPet.id)}
                            disabled={deleteStatus.isDeleting && deleteStatus.id === formattedPet.id}
                            className="px-3 py-1 rounded text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors text-sm"
                          >
                            {deleteStatus.isDeleting && deleteStatus.id === formattedPet.id 
                              ? 'Deleting...' 
                              : 'Delete'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages Modal */}
      {showMessages && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">Pet Owner Messages</h3>
              <button
                onClick={() => setShowMessages(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            {messagesLoading ? (
              <div className="text-center text-white py-8">Loading messages...</div>
            ) : pendingMessages.length === 0 ? (
              <div className="text-center text-white/70 py-8">No pending messages</div>
            ) : (
              <div className="space-y-4">
                {pendingMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg border ${
                      msg.status === 'pending'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-white/5 border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-semibold">
                          {msg.pet_name} ({msg.pet_type})
                        </p>
                        <p className="text-white/70 text-sm">
                          Owner: {msg.owner_name} • {msg.owner_contact}
                        </p>
                        <p className="text-white/60 text-xs mt-1">
                          Microchip: {msg.microchip_number}
                        </p>
                      </div>
                      {msg.status === 'pending' && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                          New
                        </span>
                      )}
                    </div>
                    <div className="mt-3 p-3 bg-white/5 rounded">
                      <p className="text-white whitespace-pre-wrap">{msg.summary}</p>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-white/50 text-xs">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                      {msg.status === 'pending' && (
                        <button
                          onClick={() => markAsRead(msg.id)}
                          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded text-white text-sm border border-green-400/30"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard; 

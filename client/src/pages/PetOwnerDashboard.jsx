import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5001';

const VetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const PetOwnerDashboard = () => {
  const navigate = useNavigate();
  const [petInfo, setPetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchPetData = async () => {
      try {
        setLoading(true);
        
        // First try to get data from localStorage
        const storedPetData = localStorage.getItem('petData');
        const microchipNumber = localStorage.getItem('microchipNumber');
        
        if (storedPetData) {
          // Use the data from localStorage
          setPetInfo(formatPetData(JSON.parse(storedPetData)));
          setLoading(false);
        } else if (microchipNumber) {
          // If we have a microchip number but no data, fetch it from the API
          console.log('Fetching pet data for microchip:', microchipNumber);
          
          const response = await fetch(`${API_URL}/api/pets/microchip/${microchipNumber}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Pet data fetched successfully:', data);
            
            // Save to localStorage and state
            localStorage.setItem('petData', JSON.stringify(data));
            setPetInfo(formatPetData(data));
          } else {
            // Pet not found or other error
            const errorData = await response.json();
            console.error('Failed to fetch pet data:', errorData);
            setError('Failed to load pet data. Please try logging in again.');
          }
        } else {
          // No data and no microchip number
          setError('No pet information found. Please log in again.');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error('Error fetching pet data:', error);
        setError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPetData();
  }, [navigate]);
  
  // Format the pet data for display
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
      allergy: pet.allergy,
      vetName: pet.vet_name,
      vetDoctorName: pet.doctor_name,
      vetContactNumber: pet.vet_contact
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('petData');
    localStorage.removeItem('microchipNumber');
    localStorage.removeItem('userType');
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <VetIcon />
                <span className="ml-2 text-xl font-bold text-white">PET OWNER PAGE</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/pet-owner/chat')}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-white text-sm border border-green-400/30 flex items-center gap-2"
              >
                <span>💬</span>
                <span>AI Vet Chat</span>
              </button>
              <button
                onClick={handleLogout}
                className="ml-4 text-white hover:text-white/80"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          {loading && (
            <div className="glass-card p-6 text-center text-white">
              <p>Loading pet information...</p>
            </div>
          )}
          
          {error && (
            <div className="glass-card p-6 text-center text-red-300 bg-red-900/20">
              <p>{error}</p>
            </div>
          )}
          
          {!loading && !error && petInfo && (
            <div className="glass-card overflow-hidden">
              <div className="p-6">
                {/* Pet Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-white mb-4">Pet Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80">Pet Name:</label>
                      <p className="mt-1 p-2 block w-full rounded-lg glass-input">
                        {petInfo.petName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80">Pet Type:</label>
                      <p className="mt-1 p-2 block w-full rounded-lg glass-input">
                        {petInfo.petType}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80">Pet Race:</label>
                      <p className="mt-1 p-2 block w-full rounded-lg glass-input">
                        {petInfo.petRace}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80">Pet Gender:</label>
                      <p className="mt-1 p-2 block w-full rounded-lg glass-input">
                        {petInfo.petGender}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80">Pet Birthdate:</label>
                      <p className="mt-1 p-2 block w-full rounded-lg glass-input">
                        {petInfo.petBirthdate ? new Date(petInfo.petBirthdate).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80">Pet Microchip Number:</label>
                      <p className="mt-1 p-2 block w-full rounded-lg glass-input">
                        {petInfo.petMicrochipNumber}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80">Completed Vaccinations:</label>
                      <p className="mt-1 p-2 block w-full rounded-lg glass-input">
                        {petInfo.completedVaccinations || 'None'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80">Scheduled Vaccinations:</label>
                      <p className="mt-1 p-2 block w-full rounded-lg glass-input">
                        {petInfo.scheduledVaccinations || 'None'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80">Allergy:</label>
                      <p className="mt-1 p-2 block w-full rounded-lg glass-input">
                        {petInfo.allergy || 'None'}
                      </p>
                    </div>
                  </div>

                  {/* Owner Information */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-white">Owner Information</h3>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80">Pet Owner Name:</label>
                        <p className="mt-1 p-2 block w-full rounded-lg glass-input">
                          {petInfo.petOwnerName || '-'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80">Pet Owner Contact Number:</label>
                        <p className="mt-1 p-2 block w-full rounded-lg glass-input">
                          {petInfo.petOwnerContactNumber || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vet Information */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-white">Vet Information</h3>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80">Vet Name:</label>
                        <p className="mt-1 p-2 block w-full rounded-lg glass-input">
                          {petInfo.vetName || '-'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80">Vet Doctor Name:</label>
                        <p className="mt-1 p-2 block w-full rounded-lg glass-input">
                          {petInfo.vetDoctorName || '-'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80">Vet Contact Number:</label>
                        <p className="mt-1 p-2 block w-full rounded-lg glass-input">
                          {petInfo.vetContactNumber || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetOwnerDashboard; 
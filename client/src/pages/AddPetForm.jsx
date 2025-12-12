import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5001';

const VetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const AddPetForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [petInfo, setPetInfo] = useState({
    petName: '',
    petType: '',
    petRace: '',
    petGender: '',
    petBirthdate: '',
    petMicrochipNumber: '',
    completedVaccinations: '',
    scheduledVaccinations: '',
    allergy: ''
  });

  const [ownerInfo, setOwnerInfo] = useState({
    petOwnerName: '',
    petOwnerContactNumber: ''
  });

  const [vetInfo, setVetInfo] = useState({
    vetName: '',
    vetContactNumber: ''
  });

  const [clinicInfo, setClinicInfo] = useState({
    clinicName: '',
    clinicContactNumber: ''
  });

  const handlePetInfoChange = (e) => {
    const { name, value } = e.target;
    setPetInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOwnerInfoChange = (e) => {
    const { name, value } = e.target;
    setOwnerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVetInfoChange = (e) => {
    const { name, value } = e.target;
    setVetInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClinicInfoChange = (e) => {
    const { name, value } = e.target;
    setClinicInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!petInfo.petName || !petInfo.petType || !ownerInfo.petOwnerName) {
      setSubmitError('Please fill in the required fields: Pet Name, Pet Type, and Owner Name');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    // Format data for API
    const petData = {
      petName: petInfo.petName,
      petType: petInfo.petType,
      petRace: petInfo.petRace,
      petGender: petInfo.petGender,
      petBirthdate: petInfo.petBirthdate,
      petMicrochipNumber: petInfo.petMicrochipNumber,
      completedVaccinations: petInfo.completedVaccinations,
      scheduledVaccinations: petInfo.scheduledVaccinations,
      allergy: petInfo.allergy,
      petOwnerName: ownerInfo.petOwnerName,
      petOwnerContactNumber: ownerInfo.petOwnerContactNumber,
      vetName: vetInfo.vetName,
      vetContactNumber: vetInfo.vetContactNumber,
      clinicName: clinicInfo.clinicName,
      clinicContactNumber: clinicInfo.clinicContactNumber
    };
    
    console.log('Submitting data to API:', petData);
    
    try {
      // API call to the server
      const response = await fetch(`${API_URL}/api/pets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData)
      });
      
      const data = await response.json();
      console.log('API response:', data);
      
      if (response.ok) {
        console.log('Pet added successfully:', data);
        // Navigate to dashboard after successful submission
        navigate('/doctor/dashboard');
      } else {
        console.error('Failed to add pet:', data);
        setSubmitError(data.message || 'Failed to save pet information. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting pet data:', error);
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/');
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Pet Info</h3>
            <div>
              <input
                type="text"
                name="petName"
                placeholder="Pet Name"
                value={petInfo.petName}
                onChange={handlePetInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <input
                type="text"
                name="petType"
                placeholder="Pet Type"
                value={petInfo.petType}
                onChange={handlePetInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <input
                type="text"
                name="petRace"
                placeholder="Pet Race"
                value={petInfo.petRace}
                onChange={handlePetInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <input
                type="text"
                name="petGender"
                placeholder="Pet Gender"
                value={petInfo.petGender}
                onChange={handlePetInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <input
                type="date"
                name="petBirthdate"
                placeholder="Pet Birthdate"
                value={petInfo.petBirthdate}
                onChange={handlePetInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <input
                type="text"
                name="petMicrochipNumber"
                placeholder="Microchip Number"
                value={petInfo.petMicrochipNumber}
                onChange={handlePetInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <input
                type="text"
                name="completedVaccinations"
                placeholder="Completed Vaccinations"
                value={petInfo.completedVaccinations}
                onChange={handlePetInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <input
                type="text"
                name="scheduledVaccinations"
                placeholder="Scheduled Vaccinations"
                value={petInfo.scheduledVaccinations}
                onChange={handlePetInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <input
                type="text"
                name="allergy"
                placeholder="Allergy"
                value={petInfo.allergy}
                onChange={handlePetInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={nextStep}
                className="glass-button px-6 py-2 rounded-lg text-white font-medium"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Owner Info</h3>
            <div>
              <input
                type="text"
                name="petOwnerName"
                placeholder="Pet Owner Name"
                value={ownerInfo.petOwnerName}
                onChange={handleOwnerInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <input
                type="text"
                name="petOwnerContactNumber"
                placeholder="Pet Owner Contact Number"
                value={ownerInfo.petOwnerContactNumber}
                onChange={handleOwnerInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="glass-button px-6 py-2 rounded-lg text-white font-medium"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="glass-button px-6 py-2 rounded-lg text-white font-medium"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Vet Info</h3>
            <div>
              <input
                type="text"
                name="vetName"
                placeholder="Vet Name"
                value={vetInfo.vetName}
                onChange={handleVetInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <input
                type="text"
                name="vetContactNumber"
                placeholder="Vet Contact Number"
                value={vetInfo.vetContactNumber}
                onChange={handleVetInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="glass-button px-6 py-2 rounded-lg text-white font-medium"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="glass-button px-6 py-2 rounded-lg text-white font-medium"
                disabled={isSubmitting}
              >
                Next
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Veterinary Clinic</h3>
            <div>
              <input
                type="text"
                name="clinicName"
                placeholder="Clinic Name"
                value={clinicInfo.clinicName}
                onChange={handleClinicInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <input
                type="text"
                name="clinicContactNumber"
                placeholder="Clinic Contact Number"
                value={clinicInfo.clinicContactNumber}
                onChange={handleClinicInfoChange}
                className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="glass-button px-6 py-2 rounded-lg text-white font-medium"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="glass-button px-6 py-2 rounded-lg text-white font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Pet Information'}
              </button>
            </div>
            {submitError && (
              <div className="mt-4 p-3 bg-red-500/20 text-red-300 rounded-lg text-center">
                {submitError}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
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
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="/doctor/dashboard" 
                   className="text-white/70 hover:text-white hover:border-white/70 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                  HOME
                </a>
                <a href="/doctor/add-pet" 
                   className="text-white hover:text-white/80 inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-white">
                  ADD NEW PET
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <button className="text-white hover:text-white/80 p-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
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
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Pet</h2>
            
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <div className={`text-sm ${currentStep >= 1 ? 'text-white' : 'text-white/50'}`}>Pet Info</div>
                <div className={`text-sm ${currentStep >= 2 ? 'text-white' : 'text-white/50'}`}>Owner Info</div>
                <div className={`text-sm ${currentStep >= 3 ? 'text-white' : 'text-white/50'}`}>Vet Info</div>
                <div className={`text-sm ${currentStep >= 4 ? 'text-white' : 'text-white/50'}`}>Clinic</div>
              </div>
              <div className="h-2 bg-white/10 rounded-full">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form Content */}
            <div className="max-w-2xl mx-auto">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPetForm; 
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import doctorImage from '../assets/indir.jpeg';
import petOwnerImage from '../assets/indir (1).jpeg';

const API_URL = 'http://localhost:5001';
console.log('Using API URL:', API_URL);

const Login = ({ setIsAuthenticated, setUserType }) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [doctorCredentials, setDoctorCredentials] = useState({
    username: '',
    password: ''
  });
  const [petOwnerCredentials, setPetOwnerCredentials] = useState({
    microchipNumber: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDoctorChange = (e) => {
    const { name, value } = e.target;
    setDoctorCredentials({
      ...doctorCredentials,
      [name]: value
    });
  };

  const handlePetOwnerChange = (e) => {
    const { name, value } = e.target;
    setPetOwnerCredentials({
      ...petOwnerCredentials,
      [name]: value
    });
  };

  const handleDoctorLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const loginData = {
      username: doctorCredentials.username,
      password: doctorCredentials.password
    };
    
    console.log('Attempting doctor login with:', { username: loginData.username });

    try {
      try {
        const testResponse = await fetch(`${API_URL}/api/test`, { method: 'GET' });
        if (testResponse.ok) {
          console.log('Server is running, proceeding with login');
        } else {
          console.warn('Server test failed, but proceeding with login anyway');
        }
      } catch (testErr) {
        console.error('Server test failed with error:', testErr);
        throw new Error('Cannot connect to server');
      }
      
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      
      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response data:', data);

      if (response.ok) {
        console.log('Login successful, navigating to dashboard');
        localStorage.setItem('token', data.token || 'temp_doctor_token');
        localStorage.setItem('userType', 'doctor');
        setIsAuthenticated(true);
        setUserType('doctor');
        navigate('/doctor/dashboard');
      } else {
        console.error('Login failed with server response:', data);
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login request failed with error:', err);
      setError('Failed to connect to the server: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePetOwnerLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!petOwnerCredentials.microchipNumber) {
      setError('Please enter your pet\'s microchip number');
      setIsLoading(false);
      return;
    }
    
    console.log('Attempting pet owner login with microchip:', petOwnerCredentials.microchipNumber);

    try {
      // Try to find the pet by microchip number
      const response = await fetch(`${API_URL}/api/pets/microchip/${petOwnerCredentials.microchipNumber}`);
      
      console.log('Pet search response status:', response.status);
      
      if (response.ok) {
        // Pet found, store the pet data and move to dashboard
        const petData = await response.json();
        console.log('Pet found:', petData);
        
        // Store pet data for the dashboard
        localStorage.setItem('petData', JSON.stringify(petData));
        localStorage.setItem('userType', 'pet-owner');
        localStorage.setItem('microchipNumber', petOwnerCredentials.microchipNumber);
        
        setIsAuthenticated(true);
        setUserType('pet-owner');
        navigate('/pet-owner/dashboard');
      } else {
        // Pet not found or other error
        const errorData = await response.json();
        console.error('Pet search failed:', errorData);
        setError(errorData.message || 'No pet found with this microchip number');
      }
    } catch (err) {
      console.error('Pet search request failed with error:', err);
      setError('Failed to connect to the server: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card max-w-4xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to Pet Health</h1>
          <p className="text-xl text-white/80">Vaccination and Health Tracking System</p>
        </div>

        {!selectedRole ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <button
              onClick={() => setSelectedRole('doctor')}
              className="glass-card p-8 text-center cursor-pointer group relative overflow-hidden"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-cyan-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="h-32 w-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/30 shadow-lg group-hover:border-white/50 transition-all duration-300 group-hover:scale-105">
                  <img 
                    src={doctorImage} 
                    alt="Doctor" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-cyan-200 transition-colors">Doctor Login</h3>
                <p className="text-white/70 group-hover:text-white/90 transition-colors">Access your veterinary dashboard</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole('pet-owner')}
              className="glass-card p-8 text-center cursor-pointer group relative overflow-hidden"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-400/20 via-pink-400/20 to-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="h-32 w-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/30 shadow-lg group-hover:border-white/50 transition-all duration-300 group-hover:scale-105">
                  <img 
                    src={petOwnerImage} 
                    alt="Pet Owner" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-pink-200 transition-colors">Pet Owner Login</h3>
                <p className="text-white/70 group-hover:text-white/90 transition-colors">View your pet's health records</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setSelectedRole(null)}
              className="mb-6 text-white/70 hover:text-white flex items-center gap-2 transition-colors"
              disabled={isLoading}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to selection
            </button>

            {selectedRole === 'doctor' ? (
              <form onSubmit={handleDoctorLogin} className="space-y-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    required
                    disabled={isLoading}
                    value={doctorCredentials.username}
                    onChange={handleDoctorChange}
                    className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    disabled={isLoading}
                    value={doctorCredentials.password}
                    onChange={handleDoctorChange}
                    className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Enter your password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="glass-button w-full py-2 px-4 rounded-lg text-white font-medium"
                >
                  {isLoading ? 'Logging in...' : 'Login as Doctor'}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePetOwnerLogin} className="space-y-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Pet Microchip Number</label>
                  <input
                    type="text"
                    name="microchipNumber"
                    required
                    disabled={isLoading}
                    value={petOwnerCredentials.microchipNumber}
                    onChange={handlePetOwnerChange}
                    className="glass-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Enter your pet's microchip number"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="glass-button w-full py-2 px-4 rounded-lg text-white font-medium"
                >
                  {isLoading ? 'Searching...' : 'View Pet Records'}
                </button>
              </form>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 text-center text-red-300 bg-red-500/10 p-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login; 
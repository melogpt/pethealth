import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import DoctorDashboard from './pages/DoctorDashboard';
import PetOwnerDashboard from './pages/PetOwnerDashboard';
import AddPetForm from './pages/AddPetForm';
import AIVetChat from './pages/AIVetChat';
import petImage from './assets/indir (2).jpeg';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (token) {
      setIsAuthenticated(true);
      setUserType(userType);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} />} />
        
        {/* Doctor Routes */}
        <Route 
          path="/doctor/dashboard" 
          element={
            isAuthenticated && userType === 'doctor' ? 
            <DoctorDashboard /> : 
            <Login setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} />
          } 
        />
        <Route 
          path="/doctor/add-pet" 
          element={
            isAuthenticated && userType === 'doctor' ? 
            <AddPetForm /> : 
            <Login setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} />
          } 
        />
        
        {/* Pet Owner Routes */}
        <Route 
          path="/pet-owner/dashboard" 
          element={
            isAuthenticated && userType === 'pet-owner' ? 
            <PetOwnerDashboard /> : 
            <Login setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} />
          } 
        />
        <Route 
          path="/pet-owner/chat" 
          element={
            isAuthenticated && userType === 'pet-owner' ? 
            <AIVetChat /> : 
            <Login setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} />
          } 
        />
      </Routes>
      
      {/* Fixed Pet Image - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
          <img
            src={petImage}
            alt="Pet"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default App; 
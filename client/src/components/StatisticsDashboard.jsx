import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5001';

const StatisticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching statistics from:', `${API_URL}/api/pets/stats`);
        
        const response = await fetch(`${API_URL}/api/pets/stats`);
        console.log('Statistics response status:', response.status);
        
        const data = await response.json();
        console.log('Statistics response data:', data);
        
        if (response.ok) {
          if (data.success && data.stats) {
            setStats(data.stats);
          } else {
            console.error('Invalid response format:', data);
            setError('Invalid response format from server');
          }
        } else {
          setError(data.message || 'Failed to load statistics');
        }
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError(`Network error: ${err.message}. Please check your connection and make sure the server is running.`);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 text-center text-white">
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center text-red-300 bg-red-900/20">
        <p className="font-semibold mb-2">⚠️ {error}</p>
        <p className="text-sm text-red-200/80">
          Make sure the backend server is running on {API_URL}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-white text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  // Pet type colors
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
    if (type?.toLowerCase().includes('dog')) return '🐕';
    if (type?.toLowerCase().includes('cat')) return '🐱';
    if (type?.toLowerCase().includes('bird')) return '🐦';
    if (type?.toLowerCase().includes('rabbit')) return '🐰';
    if (type?.toLowerCase().includes('hamster')) return '🐹';
    return '🐾';
  };

  return (
    <div className="space-y-6">
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pets */}
        <div className="glass-card p-6 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border-l-4 border-indigo-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Total Pets</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalPets}</p>
            </div>
            <div className="text-4xl">🐾</div>
          </div>
        </div>

        {/* Vaccination Completed */}
        <div className="glass-card p-6 bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-l-4 border-green-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Vaccinated</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.vaccination?.completed || 0}</p>
            </div>
            <div className="text-4xl">💉</div>
          </div>
        </div>

        {/* Vaccination Pending */}
        <div className="glass-card p-6 bg-gradient-to-br from-yellow-500/30 to-amber-500/30 border-l-4 border-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.vaccination?.pending || 0}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>

        {/* With Allergies */}
        <div className="glass-card p-6 bg-gradient-to-br from-red-500/30 to-rose-500/30 border-l-4 border-red-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">With Allergies</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.allergy?.with_allergy || 0}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>
      </div>

      {/* Pet Type Distribution */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Pet Type Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.typeDistribution?.map((type, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg bg-gradient-to-br ${getTypeColor(type.type)} border border-white/20`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getTypeIcon(type.type)}</span>
                  <div>
                    <p className="text-white font-semibold">{type.type || 'Unknown'}</p>
                    <p className="text-white/80 text-sm">{type.count} pets</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats.totalPets > 0 ? Math.round((type.count / stats.totalPets) * 100) : 0}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allergy Details */}
      {stats.allergyDetails && stats.allergyDetails.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Common Allergies</h3>
          <div className="space-y-2">
            {stats.allergyDetails.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20"
              >
                <span className="text-white font-medium">{item.allergy}</span>
                <span className="text-red-300 font-semibold">{item.count} pets</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Pets */}
      {stats.recentPets && stats.recentPets.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recently Added Pets</h3>
          <div className="space-y-2">
            {stats.recentPets.map((pet) => (
              <div
                key={pet.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(pet.type)}</span>
                  <div>
                    <p className="text-white font-medium">{pet.name}</p>
                    <p className="text-white/60 text-sm">{pet.type} • {pet.owner_name || 'Unknown Owner'}</p>
                  </div>
                </div>
                <span className="text-white/60 text-sm">
                  {pet.birthdate ? new Date(pet.birthdate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsDashboard;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiBriefcase, FiUser, FiPlus } from 'react-icons/fi';
import { HiStar } from 'react-icons/hi';
import axios from 'axios';


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [userData, setUserData] = useState(null);
  const [services, setServices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------- fetch user data from localStorage ---------- */
 useEffect(() => {
  const fetchUserData = () => {
    try {
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser); // Correctly parse the stored data
        setUserData(parsedUser);
        if (parsedUser.id) {
          fetchProviderServices(parsedUser.id);
        }
      } else {
        setError('No user data found in localStorage');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      setError('Error loading profile data');
      setLoading(false);
    }
  };

  fetchUserData();
}, []);

/* ---------- fetch provider services ---------- */
const fetchProviderServices = async (providerId) => {
  try {
    const response = await axios.get(`http://localhost:8000/api/providers/${providerId}/services`);
    setServices(response.data.data || []);
    
    // Fetch messages (simulated for now)
    setMessages([
      { id: 1, sender: 'John Doe', message: 'Interested in your services', date: '2h ago', read: false },
      { id: 2, sender: 'Acme Corp', message: 'Project inquiry', date: '1d ago', read: true },
    ]);
    
    setLoading(false);
  } catch (err) {
    console.error('Error fetching services:', err);
    setError('Failed to load services');
    setLoading(false);
  }
};

  /* ---------- tab config ---------- */
  const tabs = [
    { id: 'messages', icon: <FiMessageSquare />, label: 'Message Box', count: messages.filter(m => !m.read).length },
    { id: 'services', icon: <FiBriefcase />, label: 'My Services', count: services.length },
    { id: 'profile',  icon: <FiUser />,      label: 'Profile',      count: null },
  ];

  /* ---------- motion variants ---------- */
  const cardSpring = { type: 'spring', stiffness: 300, damping: 25 };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center p-6 bg-red-900/50 rounded-xl">
          <p className="text-red-400 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black font-sans">
      {/* Header */}
      <header className="relative overflow-hidden bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-5">
        <div className="absolute t-12 -0 bg-gradient-to-r from-yellow-500/10 via-yellow-400/5 to-transparent" />
        <h1 className="relative text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          Provider Dashboard
        </h1>
        <p className="relative text-sm text-gray-400 mt-1">
          {userData?.profile?.profession || 'Professional'} Services
        </p>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <nav className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center justify-center px-5 py-3 rounded-2xl text-sm font-semibold transition-all
                ${activeTab === tab.id
                  ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,.6)]'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2 text-lg">{tab.icon}</span>
              {tab.label}
              {tab.count !== null && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-400 text-black"
                >
                  {tab.count}
                </motion.span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* Content Panel */}
        <motion.section
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-900/60 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden"
        >
          {/* Messages */}
          {activeTab === 'messages' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">Message Lounge</h2>
              <div className="space-y-4">
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    whileHover={{ scale: 1.02 }}
                    layout
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer
                      ${msg.read ? 'bg-white/5 border-white/10' : 'bg-yellow-400/10 border-yellow-400/30'}`}
                  >
                    {!msg.read && (
                      <div className="absolute top-3 right-3 h-2 w-2 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-white">{msg.sender}</h3>
                      <span className="text-xs text-gray-400">{msg.date}</span>
                    </div>
                    <p className="text-gray-300 mt-1 truncate">{msg.message}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {activeTab === 'services' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-yellow-400">Your Services</h2>
                <Link
                  to="/AddService"
                  className="flex items-center px-4 py-2 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-500 transition"
                >
                  <FiPlus className="mr-2" /> Add Service
                </Link>
              </div>

              {services.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">You haven't added any services yet</p>
                  <Link
                    to="/services/create"
                    className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-500 transition"
                  >
                    <FiPlus className="mr-2" /> Create Your First Service
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {services.map(service => (
                    <motion.div
                      key={service.id}
                      whileHover={{ y: -5 }}
                      transition={cardSpring}
                      className="group relative bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative p-5">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-white">{service.title}</h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium
                              ${service.is_available
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-gray-500/20 text-gray-300'}`}
                          >
                            {service.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{service.category}</p>
                        <p className="text-sm text-gray-300 mt-2">{service.description?.substring(0, 60)}...</p>
                        <div className="mt-4 space-x-2">
                          <Link
                            to={`/services/${service.id}/edit`}
                            className="px-3 py-1 text-xs bg-white/10 text-white rounded-lg hover:bg-white/20"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/services/${service.id}`}
                            className="px-3 py-1 text-xs bg-white/10 text-white rounded-lg hover:bg-white/20"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          {activeTab === 'profile' && userData && (
            <div className="p-8 grid md:grid-cols-3 gap-8">
              {/* Card */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="md:col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl p-6 text-center"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center text-black text-3xl font-bold">
                  {userData.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-white">{userData.name}</h3>
                <p className="text-gray-400 text-sm">{userData.profile?.profession || 'Professional'}</p>

               <div className="flex items-center justify-center mt-4 space-x-1">
  {[...Array(5)].map((_, i) => (
    <HiStar
      key={i}
      className={`w-5 h-5 ${i < Math.floor(userData.rating || 0) ? 'text-yellow-400' : 'text-gray-600'}`}
    />
  ))}
  <span className="ml-2 text-sm text-gray-300">{userData.rating?.toFixed(1) || 'N/A'}</span>
</div>

<Link
  to="/profile/edit"
  className="mt-6 w-full py-2 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-500 transition block"
>
  Edit Profile
</Link>
</motion.div>

{/* Details */}
<div className="md:col-span-2 space-y-6">
  <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6">
    <h4 className="text-lg font-bold text-yellow-400 mb-3">About</h4>
    <p className="text-gray-300">
      {userData.profile?.bio || 'No bio provided'}
    </p>
  </div>

  <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6">
    <h4 className="text-lg font-bold text-yellow-400 mb-3">Contact</h4>
    <div className="space-y-2 text-gray-300">
      <p><span className="text-gray-500">Email:</span> {userData.email}</p>
      <p><span className="text-gray-500">Phone:</span> {userData.profile?.phone || 'Not provided'}</p>
      <p><span className="text-gray-500">Location:</span> {userData.profile?.location || 'Not specified'}</p>
    </div>
  </div>

  <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6">
    <h4 className="text-lg font-bold text-yellow-400 mb-3">Professional Details</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
      <div>
        <p><span className="text-gray-500">Experience:</span> {userData.profile?.years_of_experience || 0} years</p>
        <p><span className="text-gray-500">Status:</span> {userData.profile?.is_approved ? 'Verified' : 'Pending verification'}</p>
      </div>
      <div>
        <p><span className="text-gray-500">Services:</span> {services.length}</p>
        <p><span className="text-gray-500">Reviews:</span> {userData.reviews_count || 0}</p>
      </div>
    </div>
  </div>
</div>
</div>
)}
</motion.section>
</main>
</div>
);
};

export default Dashboard;
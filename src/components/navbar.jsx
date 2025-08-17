/* Navbar.jsx - Enhanced with Instant Auth State Sync */
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import VanillaTilt from 'vanilla-tilt';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const tooltipRef = useRef(null);
  const userIconRef = useRef(null);
  const avatarRef = useRef(null);

  /* ---------- Auth State Management ---------- */
  useEffect(() => {
    // Initialize auth state from localStorage
    const updateAuthState = () => {
      try {
        const token = localStorage.getItem('access_token');
        const userData = JSON.parse(localStorage.getItem('userData')) || null;
        
        if (token && userData) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Initial check
    updateAuthState();

    // Set up storage event listener for cross-tab sync
    const handleStorageChange = (e) => {
      if (e.key === 'access_token' || e.key === 'userData') {
        updateAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  /* ---------- UI Helpers ---------- */
  const isActive = (path) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  // Base nav links for unauthenticated users
  const baseNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  // Client-specific links
  const clientNavLinks = [
    { name: 'Services', path: '/services' },
    { name: 'Providers', path: '/providers' },
    ...baseNavLinks
  ];

  // Provider-specific links
  const providerNavLinks = [
    { name: 'Messages', path: '/messages' },
    { name: 'Posts', path: '/posts' },
    ...baseNavLinks
  ];

  // Get appropriate nav links based on user role
  const getNavLinks = () => {
    if (!user) return baseNavLinks;
    return user.role === 'provider' ? providerNavLinks : clientNavLinks;
  };

  const userMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Profile', path: `/profile/complete/${user?.id || ''}`, icon: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' },
    { name: 'Settings', path: '/settings', icon: 'M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z' },
  ];

  /* ---------- Effects ---------- */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    if (avatarRef.current) VanillaTilt.init(avatarRef.current, { 
      max: 10, 
      speed: 400, 
      glare: true, 
      'max-glare': 0.3 
    });

    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /* ---------- Auth Actions ---------- */
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await axios.post(
          'http://localhost:8000/api/logout',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth data from localStorage and state
      localStorage.removeItem('access_token');
      localStorage.removeItem('userData');
      setUser(null);
      
      // Dispatch storage event to sync across tabs
      window.dispatchEvent(new Event('storage'));
      
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  /* ---------- UI Handlers ---------- */
  const handleUserIconMouseEnter = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setShowTooltip(true);
    }
  };

  const handleTooltipMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleTooltipMouseLeave = () => {
    setShowTooltip(false);
  };

  /* ---------- Render ---------- */
  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed w-full top-0 left-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-slate-900/50 py-2'
            : 'bg-slate-900/40 backdrop-blur-md py-4'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </motion.div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
              HomePro
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {getNavLinks().map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-4 py-2 font-medium transition-colors ${
                  isActive(link.path) ? 'text-cyan-300' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            ))}

            {/* Avatar / Login */}
            {user ? (
              <motion.button
                ref={avatarRef}
                onClick={() => setUserMenuOpen(true)}
                className="ml-6 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg hover:shadow-cyan-500/30 transition"
                whileHover={{ scale: 1.1 }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </motion.button>
            ) : (
              <div className="relative ml-6">
                <button
                  ref={userIconRef}
                  onMouseEnter={handleUserIconMouseEnter}
                  className="w-10 h-10 rounded-full bg-slate-700/60 flex items-center justify-center text-slate-400 hover:bg-slate-600 transition group"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showTooltip && (
                    <motion.div
                      ref={tooltipRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseEnter={handleTooltipMouseEnter}
                      onMouseLeave={handleTooltipMouseLeave}
                      className="absolute right-0 mt-3 w-56 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl p-4 space-y-3 z-50"
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-sm text-slate-200">Welcome to HomePro</p>
                      <p className="text-xs text-slate-400">Sign in to access your account and manage services</p>
                      <div className="flex gap-2">
                        <Link
                          to="/login"
                          className="flex-1 text-center py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition"
                          onClick={() => setShowTooltip(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="flex-1 text-center py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-white hover:opacity-90 transition"
                          onClick={() => setShowTooltip(false)}
                        >
                          Register
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <motion.button
            className="md:hidden text-slate-300"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </motion.button>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-slate-800/80 backdrop-blur-xl border-t border-slate-700/50"
            >
              <div className="px-6 py-4 space-y-2">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium ${
                      isActive(link.path) ? 'text-cyan-300 bg-slate-700/50' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {user ? (
                  <>
                    <div className="border-t border-slate-700/50 pt-4 mt-4">
                      <div className="flex items-center px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                      </div>
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-4 py-3 space-x-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                          </svg>
                          <span>{item.name}</span>
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 space-x-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/30"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-slate-700/50 pt-4 mt-4 space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full py-3 rounded-lg bg-slate-700 text-center text-white"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-center text-white"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Slide-in User Sidebar */}
      <AnimatePresence>
        {userMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setUserMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 right-0 h-full w-80 bg-slate-900/90 backdrop-blur-xl border-l border-slate-700/50 z-50 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white">{user?.name}</p>
                    <p className="text-sm text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <button onClick={() => setUserMenuOpen(false)} className="text-slate-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="space-y-2 flex-1">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-700/50 transition"
                  >
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span className="text-slate-300">{item.name}</span>
                  </Link>
                ))}
              </nav>

              <button
                onClick={() => {
                  handleLogout();
                  setUserMenuOpen(false);
                }}
                className="flex items-center space-x-3 mt-auto px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/30 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
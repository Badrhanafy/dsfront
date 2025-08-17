import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiFilter, FiX, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import VanillaTilt from 'vanilla-tilt';

const Services = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const cardRefs = useRef([]);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/services', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setServices(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Initialize tilt effect
  useEffect(() => {
    cardRefs.current.forEach(el => el && VanillaTilt.init(el, { 
      max: 5, 
      speed: 300, 
      glare: true, 
      'max-glare': 0.1 
    }));
  }, [services]);

  // Get all unique categories
  const categories = [...new Set(services.map(service => service.category || 'Uncategorized'))];

  // Filter services based on search and categories
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || 
                          selectedCategories.includes(service.category);
    return matchesSearch && matchesCategory;
  });

  const toggleCategory = cat => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
              <div className="space-y-4">
                <Skeleton className="h-10 w-64 bg-slate-800" />
                <Skeleton className="h-5 w-80 bg-slate-800" />
              </div>
              <Skeleton className="h-12 w-full md:w-96 bg-slate-800" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-card p-6 rounded-2xl space-y-4">
                  <Skeleton className="h-40 w-full bg-slate-800 rounded-lg" />
                  <Skeleton className="h-6 w-3/4 bg-slate-800" />
                  <Skeleton className="h-4 w-full bg-slate-800" />
                  <Skeleton className="h-4 w-1/2 bg-slate-800" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 py-12 flex items-center justify-center">
        <div className="max-w-md glass-card p-6 rounded-2xl text-center">
          <div className="bg-red-500/20 border border-red-400/50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center gap-2 text-red-300">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="max-w-7xl mt-12 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            Our Services
          </h1>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
            Discover professional services tailored to your needs
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition glass-card"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border-slate-600 text-slate-300 bg-slate-700 hover:text-white hover:bg-slate-700"
            >
              <FiFilter className="w-4 h-4" /> 
              Categories
            </Button>
            
            {(searchTerm || selectedCategories.length > 0) && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-cyan-400 hover:text-cyan-300"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Category Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="glass-card p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Filter by Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <Badge
                      key={cat}
                      variant={selectedCategories.includes(cat) ? 'default' : 'outline'}
                      onClick={() => toggleCategory(cat)}
                      className={`cursor-pointer transition ${
                        selectedCategories.includes(cat) 
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                          : 'hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {searchTerm && (
            <Badge 
              variant="outline"
              className="flex items-center gap-1 border-slate-600 text-slate-300"
            >
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-slate-300">
                <FiX className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedCategories.map(cat => (
            <Badge 
              key={cat}
              variant="outline"
              className="flex items-center gap-1 border-cyan-400/50 text-cyan-300"
            >
              {cat}
              <button onClick={() => toggleCategory(cat)} className="text-cyan-500 hover:text-cyan-300">
                <FiX className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service, i) => (
              <motion.div
                key={service.id}
                ref={el => (cardRefs.current[i] = el)}
                className="relative h-64 rounded-2xl overflow-hidden shadow-lg group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {/* Service Image Background */}
                <div className="absolute inset-0 bg-slate-800">
                  {service.image ? (
                    <img
                      src={`http://localhost:8000/storage/${service.image}`}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-slate-800 to-slate-700">
                      {service.icon || '✨'}
                    </div>
                  )}
                </div>

                {/* Overlay that covers the entire card on hover */}
                <div className="absolute inset-0 bg-black/60 flex flex-col justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {/* Top section - Title and Category */}
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-white">{service.title}</h3>
                      <Badge variant="outline" className="text-xs border-cyan-400/50 text-cyan-300">
                        {service.category}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-300 mt-2">
                      <FiClock className="mr-1" />
                      <span>{service.min_duration || 30} min</span>
                    </div>
                  </div>

                  {/* Middle section - Description */}
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {service.description}
                  </p>

                  {/* Bottom section - Price and View Button */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-300">
                      <span className="font-bold text-white">${service.hourly_rate || '--'}</span>/hour
                    </div>
                    <Link
                      to={`/services/${service.id}`}
                      className="flex items-center justify-center px-4 py-2 bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center rounded-2xl">
            <FiSearch className="w-12 h-12 mx-auto text-slate-500 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">No services found</h3>
            <p className="text-slate-400 mb-4">Try adjusting your search or filters</p>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="text-cyan-400 hover:text-cyan-300"
            >
              Reset All Filters
            </Button>
          </div>
        )}
      </div>
      
      <style>{`
        .glass-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(10px) saturate(120%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .glass-card:hover {
          border-color: rgba(255,255,255,0.12);
        }
      `}</style>
    </div>
  );
};

export default Services;
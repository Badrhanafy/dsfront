import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = ({ isAuthenticated, user, onLogout }) => {
  // State management with separate loading and error states
  const [data, setData] = useState({
    services: [],
    providers: [],
  });
  const [loading, setLoading] = useState({
    services: true,
    providers: true,
    all: true
  });
  const [error, setError] = useState({
    services: null,
    providers: null
  });

  // Data fetching with proper error boundaries
  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/services', {
        timeout: 5000 // 5 second timeout
      });
      
      if (!response.data?.data) {
        throw new Error('Invalid services data structure');
      }
      
      setData(prev => ({ ...prev, services: response.data.data }));
    } catch (err) {
      console.error('Services fetch error:', err);
      setError(prev => ({ 
        ...prev, 
        services: err.response?.data?.message || 'Failed to load services' 
      }));
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        services: false,
        all: !prev.providers // Only set all to false when both are done
      }));
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/providers', {
        timeout: 5000
      });
      
      // Handle both possible response structures
      const providersData = response.data?.data?.data || response.data?.data || [];
      
      if (!Array.isArray(providersData)) {
        throw new Error('Providers data is not an array');
      }
      
      setData(prev => ({ ...prev, providers: providersData }));
    } catch (err) {
      console.error('Providers fetch error:', err);
      setError(prev => ({ 
        ...prev, 
        providers: err.response?.data?.message || 'Failed to load providers' 
      }));
      setData(prev => ({ ...prev, providers: [] })); // Fallback empty array
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        providers: false,
        all: !prev.services // Only set all to false when both are done
      }));
    }
  };

  useEffect(() => {
    // Cancel token for cleanup
    const source = axios.CancelToken.source();
    
    const loadData = async () => {
      try {
        await Promise.all([
          fetchServices(),
          fetchProviders()
        ]);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('Data loading error:', err);
        }
      }
    };

    loadData();

    return () => {
      source.cancel('Component unmounted, cancelling requests');
    };
  }, []);

  // Helper components
  const LoadingSkeleton = ({ count = 1, className = '', component: Component }) => {
    return Array(count).fill(0).map((_, i) => (
      <Component key={i} className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
    ));
  };

  const ServiceSkeleton = ({ className }) => (
    <div className={`p-6 h-full ${className}`}>
      <div className="w-16 h-16 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
      <div className="flex justify-between">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );

  const ProviderSkeleton = ({ className }) => (
    <div className={`p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
        <div className="ml-4">
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="flex items-center mb-4">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-5 h-5 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="ml-2 h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-full mt-6"></div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-blue-800 to-indigo-900 min-h-[500px]">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="container mx-auto px-6 h-full flex items-center relative z-10">
          <div className="w-full lg:w-1/2 text-white">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
              Find Trusted <span className="text-blue-300">Home Services</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8">
              Connect with professional service providers for all your home needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
              <Link 
                to="/services" 
                className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-600 font-bold rounded-lg text-center hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                Browse Services
              </Link>
              <Link 
                to="/providers" 
                className="px-6 py-3 sm:px-8 sm:py-4 border-2 border-white text-white font-bold rounded-lg text-center hover:bg-white hover:bg-opacity-10 transition-colors text-sm sm:text-base"
              >
                View Providers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Popular Services
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the most requested home services in your area
            </p>
          </div>

          {error.services ? (
            <div className="text-center py-10 sm:py-12">
              <p className="text-red-500 text-lg sm:text-xl mb-4">{error.services}</p>
              <button 
                onClick={fetchServices}
                className="px-5 py-2.5 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {loading.services ? (
                <LoadingSkeleton count={4} component={ServiceSkeleton} />
              ) : (
                data.services.slice(0, 4).map(service => (
                  <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-lg text-blue-600 text-2xl sm:text-3xl mb-3 sm:mb-4">
                        {service.icon || '🛠️'}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
                        {service.description || 'Professional service'}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="inline-block bg-blue-100 text-blue-800 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                          {service.category || 'General'}
                        </span>
                        <span className="font-bold text-gray-900 text-sm sm:text-base">
                          {service.rate_type === 'hourly' ? `$${service.hourly_rate}/hr` : 
                           service.rate_type === 'fixed' ? `$${service.fixed_rate}` : 
                           `From $${service.hourly_rate}/hr`}
                        </span>
                      </div>
                    </div>
                    <Link 
                      to={`/services/${service.id}`}
                      className="block w-full py-2.5 sm:py-3 bg-gray-100 text-center text-blue-600 font-medium hover:bg-gray-200 transition-colors text-sm sm:text-base"
                    >
                      View Details
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="text-center mt-10 sm:mt-12">
            <Link
              to="/services"
              className="inline-block px-6 py-2.5 sm:px-8 sm:py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-sm sm:text-base"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="w-full py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Top Rated Providers
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Trusted professionals ready to help with your home needs
            </p>
          </div>

          {error.providers ? (
            <div className="text-center py-10 sm:py-12">
              <p className="text-red-500 text-lg sm:text-xl mb-4">{error.providers}</p>
              <button 
                onClick={fetchProviders}
                className="px-5 py-2.5 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {loading.providers ? (
                <LoadingSkeleton count={3} component={ProviderSkeleton} />
              ) : (
                data.providers.slice(0, 3).map(provider => (
                  <div key={provider.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center mb-5 sm:mb-6">
                        <div className="flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl sm:text-3xl">
                          {provider.name?.charAt(0) || 'P'}
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                            {provider.name}
                          </h3>
                          <p className="text-gray-600 text-sm sm:text-base">
                            {provider.profession || 'Service Professional'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-3 sm:mb-4">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`h-4 w-4 sm:h-5 sm:w-5 ${star <= Math.floor(provider.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-gray-600 text-sm sm:text-base">
                          {provider.rating?.toFixed(1) || '4.5'} ({provider.reviews_count || 0} reviews)
                        </span>
                      </div>
                      
                      {provider.is_approved && (
                        <div className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 mb-3 sm:mb-4">
                          <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified Professional
                        </div>
                      )}
                      
                      <div className="mt-5 sm:mt-6">
                        <Link
                          to={`/providers/${provider.id}`}
                          className="block w-full py-2.5 sm:py-3 bg-blue-600 text-white font-medium text-center rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="text-center mt-10 sm:mt-12">
            <Link
              to="/providers"
              className="inline-block px-6 py-2.5 sm:px-8 sm:py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-sm sm:text-base"
            >
              Browse All Providers
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Get your home service in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-gray-50 p-6 sm:p-8 rounded-xl border border-gray-200">
              <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 text-white text-xl sm:text-2xl font-bold rounded-full mb-5 sm:mb-6 mx-auto">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-center text-gray-900 mb-2 sm:mb-3">
                Find a Service
              </h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">
                Browse our categories or search for the specific service you need
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 sm:p-8 rounded-xl border border-gray-200">
              <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 text-white text-xl sm:text-2xl font-bold rounded-full mb-5 sm:mb-6 mx-auto">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-center text-gray-900 mb-2 sm:mb-3">
                Choose a Provider
              </h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">
                Compare ratings, reviews, and prices to select the right professional
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 sm:p-8 rounded-xl border border-gray-200">
              <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 text-white text-xl sm:text-2xl font-bold rounded-full mb-5 sm:mb-6 mx-auto">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-center text-gray-900 mb-2 sm:mb-3">
                Book & Relax
              </h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">
                Schedule your service and let the professional handle everything
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 sm:py-20 bg-gradient-to-r from-blue-800 to-indigo-900">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-blue-200 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect home service professional
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/register"
              className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
            >
              Sign Up Now
            </Link>
            <Link
              to="/services"
              className="px-6 py-3 sm:px-8 sm:py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors text-sm sm:text-base"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                Services
              </h3>
              <ul className="space-y-2">
                <li><Link to="/services/plumbing" className="text-sm sm:text-base hover:text-white transition-colors">Plumbing</Link></li>
                <li><Link to="/services/electrical" className="text-sm sm:text-base hover:text-white transition-colors">Electrical</Link></li>
                <li><Link to="/services/cleaning" className="text-sm sm:text-base hover:text-white transition-colors">Cleaning</Link></li>
                <li><Link to="/services" className="text-sm sm:text-base hover:text-white transition-colors">All Services</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                Company
              </h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm sm:text-base hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="text-sm sm:text-base hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="text-sm sm:text-base hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="text-sm sm:text-base hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-sm sm:text-base hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/safety" className="text-sm sm:text-base hover:text-white transition-colors">Safety</Link></li>
                <li><Link to="/faq" className="text-sm sm:text-base hover:text-white transition-colors">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-sm sm:text-base hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm sm:text-base hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs sm:text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} HomeService Pro. All rights reserved.
            </p>
            <div className="flex space-x-4 sm:space-x-6">
              <Link to="#" className="hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="#" className="hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link to="#" className="hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

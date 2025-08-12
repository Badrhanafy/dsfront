import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiClock, FiDollarSign, FiMapPin, FiCalendar, FiCheckCircle, FiStar, FiUser } from "react-icons/fi";
import Navbar from '../../components/navbar';


const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchService = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/services/${id}`);
        setService(response.data.data.service);
        setProvider(response.data.data.provider);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-6 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!service || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Navbar/>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">Service not found</p>
          <Link
            to="/services"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FiStar key={i} className="text-yellow-400 fill-current" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FiStar key={i} className="text-yellow-400 fill-current opacity-50" />);
      } else {
        stars.push(<FiStar key={i} className="text-gray-300" />);
      }
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <div>
                <Link to="/" className="text-gray-400 hover:text-gray-500">
                  <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span className="sr-only">Home</span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link to="/services" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Services
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-4 text-sm font-medium text-gray-500">{service.title}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Main Content */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {/* Service Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
                <div className="mt-2 flex items-center">
                  <Link 
                    to={`/services?category=${service.category}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                  >
                    {service.category}
                  </Link>
                  {service.is_available && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FiCheckCircle className="mr-1" /> Available
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="text-3xl font-bold text-gray-900">
                  {service.rate_type === 'hourly' ? `$${service.hourly_rate}/hr` : 
                   service.rate_type === 'fixed' ? `$${service.fixed_rate}` : 
                   `From $${service.hourly_rate}/hr`}
                </span>
              </div>
            </div>
          </div>

          {/* Service Content */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Service Details */}
              <div className="md:col-span-2">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Service Details
                    </button>
                    <button
                      onClick={() => setActiveTab('availability')}
                      className={`${activeTab === 'availability' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Availability
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`${activeTab === 'reviews' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Reviews
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                  {activeTab === 'details' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">About this service</h3>
                      <div className="mt-4 prose prose-blue text-gray-500">
                        <p>{service.description}</p>
                      </div>

                      <div className="mt-8">
                        <h4 className="text-sm font-medium text-gray-900">Service areas</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {service.service_areas?.length > 0 ? (
                            service.service_areas.map((area, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <FiMapPin className="mr-1" /> {area}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No specific service areas defined</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-8">
                        <h4 className="text-sm font-medium text-gray-900">Skills & Expertise</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {provider.skills?.length > 0 ? (
                            provider.skills.map((skill, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No skills listed</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'availability' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Availability</h3>
                      <div className="mt-4">
                        {service.availability ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(service.availability).map(([day, times]) => (
                              <div key={day} className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium capitalize">{day}</h4>
                                {times.length > 0 ? (
                                  <ul className="mt-2 space-y-1">
                                    {times.map((time, index) => (
                                      <li key={index} className="flex items-center text-sm text-gray-600">
                                        <FiClock className="mr-2" /> {time}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="mt-2 text-sm text-gray-500">Not available</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">Availability not specified</p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
                      <div className="mt-6">
                        <div className="flex items-center">
                          <div className="flex items-center">
                            {renderRatingStars(provider.rating)}
                          </div>
                          <span className="ml-2 text-gray-600">
                            {provider.rating?.toFixed(1)} ({provider.reviews_count || 0} reviews)
                          </span>
                        </div>
                        <p className="mt-4 text-gray-500">
                          Reviews will be displayed here. This is a placeholder for future implementation.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Provider Card */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {provider.avatar ? (
                          <img className="h-16 w-16 rounded-full" src={provider.avatar} alt={provider.name} />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                            {provider.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link to={`/providers/${provider.id}`} className="hover:text-blue-600 transition-colors">
                            {provider.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-500">{provider.profession}</p>
                        <div className="mt-1 flex items-center">
                          {renderRatingStars(provider.rating)}
                          <span className="ml-2 text-sm text-gray-600">
                            ({provider.reviews_count || 0} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <FiUser className="flex-shrink-0 mr-2 text-gray-400" />
                        <span>{provider.years_of_experience || '0'} years experience</span>
                      </div>
                      {provider.certifications?.length > 0 && (
                        <div className="text-sm">
                          <h4 className="font-medium text-gray-900 mb-1">Certifications</h4>
                          <ul className="space-y-1">
                            {provider.certifications.map((cert, index) => (
                              <li key={index} className="flex items-center text-gray-600">
                                <FiCheckCircle className="flex-shrink-0 mr-2 text-green-500" />
                                {cert}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50">
                    <Link
                      to={`/providers/${provider.id}`}
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      View Full Profile
                    </Link>
                  </div>
                </div>

                {/* Booking Card */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-5">
                    <h3 className="text-lg font-medium text-gray-900">Book this service</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="date"
                            name="date"
                            id="date"
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <select
                            id="time"
                            name="time"
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-10 py-2 sm:text-sm border-gray-300 rounded-md"
                          >
                            <option>9:00 AM</option>
                            <option>10:00 AM</option>
                            <option>11:00 AM</option>
                            <option>12:00 PM</option>
                            <option>1:00 PM</option>
                            <option>2:00 PM</option>
                            <option>3:00 PM</option>
                            <option>4:00 PM</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50">
                    <button
                      type="button"
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
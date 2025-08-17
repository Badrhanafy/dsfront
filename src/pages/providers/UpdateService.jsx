import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FiX, FiUpload, FiClock, FiCheck } from 'react-icons/fi';

const UpdateService = ({ service, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: service?.title || '',
    description: service?.description || '',
    category: service?.category || '',
    min_duration: service?.min_duration || 30,
    is_available: service?.is_available ?? true,
    image: null
  });
  
  const [previewImage, setPreviewImage] = useState(
    service?.image ? `http://localhost:8000/storage/${service.image}` : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'preview'

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const data = new FormData();
      data.append('_method', 'PUT');
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('min_duration', String(formData.min_duration));
      data.append('is_available', formData.is_available ? '1' : '0');
      if (formData.image) {
        data.append('image', formData.image);
      }

      const response = await axios.post(
        `http://localhost:8000/api/services/update/${service.id}`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      onUpdate(response.data.service);
      onClose();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: ['Failed to update service. Please try again.'] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-black/60 border-b border-white/10 p-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              Edit Service
            </h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'form' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}
            >
              Edit Details
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'preview' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}
            >
              Live Preview
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col md:flex-row">
            {/* Form */}
            <div className={`w-full md:w-1/2 p-6 ${activeTab === 'form' ? 'block' : 'hidden md:block'}`}>
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <div className="p-3 bg-red-900/50 text-red-300 rounded-lg text-sm">
                    {errors.general}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title[0]}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description[0]}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                  {errors.category && <p className="mt-1 text-sm text-red-400">{errors.category[0]}</p>}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Minimum Duration (minutes) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="min_duration"
                      value={formData.min_duration}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                    <FiClock className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  {errors.min_duration && <p className="mt-1 text-sm text-red-400">{errors.min_duration[0]}</p>}
                </div>

                {/* Availability */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleChange}
                    className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Service is currently available
                  </label>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Service Image
                  </label>
                  <div className="relative group">
                    <div className="w-full h-40 bg-gray-800 border-2 border-dashed border-white/10 rounded-lg overflow-hidden flex items-center justify-center">
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <FiUpload className="mx-auto text-gray-400 group-hover:text-yellow-400 transition w-8 h-8" />
                          <p className="mt-2 text-sm text-gray-400">Click to upload image (JPEG, PNG, JPG, GIF)</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      name="image"
                      onChange={handleImageChange}
                      accept="image/jpeg,image/png,image/jpg,image/gif"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  {errors.image && <p className="mt-1 text-sm text-red-400">{errors.image[0]}</p>}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 bg-transparent border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-500 transition flex items-center justify-center min-w-24"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Update Service'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Preview */}
            <div className={`w-full md:w-1/2 p-6 bg-gray-900/50 ${activeTab === 'preview' ? 'block' : 'hidden md:block'}`}>
              <div className="sticky top-6">
                <h3 className="text-lg font-medium text-white mb-4">Service Preview</h3>
                
                <div className="bg-gray-800 rounded-xl overflow-hidden border border-white/10">
                  {/* Service Image */}
                  <div className="h-48 bg-gray-700 relative overflow-hidden">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt={formData.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                        <span className="text-gray-400">No image selected</span>
                      </div>
                    )}
                  </div>

                  {/* Service Details */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-white">{formData.title || 'Service Title'}</h4>
                      {formData.is_available ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200">
                          Unavailable
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-400 mb-3">
                      <span className="inline-flex items-center">
                        <FiClock className="mr-1" />
                        {formData.min_duration || 30} min
                      </span>
                      <span className="mx-2">•</span>
                      <span>{formData.category || 'Category'}</span>
                    </div>

                    <p className="text-gray-300 mb-4">
                      {formData.description || 'Service description will appear here.'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                          <FiCheck className="text-black w-4 h-4" />
                        </div>
                        <span className="text-sm text-gray-300">Instant Booking</span>
                      </div>
                      <button className="px-4 py-2 bg-yellow-500 text-black text-sm font-medium rounded-lg hover:bg-yellow-400 transition">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-400">
                  <p>Changes will be reflected in real-time as you edit the form.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateService;
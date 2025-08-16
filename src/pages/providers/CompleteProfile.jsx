import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, Image as ImageIcon, MapPin, Phone, Briefcase, Calendar, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import * as z from 'zod';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Form validation schema
axios.defaults.withCredentials = true;
const profileFormSchema = z.object({
  phone: z.string()
    .min(6, 'Phone number is too short')
    .max(20, 'Phone number is too long')
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{3,6}$/, 'Invalid phone number'),
  city: z.string().min(2, 'City is required').max(100),
  location: z.string().min(5, 'Address is required'),
  location_link: z.string().url('Please enter a valid Google Maps URL'),
  profession: z.string().min(2, 'Profession is required').max(100),
  bio: z.string().max(500).optional(),
  years_of_experience: z.number().int().min(0).max(50),
  avatar: z.any()
    .refine(file => file?.size > 0, 'Avatar is required')
    .refine(file => file?.size <= 2 * 1024 * 1024, 'File size must be less than 2MB'),
});

export function CompleteProfile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isProvider, setIsProvider] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  // Utility function to get full avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    if (avatarPath.startsWith('profiles/')) {
      return `http://localhost:8000/storage/${avatarPath}`;
    }
    return `http://localhost:8000/storage/profiles/${avatarPath}`;
  };

  // Load and verify user data on component mount
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('userData');

      if (!token || !storedUser) {
        navigate('/login');
        return;
      }

      try {
        // Parse stored user data
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        
        if (parsedUser.role !== 'provider') {
          toast.error('Only providers can access this page');
          navigate('/dashboard');
        } else {
          setIsProvider(true);
          
          // Load profile data from userData if available
          if (parsedUser.profile) {
            setProfileData(parsedUser.profile);
            if (parsedUser.profile.avatar) {
              setPreview(getAvatarUrl(parsedUser.profile.avatar));
            }
          }

          // Try to load existing profile data from API
          try {
            const profileResponse = await axios.get('http://localhost:8000/api/provider/profile', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (profileResponse.data) {
              setProfileData(profileResponse.data);
              if (profileResponse.data.avatar) {
                setPreview(getAvatarUrl(profileResponse.data.avatar));
              }
            }
          } catch (profileError) {
            console.log('No existing profile found from API, using localStorage data');
          }
        }
      } catch (error) {
        console.error('User verification failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('userData');
        navigate('/login');
      } finally {
        setLoadingProfile(false);
      }
    };

    verifyUser();
  }, [navigate]);

  const { 
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      phone: '',
      city: '',
      location: '',
      location_link: '',
      profession: '',
      bio: '',
      years_of_experience: 0,
      avatar: null,
    },
    mode: 'onChange'
  });

  // Set form values when profile data is loaded
  useEffect(() => {
    if (profileData) {
      reset({
        phone: profileData.phone || '',
        city: profileData.city || '',
        location: profileData.location || '',
        location_link: profileData.location_link || '',
        profession: profileData.profession || '',
        bio: profileData.bio || '',
        years_of_experience: profileData.years_of_experience || 0,
        avatar: null // We handle avatar separately with preview
      });
    }
  }, [profileData, reset]);

  // Check if profile is complete whenever form values change
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      checkProfileCompletion();
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const checkProfileCompletion = () => {
    const fields = [
      'phone',
      'city',
      'location',
      'location_link',
      'profession',
      'years_of_experience',
      'avatar'
    ];
    
    const completed = fields.filter(field => {
      const value = getValues(field);
      return value && (typeof value !== 'object' || value.size > 0);
    }).length;
    
    setIsProfileComplete(completed === fields.length);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif']
    },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024,
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0];
      setValue('avatar', file, { shouldValidate: true });
      setPreview(URL.createObjectURL(file));
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      
      // Append all required fields to FormData
      formData.append('phone', data.phone);
      formData.append('city', data.city);
      formData.append('location', data.location);
      formData.append('location_link', data.location_link);
      formData.append('profession', data.profession);
      formData.append('bio', data.bio || '');
      formData.append('years_of_experience', data.years_of_experience);
      
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const response = await axios.post(
        'http://localhost:8000/api/complete-provider-profile',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      // Update preview with the new avatar path
      if (response.data.avatar) {
        setPreview(getAvatarUrl(response.data.avatar));
      }

      toast.success('Profile updated successfully!');
      navigate('/provider/dashboard');
      
    } catch (error) {
      console.error('Update error:', error);
      
      if (error.response) {
        if (error.response.status === 422) {
          const errors = error.response.data.errors;
          Object.keys(errors).forEach(key => {
            toast.error(`${key}: ${errors[key][0]}`);
          });
        } else if (error.response.status === 404) {
          toast.error('API endpoint not found. Please check the URL.');
        } else {
          toast.error(error.response.data.message || 'Update failed');
        }
      } else if (error.request) {
        toast.error('Network error - please check your connection');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const completionPercentage = () => {
    const fields = [
      'phone',
      'city',
      'location',
      'location_link',
      'profession',
      'years_of_experience',
      'avatar'
    ];
    const completed = fields.filter(field => {
      const value = getValues(field);
      return value && (typeof value !== 'object' || value.size > 0);
    }).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loadingProfile || !userData || !isProvider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
          </div>
          <motion.p 
            className="mt-4 text-lg text-slate-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading your profile information...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card mt-12 rounded-2xl overflow-hidden flex flex-col lg:flex-row"
        >
          {/* Left Side - Progress and Overview */}
          <div className="lg:w-1/3 bg-gradient-to-br from-cyan-900/80 to-purple-900/80 p-8 md:p-10 flex flex-col">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-white">
                Complete Your Profile
              </h1>
              <p className="mt-2 text-slate-300">
                {profileData ? 'Update your provider details' : 'Set up your provider profile to start offering services'}
              </p>
              
              {/* Progress Bar */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-300">
                    Profile Completion
                  </span>
                  <span className="text-sm font-medium text-cyan-300">
                    {completionPercentage()}%
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2.5">
                  <motion.div 
                    className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2.5 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${completionPercentage()}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Profile Completion Animation */}
              {isProfileComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-green-200">Profile Complete!</h3>
                      <p className="text-sm text-green-300 mt-1">
                        All required fields are filled. You can now submit your profile.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Profile Tips */}
              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-400 mt-0.5">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Complete All Fields</h4>
                    <p className="text-sm text-slate-300 mt-1">Fill in all required information to increase your visibility</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-purple-500/20 text-purple-400 mt-0.5">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Professional Details</h4>
                    <p className="text-sm text-slate-300 mt-1">Highlight your skills and experience to attract more clients</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-400 mt-0.5">
                    <MapPin className="w-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Location Accuracy</h4>
                    <p className="text-sm text-slate-300 mt-1">Provide accurate location details for better service matching</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:w-2/3 p-8 md:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Avatar Upload Section */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <label className="block text-sm font-medium text-slate-300">
                  Profile Picture
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <input {...getInputProps()} />
                  {preview ? (
                    <div className="flex flex-col items-center">
                      <motion.div 
                        className="w-24 h-24 mb-4 border-2 border-white shadow-lg rounded-full overflow-hidden"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      </motion.div>
                      <p className="text-sm text-slate-400">Click to change or drag another image</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="mx-auto h-24 w-24 rounded-full bg-slate-800/50 mb-4 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-slate-500" />
                      </div>
                      <p className="text-sm text-slate-400">
                        {isDragActive ? 'Drop your photo here' : 'Drag & drop your photo here, or click to select'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 2MB</p>
                    </div>
                  )}
                </div>
                {errors.avatar && (
                  <p className="flex items-center text-sm font-medium text-red-400">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.avatar.message}
                  </p>
                )}
              </motion.div>

              {/* Contact Information Section */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
                  <div className="bg-cyan-500/20 p-2 rounded-lg">
                    <Phone className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Contact Information</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="+1 234 567 890"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg shadow-sm bg-slate-800/50 border focus:outline-none focus:ring-1 ${
                          errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'
                        }`}
                        {...register('phone')}
                        defaultValue={profileData?.phone || ''}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-500" />
                      </div>
                    </div>
                    {errors.phone && (
                      <p className="mt-1 flex items-center text-sm text-red-400">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1">
                      City *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="New York"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg shadow-sm bg-slate-800/50 border focus:outline-none focus:ring-1 ${
                          errors.city ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'
                        }`}
                        {...register('city')}
                        defaultValue={profileData?.city || ''}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-slate-500" />
                      </div>
                    </div>
                    {errors.city && (
                      <p className="mt-1 flex items-center text-sm text-red-400">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Location Section */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Location Details</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1">
                      Full Address *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="123 Main St, Apt 4B"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg shadow-sm bg-slate-800/50 border focus:outline-none focus:ring-1 ${
                          errors.location ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'
                        }`}
                        {...register('location')}
                        defaultValue={profileData?.location || ''}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-slate-500" />
                      </div>
                    </div>
                    {errors.location && (
                      <p className="mt-1 flex items-center text-sm text-red-400">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1">
                      Google Maps Link *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="https://maps.google.com/..."
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg shadow-sm bg-slate-800/50 border focus:outline-none focus:ring-1 ${
                          errors.location_link ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'
                        }`}
                        {...register('location_link')}
                        defaultValue={profileData?.location_link || ''}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-slate-500" />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Share your location link from Google Maps
                    </p>
                    {errors.location_link && (
                      <p className="mt-1 flex items-center text-sm text-red-400">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.location_link.message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Professional Information Section */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
                  <div className="bg-cyan-500/20 p-2 rounded-lg">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Professional Information</h3>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1">
                      Profession *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Plumber, Electrician, etc."
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg shadow-sm bg-slate-800/50 border focus:outline-none focus:ring-1 ${
                          errors.profession ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'
                        }`}
                        {...register('profession')}
                        defaultValue={profileData?.profession || ''}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-slate-500" />
                      </div>
                    </div>
                    {errors.profession && (
                      <p className="mt-1 flex items-center text-sm text-red-400">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.profession.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1">
                      Years of Experience *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        placeholder="5"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg shadow-sm bg-slate-800/50 border focus:outline-none focus:ring-1 ${
                          errors.years_of_experience ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'
                        }`}
                        {...register('years_of_experience', { valueAsNumber: true })}
                        defaultValue={profileData?.years_of_experience || 0}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-slate-500" />
                      </div>
                    </div>
                    {errors.years_of_experience && (
                      <p className="mt-1 flex items-center text-sm text-red-400">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.years_of_experience.message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Bio Section */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <User className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">About You</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Bio (Optional)
                  </label>
                  <textarea
                    placeholder="Tell clients about your skills and experience..."
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-1 min-h-[120px] bg-slate-800/50 ${
                      errors.bio ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'
                    }`}
                    {...register('bio')}
                    defaultValue={profileData?.bio || ''}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    This will be displayed on your public profile (Max 500 characters)
                  </p>
                  {errors.bio && (
                    <p className="mt-1 flex items-center text-sm text-red-400">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.bio.message}
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="pt-6"
              >
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-medium rounded-lg shadow-lg transition-all ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      {profileData ? 'Update Profile' : 'Complete Profile'}
                    </div>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
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
}
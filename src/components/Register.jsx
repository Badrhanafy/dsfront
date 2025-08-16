import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader2, CheckCircle2, AlertCircle, User, Briefcase, Lock, Mail, MapPin, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const schema = yup.object().shape({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase, one lowercase, one number and one special character'
    ),
  password_confirmation: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Password confirmation is required'),
  role: yup.string().required('Please select a role').oneOf(['client', 'provider'], 'Invalid role'),
});

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: 'client'
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Step 1: Register the user
      const registerResponse = await axios.post('http://localhost:8000/api/register', data, {
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      // Step 2: Automatically log the user in
      const loginResponse = await axios.post('http://localhost:8000/api/login', {
        email: data.email,
        password: data.password
      });

      // Store authentication data
      localStorage.setItem('access_token', loginResponse.data.token);
      
      // Create complete user data object with role
      const userData = {
        ...loginResponse.data.user,
        role: data.role
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));

      toast.success('Registration successful! You are now logged in.');

      // Redirect based on role
      if (data.role === 'provider') {
        // For providers, redirect to profile completion
        navigate(`/profile/complete/${loginResponse.data.user.id}`);
      } else {
        // For clients, redirect to home page
        navigate('/');
      }

    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error.response) {
        // Handle validation errors from API
        if (error.response.data?.errors) {
          errorMessage = Object.values(error.response.data.errors).join('\n');
        } else {
          errorMessage = error.response.data?.message || 
                        error.response.data?.error || 
                        `Registration failed (Status: ${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please try again later.';
      } else {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card mt-16 rounded-2xl overflow-hidden w-full max-w-6xl flex flex-col lg:flex-row"
      >
        {/* Left Side - Branding and Info */}
        <div className="lg:w-1/2 bg-gradient-to-br from-cyan-900/80 to-purple-900/80 p-8 md:p-12 flex flex-col justify-between">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-300">
                ServiceHub
              </span>
            </Link>
            
            {/* Large Image at the start of the text */}
            <div className="mt-6 w-full flex justify-center">
              <motion.img 
                src="Dari Services.png" 
                alt="ServiceHub Illustration"
                className="w-full max-w-md h-auto object-contain"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Join Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">Premium</span> Network
              </h1>
              <p className="mt-4 text-slate-300 max-w-md">
                Connect with top professionals or showcase your services to thousands of clients worldwide.
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-white">Global Reach</h4>
                <p className="text-sm text-slate-300">Connect with clients worldwide</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-purple-500/20 text-purple-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-white">Premium Services</h4>
                <p className="text-sm text-slate-300">Top-rated professionals</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-white">Verified Providers</h4>
                <p className="text-sm text-slate-300">Rigorous vetting process</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-purple-500/20 text-purple-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-white">Secure Platform</h4>
                <p className="text-sm text-slate-300">Your data is protected</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="lg:w-1/2 p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
            <p className="mt-2 text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300">
                Sign in here
              </Link>
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    {...register('name')}
                    className={`block w-full pl-10 pr-4 py-3 rounded-lg shadow-sm bg-slate-800/50 border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'} focus:outline-none focus:ring-1`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className={`block w-full pl-10 pr-4 py-3 rounded-lg shadow-sm bg-slate-800/50 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'} focus:outline-none focus:ring-1`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    {...register('password')}
                    className={`block w-full pl-10 pr-4 py-3 rounded-lg shadow-sm bg-slate-800/50 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'} focus:outline-none focus:ring-1`}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    autoComplete="new-password"
                    {...register('password_confirmation')}
                    className={`block w-full pl-10 pr-4 py-3 rounded-lg shadow-sm bg-slate-800/50 border ${errors.password_confirmation ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'} focus:outline-none focus:ring-1`}
                    placeholder="••••••••"
                  />
                  {errors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password_confirmation.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  I want to register as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      id="client"
                      name="role"
                      type="radio"
                      value="client"
                      className="sr-only peer"
                      {...register('role')}
                    />
                    <label
                      htmlFor="client"
                      className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        watch('role') === 'client' 
                          ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300' 
                          : 'border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      <User className="h-6 w-6 mb-2" />
                      <span className="font-medium">Client</span>
                      <span className="text-xs text-slate-400 mt-1">Looking for services</span>
                    </label>
                  </div>
                  <div>
                    <input
                      id="provider"
                      name="role"
                      type="radio"
                      value="provider"
                      className="sr-only peer"
                      {...register('role')}
                    />
                    <label
                      htmlFor="provider"
                      className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        watch('role') === 'provider' 
                          ? 'border-purple-400 bg-purple-500/10 text-purple-300' 
                          : 'border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      <Briefcase className="h-6 w-6 mb-2" />
                      <span className="font-medium">Provider</span>
                      <span className="text-xs text-slate-400 mt-1">Offering services</span>
                    </label>
                  </div>
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.role.message}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-70 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="-ml-1 mr-2 h-4 w-4" />
                      Create account
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
      
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

export default Register;
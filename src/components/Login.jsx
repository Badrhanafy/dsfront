import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader2, AlertCircle, CheckCircle, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from './navbar';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email: data.email,
        password: data.password
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.access_token || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));

      if (!localStorage.getItem('access_token')) {
        throw new Error('Failed to store authentication token');
      }

      if (onLogin) {
        onLogin(response.data.user);
      }

      toast.success('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1000);

    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'An error occurred during login';
      
      if (error.response) {
        if (error.response.status === 422 && error.response.data.errors) {
          const firstError = Object.values(error.response.data.errors)[0][0];
          errorMessage = firstError || 'Validation error';
        } 
        else if (error.response.status === 401) {
          errorMessage = 'Invalid credentials. Please try again.';
        }
        else {
          errorMessage = error.response.data?.message || 
                        error.response.data?.error || 
                        `Login failed (Status: ${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      localStorage.removeItem('access_token');
      localStorage.removeItem('userData');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      
      <div className="flex items-center justify-center p-4 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl overflow-hidden w-full max-w-4xl flex flex-col lg:flex-row"
        >
          {/* Left Side - Branding and Info */}
          <div className="lg:w-1/2 bg-gradient-to-br from-cyan-900/80 to-purple-900/80 p-8 md:p-12 flex flex-col justify-center">
            <div className="text-center lg:text-left">
              <Link to="/" className="flex items-center justify-center lg:justify-start gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-300">
                  ServiceHub
                </span>
              </Link>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Welcome Back
                </h1>
                <p className="mt-4 text-slate-300">
                  Sign in to access your premium account and continue your journey with us.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <div className="flex items-center justify-center lg:justify-start gap-3 p-4 bg-slate-800/30 rounded-lg">
                  <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Secure Authentication</h4>
                    <p className="text-sm text-slate-300">Your data is always protected</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 p-8 md:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white">Sign In</h2>
              <p className="mt-2 text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
                  Register here
                </Link>
              </p>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                      className={`block w-full pl-10 pr-4 py-3 rounded-lg shadow-sm bg-slate-800/50 border ${
                        errors.email ? 'border-red-500 focus:ring-red-500' 
                        : 'border-slate-700 focus:ring-cyan-500'
                      } focus:outline-none focus:ring-1`}
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
                      autoComplete="current-password"
                      {...register('password')}
                      className={`block w-full pl-10 pr-4 py-3 rounded-lg shadow-sm bg-slate-800/50 border ${
                        errors.password ? 'border-red-500 focus:ring-red-500' 
                        : 'border-slate-700 focus:ring-cyan-500'
                      } focus:outline-none focus:ring-1`}
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-slate-700 rounded bg-slate-800/50"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-cyan-400 hover:text-cyan-300">
                      Forgot password?
                    </Link>
                  </div>
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
                        Signing in...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="-ml-1 mr-2 h-4 w-4" />
                        Sign In
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-800 text-slate-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center py-2 px-4 border border-slate-700 rounded-lg shadow-sm bg-slate-800/50 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <div>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center py-2 px-4 border border-slate-700 rounded-lg shadow-sm bg-slate-800/50 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 01.98 16.41a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
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
};

export default Login;
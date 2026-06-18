import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api.js';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const response = await API.post('/auth/register', formData);

      // Auto-login after registration (optional)
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));

      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold text-white">Create Account</h2>
        
        {error && (
          <div className="mb-4 rounded bg-red-500/10 p-3 text-center text-red-500 border border-red-500/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              className="w-full rounded-md border border-gray-700 bg-gray-700 p-3 text-white focus:border-blue-500 focus:outline-none"
              placeholder="John Doe"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-md border border-gray-700 bg-gray-700 p-3 text-white focus:border-blue-500 focus:outline-none"
              placeholder="john@example.com"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-md border border-gray-700 bg-gray-700 p-3 text-white focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              className="w-full rounded-md border border-gray-700 bg-gray-700 p-3 text-white focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { GraduationCap, Lock, Mail, User, Phone, BookOpen, Award, Calendar, ArrowRight } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    roll_number: '',
    department: 'Computer Science',
    batch_year: 2026,
    cgpa: 8.0,
    phone: '',
  });

  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'batch_year' ? parseInt(value) || 2026 : name === 'cgpa' ? parseFloat(value) || 0.0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await register({
      ...formData,
      role: 'STUDENT',
    });
    if (result.success) {
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 py-8">
      <div className="w-full max-w-xl">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-lg mb-2">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Student Registration</h1>
          <p className="text-slate-400 text-xs">Create your profile to access campus recruitment drives</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@placement.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Roll / Registration No.</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    name="roll_number"
                    value={formData.roll_number}
                    onChange={handleChange}
                    placeholder="e.g. 2022CS101"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Branch</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-white"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics & Communication</option>
                  <option value="Electrical">Electrical Engineering</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                </select>
              </div>

              {/* CGPA */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current CGPA (0 - 10)</label>
                <div className="relative">
                  <Award className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleChange}
                    placeholder="8.5"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              {/* Batch Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Passing Batch Year</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    required
                    name="batch_year"
                    value={formData.batch_year}
                    onChange={handleChange}
                    placeholder="2026"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91-9876543210"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-sm shadow-indigo-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

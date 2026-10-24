import React, { useState, useEffect } from 'react';
import { studentsApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  User, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileDown, 
  Save, 
  BookOpen, 
  Award 
} from 'lucide-react';

export default function Profile() {
  const { user, studentProfile, setStudentProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    roll_number: '',
    department: '',
    batch_year: 2026,
    cgpa: 0.0,
    phone: '',
    skills: '',
  });

  // Resume upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await studentsApi.getMyProfile();
      setStudentProfile(res.data);
      setProfileData({
        roll_number: res.data.roll_number || '',
        department: res.data.department || 'Computer Science',
        batch_year: res.data.batch_year || 2026,
        cgpa: res.data.cgpa || 0.0,
        phone: res.data.phone || '',
        skills: res.data.skills || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setStatusMessage(null);
      const res = await studentsApi.updateMyProfile({
        ...profileData,
        cgpa: parseFloat(profileData.cgpa),
        batch_year: parseInt(profileData.batch_year),
      });
      setStudentProfile(res.data);
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update profile.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setStatusMessage({ type: 'error', text: 'Please select a valid PDF file.' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage({ type: 'error', text: 'File size exceeds maximum allowed 5 MB limit.' });
        return;
      }
      setSelectedFile(file);
      setStatusMessage(null);
    }
  };

  const handleUploadResume = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setStatusMessage(null);
      const formData = new FormData();
      formData.append('file', selectedFile);

      await studentsApi.uploadResume(formData);
      setStatusMessage({ type: 'success', text: 'Resume uploaded and verified successfully!' });
      setSelectedFile(null);
      fetchProfile();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to upload resume.',
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading student profile..." />;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Profile & Resume</h1>
        <p className="text-sm text-slate-500">Keep your academic details and resume up-to-date for campus drives</p>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-xs font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Resume Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Recruitment Resume (PDF)</h3>
            <p className="text-xs text-slate-500">Shared directly with participating recruiters when you apply</p>
          </div>
        </div>

        {/* Current Resume Info */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {studentProfile?.resume_filename ? (
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {studentProfile.resume_original_name || studentProfile.resume_filename}
                </p>
                <p className="text-[11px] text-slate-400">
                  Uploaded on{' '}
                  {studentProfile.resume_uploaded_at
                    ? new Date(studentProfile.resume_uploaded_at).toLocaleString()
                    : 'Recently'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-amber-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-semibold">No resume uploaded yet. You cannot apply to drives without a resume.</p>
            </div>
          )}

          {studentProfile?.resume_filename && (
            <a
              href={studentsApi.getResumeUrl(studentProfile.resume_filename)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors self-start sm:self-auto"
            >
              <FileDown className="w-4 h-4" />
              <span>Download / Preview</span>
            </a>
          )}
        </div>

        {/* Upload Form */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Upload New Resume (PDF only, max 5 MB)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            <button
              type="button"
              onClick={handleUploadResume}
              disabled={!selectedFile || uploading}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Academic Details Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Academic & Contact Information</h3>
            <p className="text-xs text-slate-500">Used for automated eligibility calculation in placement drives</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.full_name || ''}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">College Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Roll / University Registration No. *</label>
              <input
                type="text"
                required
                value={profileData.roll_number}
                onChange={(e) => setProfileData({ ...profileData, roll_number: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Branch *</label>
              <select
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:border-indigo-600"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics & Communication</option>
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Cumulative CGPA *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={profileData.cgpa}
                onChange={(e) => setProfileData({ ...profileData, cgpa: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Batch Year *</label>
              <input
                type="number"
                required
                value={profileData.batch_year}
                onChange={(e) => setProfileData({ ...profileData, batch_year: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+91-..."
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Skills & Highlights</label>
              <input
                type="text"
                value={profileData.skills}
                onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                placeholder="Python, React, FastApi, SQL, AWS"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-300 transition-all disabled:opacity-50"
            >
              {savingProfile ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

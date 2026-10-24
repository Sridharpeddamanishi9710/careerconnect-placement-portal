import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, applicationsApi, drivesApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Sparkles, 
  AlertCircle, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Building2, 
  Upload 
} from 'lucide-react';

export default function StudentDashboard() {
  const { studentProfile } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyingDriveId, setApplyingDriveId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getStudentSummary();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (driveId) => {
    if (!studentProfile?.resume_filename) {
      setActionMessage({ type: 'error', text: 'Please upload your resume before applying!' });
      return;
    }

    try {
      setApplyingDriveId(driveId);
      setActionMessage(null);
      await applicationsApi.apply(driveId);
      setActionMessage({ type: 'success', text: 'Application submitted successfully!' });
      fetchStats();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Application submission failed.'
      });
    } finally {
      setApplyingDriveId(null);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading your placement dashboard..." />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Toast Alert Message */}
      {actionMessage && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Placement Celebration Banner */}
      {stats.is_placed && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Congratulations! You are Placed 🎉</h2>
              <p className="text-sm text-emerald-100 mt-0.5">
                Selected by <span className="font-bold underline text-white">{stats.placed_company_name}</span> with a package of{' '}
                <span className="font-extrabold text-white">₹{stats.placed_package_lpa} LPA</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Missing Resume Warning Banner */}
      {!studentProfile?.resume_filename && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Resume Upload Required</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                You haven't uploaded your resume yet. You must upload a PDF resume to apply for placement drives.
              </p>
            </div>
          </div>
          <Link
            to="/student/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Resume Now</span>
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Eligible Opportunities"
          value={stats.eligible_drives_count}
          subtitle="Matching your CGPA & branch"
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="Drives Applied"
          value={stats.applied_drives_count}
          subtitle="Total applications submitted"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="In Progress / Shortlisted"
          value={stats.shortlisted_count}
          subtitle="Active interview rounds"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Job Offers"
          value={stats.offers_count}
          subtitle={stats.is_placed ? 'Offer accepted' : 'Awaiting offers'}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Eligible Drives */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Available Drives For You</h3>
                <p className="text-xs text-slate-500">Upcoming deadlines you qualify for</p>
              </div>
              <Link to="/student/drives" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                View All Drives
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {stats.upcoming_eligible_drives && stats.upcoming_eligible_drives.length > 0 ? (
                stats.upcoming_eligible_drives.map((drive) => (
                  <div key={drive.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{drive.job_title}</h4>
                      <p className="text-xs text-slate-500">
                        {drive.company.name} &bull; <span className="font-semibold text-emerald-600">₹{drive.package_lpa} LPA</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Deadline: {new Date(drive.application_deadline).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      {drive.has_applied ? (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(drive.id)}
                          disabled={applyingDriveId === drive.id}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                        >
                          {applyingDriveId === drive.id ? 'Applying...' : 'Apply Now'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No active upcoming drives found.</p>
              )}
            </div>
          </div>
        </div>

        {/* My Recent Applications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">My Application Tracker</h3>
                <p className="text-xs text-slate-500">Recent application statuses & feedback</p>
              </div>
              <Link to="/student/applications" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Full History
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {stats.recent_applications && stats.recent_applications.length > 0 ? (
                stats.recent_applications.map((app) => (
                  <div key={app.id} className="py-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-800">
                        {app.drive?.job_title}
                      </h4>
                      <StatusBadge status={app.status} type="application" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{app.drive?.company?.name} (₹{app.drive?.package_lpa} LPA)</span>
                      <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                    </div>
                    {app.notes && (
                      <p className="text-xs text-indigo-700 bg-indigo-50/60 p-2 rounded-lg border border-indigo-100/50">
                        💬 <span className="font-medium">{app.notes}</span>
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">You haven't applied to any drives yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

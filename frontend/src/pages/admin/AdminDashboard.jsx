import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Users, 
  Award, 
  Briefcase, 
  Building2, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getAdminSummary();
      setStats(res.data);
    } catch (err) {
      setError('Failed to load dashboard metrics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading analytics..." />;
  if (error) return <div className="p-4 bg-rose-50 text-rose-700 rounded-xl">{error}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Overview</h1>
          <p className="text-sm text-slate-500">Live statistics and placement campaign performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/drives"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition-all"
          >
            <Briefcase className="w-4 h-4" />
            <span>Create Drive</span>
          </Link>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Students"
          value={stats.total_students}
          subtitle={`${stats.placed_students} Placed &bull; ${stats.unplaced_students} Seeking`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Placement Success Rate"
          value={`${stats.placement_rate_percentage}%`}
          subtitle="Percentage of enrolled students placed"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Active Placement Drives"
          value={stats.active_drives}
          subtitle={`${stats.total_drives} Total Drives Hosted`}
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="Partner Companies"
          value={stats.total_companies}
          subtitle={`${stats.total_applications} Total Applications`}
          icon={Building2}
          color="purple"
        />
      </div>

      {/* Package Metrics & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CTC Compensation Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Compensation Highlights</h3>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-6">Packages secured by placed candidates</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Highest CTC Offered</span>
                <span className="text-base font-bold text-emerald-600">₹{stats.package_stats.max_package} LPA</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Average Placement CTC</span>
                <span className="text-base font-bold text-indigo-600">₹{stats.package_stats.avg_package} LPA</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Lowest CTC Offered</span>
                <span className="text-base font-bold text-slate-700">₹{stats.package_stats.min_package} LPA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Department-wise Placement Rates */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Department Performance</h3>
              <p className="text-xs text-slate-500">Placement conversion rate across academic branches</p>
            </div>
            <Link to="/admin/students" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View Students <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 mt-6">
            {stats.department_stats && stats.department_stats.length > 0 ? (
              stats.department_stats.map((dept) => (
                <div key={dept.department} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-slate-800 font-semibold">{dept.department}</span>
                    <span className="text-slate-500">
                      {dept.placed_students} / {dept.total_students} ({dept.placement_rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(dept.placement_rate, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No department statistics available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Drives and Applications Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Drives */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Recent Placement Drives</h3>
            <Link to="/admin/drives" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              All Drives
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recent_drives && stats.recent_drives.length > 0 ? (
              stats.recent_drives.map((drive) => (
                <div key={drive.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{drive.job_title}</h4>
                    <p className="text-xs text-slate-500">{drive.company.name} &bull; ₹{drive.package_lpa} LPA</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={drive.status} type="drive" />
                    <Link
                      to={`/admin/drives/${drive.id}`}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No drives scheduled yet.</p>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Latest Applications</h3>
            <Link to="/admin/applications" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View Tracking
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recent_applications && stats.recent_applications.length > 0 ? (
              stats.recent_applications.map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      {app.student?.user?.full_name || 'Student'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {app.drive?.job_title} @ {app.drive?.company?.name}
                    </p>
                  </div>
                  <StatusBadge status={app.status} type="application" />
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No applications received yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

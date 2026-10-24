import React, { useState, useEffect } from 'react';
import { drivesApi, applicationsApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Briefcase, 
  Search, 
  Calendar, 
  DollarSign, 
  Award, 
  CheckCircle, 
  XCircle, 
  Info, 
  Filter 
} from 'lucide-react';

export default function AvailableDrives() {
  const { studentProfile } = useAuthStore();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchDrives();
  }, [search]);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const res = await drivesApi.getAll({ search: search || undefined });
      setDrives(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (driveId) => {
    if (!studentProfile?.resume_filename) {
      setNotification({
        type: 'error',
        text: 'Please upload your resume in the Profile section before applying.'
      });
      return;
    }

    try {
      setApplyingId(driveId);
      setNotification(null);
      await applicationsApi.apply(driveId);
      setNotification({
        type: 'success',
        text: 'Application submitted successfully! Track its progress in My Applications.'
      });
      fetchDrives();
      if (selectedDrive?.id === driveId) {
        setSelectedDrive((prev) => ({ ...prev, has_applied: true }));
      }
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.response?.data?.detail || 'Application failed.'
      });
    } finally {
      setApplyingId(null);
    }
  };

  const filteredDrives = onlyEligible 
    ? drives.filter((d) => d.is_eligible) 
    : drives;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campus Placement Opportunities</h1>
        <p className="text-sm text-slate-500">Discover and apply for matching full-time roles and internships</p>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-xs font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, role title, or location..."
            className="w-full text-sm outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={onlyEligible}
              onChange={(e) => setOnlyEligible(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0"
            />
            <span>Show Only Eligible Drives</span>
          </label>
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <LoadingSpinner text="Loading campus placement drives..." />
      ) : filteredDrives.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No drives match your criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try toggling eligible filter or clearing your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDrives.map((d) => {
            const isDeadlinePassed = new Date(d.application_deadline) < new Date();
            return (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        {d.company.name}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{d.job_title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{d.job_location}</p>
                    </div>

                    {/* Eligibility Badge */}
                    <div>
                      {d.is_eligible ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200" title="Check CGPA, branch, or batch year requirements">
                          <XCircle className="w-3.5 h-3.5" />
                          Not Eligible
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-medium">
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 font-bold">
                      ₹{d.package_lpa} LPA
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                      Min CGPA: {d.min_cgpa}
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
                      Batch: {d.eligible_batch_year}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-4 line-clamp-3">
                    {d.job_description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Eligible Branches:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[200px]">{d.eligible_departments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deadline:</span>
                      <span className={`font-semibold ${isDeadlinePassed ? 'text-rose-600' : 'text-slate-700'}`}>
                        {new Date(d.application_deadline).toLocaleDateString()} {isDeadlinePassed && '(Expired)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedDrive(d)}
                    className="text-xs font-semibold text-slate-600 hover:text-indigo-600 inline-flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>

                  <div>
                    {d.has_applied ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                        Applied ✓
                      </span>
                    ) : isDeadlinePassed ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold">
                        Deadline Passed
                      </span>
                    ) : !d.is_eligible ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-slate-50 text-slate-400 text-xs font-medium" title="You do not meet minimum CGPA or branch requirements">
                        Ineligible
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(d.id)}
                        disabled={applyingId === d.id}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-sm shadow-indigo-300 transition-all disabled:opacity-50"
                      >
                        {applyingId === d.id ? 'Applying...' : 'Apply Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drive Details Modal */}
      <Modal
        isOpen={!!selectedDrive}
        onClose={() => setSelectedDrive(null)}
        title={selectedDrive?.job_title || 'Drive Details'}
      >
        {selectedDrive && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-indigo-900">{selectedDrive.company.name}</h4>
                <p className="text-indigo-700">{selectedDrive.job_location}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-indigo-600 font-medium">Offered CTC</span>
                <p className="text-lg font-extrabold text-emerald-600">₹{selectedDrive.package_lpa} LPA</p>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-800 mb-1 text-sm">Eligibility Criteria</h5>
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Minimum CGPA:</span>
                  <span className="font-semibold text-slate-800">{selectedDrive.min_cgpa}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Passing Batch:</span>
                  <span className="font-semibold text-slate-800">{selectedDrive.eligible_batch_year}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Allowed Branches:</span>
                  <span className="font-semibold text-slate-800">{selectedDrive.eligible_departments}</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-800 mb-1 text-sm">Job Description & Scope</h5>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 whitespace-pre-line text-slate-700 leading-relaxed">
                {selectedDrive.job_description}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-slate-500">
                Deadline: <strong>{new Date(selectedDrive.application_deadline).toLocaleDateString()}</strong>
              </span>

              {selectedDrive.has_applied ? (
                <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold">
                  Already Applied
                </span>
              ) : selectedDrive.is_eligible ? (
                <button
                  onClick={() => handleApply(selectedDrive.id)}
                  disabled={applyingId === selectedDrive.id}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  {applyingId === selectedDrive.id ? 'Applying...' : 'Apply Now'}
                </button>
              ) : (
                <span className="text-amber-700 font-semibold">Not Eligible to Apply</span>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

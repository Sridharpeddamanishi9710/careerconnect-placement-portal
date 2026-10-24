import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { drivesApi, applicationsApi, studentsApi } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  ArrowLeft, 
  Briefcase, 
  Building2, 
  Calendar, 
  DollarSign, 
  Award, 
  FileDown, 
  CheckCircle2, 
  Users, 
  Filter 
} from 'lucide-react';

export default function DriveDetail() {
  const { id } = useParams();
  const [drive, setDrive] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Status update modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('SHORTLISTED');
  const [statusNotes, setStatusNotes] = useState('');
  const [markPlaced, setMarkPlaced] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Batch selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchStatus, setBatchStatus] = useState('SHORTLISTED');
  const [batchNotes, setBatchNotes] = useState('');

  useEffect(() => {
    fetchDriveAndApplications();
  }, [id, statusFilter]);

  const fetchDriveAndApplications = async () => {
    try {
      setLoading(true);
      const [driveRes, appsRes] = await Promise.all([
        drivesApi.getById(id),
        applicationsApi.getByDrive(id, { status: statusFilter || undefined }),
      ]);
      setDrive(driveRes.data);
      setApplications(appsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setStatusNotes(app.notes || '');
    setMarkPlaced(false);
    setIsModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    try {
      await applicationsApi.updateStatus(selectedApp.id, {
        status: newStatus,
        notes: statusNotes,
        mark_placed: markPlaced,
      });
      setIsModalOpen(false);
      fetchDriveAndApplications();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(applications.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (appId) => {
    setSelectedIds((prev) => 
      prev.includes(appId) ? prev.filter((i) => i !== appId) : [...prev, appId]
    );
  };

  const handleBatchUpdate = async (e) => {
    e.preventDefault();
    try {
      await applicationsApi.batchUpdateStatus({
        application_ids: selectedIds,
        status: batchStatus,
        notes: batchNotes,
      });
      setBatchModalOpen(false);
      setSelectedIds([]);
      fetchDriveAndApplications();
    } catch (err) {
      alert('Batch status update failed.');
    }
  };

  if (loading && !drive) return <LoadingSpinner size="lg" text="Loading drive details..." />;
  if (!drive) return <div className="p-4 bg-rose-50 text-rose-700 rounded-xl">Placement Drive not found.</div>;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/admin/drives"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Drives</span>
      </Link>

      {/* Drive Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {drive.company.name}
              </span>
              <StatusBadge status={drive.status} type="drive" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{drive.job_title}</h1>
            <p className="text-xs text-slate-500 mt-1">{drive.job_location}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">Offered CTC</p>
              <p className="text-xl font-extrabold text-emerald-600">₹{drive.package_lpa} LPA</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block">Min CGPA</span>
            <span className="font-semibold text-slate-800">{drive.min_cgpa}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Eligible Branches</span>
            <span className="font-semibold text-slate-800 truncate block">{drive.eligible_departments}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Batch Year</span>
            <span className="font-semibold text-slate-800">{drive.eligible_batch_year}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Application Deadline</span>
            <span className="font-semibold text-rose-600">
              {new Date(drive.application_deadline).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Applicants Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-800">
              Drive Applicants ({applications.length})
            </h2>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setBatchModalOpen(true)}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Batch Update ({selectedIds.length})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 border rounded-lg bg-slate-50 outline-none text-slate-700"
            >
              <option value="">All Applicant Stages</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="TECHNICAL_ROUND">Technical Round</option>
              <option value="HR_ROUND">HR Round</option>
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {applications.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No applicants found</p>
            <p className="text-xs text-slate-400 mt-0.5">Students who apply will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === applications.length && applications.length > 0}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                  </th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Remarks / Notes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={() => handleToggleSelect(app.id)}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {app.student?.user?.full_name || 'Student'}
                      <div className="text-[10px] text-slate-400 font-normal">{app.student?.user?.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">{app.student?.roll_number}</td>
                    <td className="py-3 px-4">{app.student?.department}</td>
                    <td className="py-3 px-4 font-semibold text-indigo-600">{app.student?.cgpa}</td>
                    <td className="py-3 px-4">
                      {app.student?.resume_filename ? (
                        <a
                          href={studentsApi.getResumeUrl(app.student.resume_filename)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} type="application" />
                    </td>
                    <td className="py-3 px-4 max-w-[200px] truncate text-slate-500">
                      {app.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(app)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        Update Stage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Individual Status Update Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Applicant Status"
      >
        {selectedApp && (
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-500">Applicant:</span>{' '}
              <span className="font-semibold text-slate-800">{selectedApp.student?.user?.full_name}</span> (
              {selectedApp.student?.roll_number})
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Stage *</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:border-indigo-600"
              >
                <option value="APPLIED">APPLIED</option>
                <option value="SHORTLISTED">SHORTLISTED</option>
                <option value="TECHNICAL_ROUND">TECHNICAL ROUND</option>
                <option value="HR_ROUND">HR ROUND</option>
                <option value="SELECTED">SELECTED (OFFER EXTENDED)</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback / Notes</label>
              <textarea
                rows={3}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Remarks, round result, interview schedule details..."
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>

            {newStatus === 'SELECTED' && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <input
                  type="checkbox"
                  id="markPlacedCheck"
                  checked={markPlaced}
                  onChange={(e) => setMarkPlaced(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <label htmlFor="markPlacedCheck" className="text-xs font-semibold text-emerald-800">
                  Automatically mark student as Placed with ₹{drive.package_lpa} LPA package
                </label>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-sm text-slate-600 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
              >
                Save Status
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Batch Update Modal */}
      <Modal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        title={`Batch Update ${selectedIds.length} Applicants`}
      >
        <form onSubmit={handleBatchUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Stage for Selected Students *</label>
            <select
              value={batchStatus}
              onChange={(e) => setBatchStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:border-indigo-600"
            >
              <option value="SHORTLISTED">SHORTLISTED</option>
              <option value="TECHNICAL_ROUND">TECHNICAL ROUND</option>
              <option value="HR_ROUND">HR ROUND</option>
              <option value="SELECTED">SELECTED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback Note (Applied to all)</label>
            <textarea
              rows={2}
              value={batchNotes}
              onChange={(e) => setBatchNotes(e.target.value)}
              placeholder="e.g. Cleared preliminary screening"
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setBatchModalOpen(false)}
              className="px-4 py-2 rounded-lg border text-sm text-slate-600 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
            >
              Apply Batch Update
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { applicationsApi, drivesApi, studentsApi } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, Filter, FileDown, FileText, CheckCircle } from 'lucide-react';

export default function ApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [driveFilter, setDriveFilter] = useState('');

  // Status modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('SHORTLISTED');
  const [statusNotes, setStatusNotes] = useState('');
  const [markPlaced, setMarkPlaced] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDrives();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter, driveFilter]);

  const fetchDrives = async () => {
    try {
      const res = await drivesApi.getAll();
      setDrives(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationsApi.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
        drive_id: driveFilter ? parseInt(driveFilter) : undefined,
      });
      setApplications(res.data);
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
      fetchApplications();
    } catch (err) {
      alert('Failed to update application status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Tracking</h1>
        <p className="text-sm text-slate-500">Monitor candidate recruitment pipelines and interview statuses</p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="flex items-center gap-2 flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or roll number..."
            className="w-full text-sm outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={driveFilter}
            onChange={(e) => setDriveFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 border rounded-lg bg-slate-50 outline-none text-slate-700"
          >
            <option value="">All Placement Drives</option>
            {drives.map((d) => (
              <option key={d.id} value={d.id}>{d.company?.name} - {d.job_title}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 border rounded-lg bg-slate-50 outline-none text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="TECHNICAL_ROUND">Technical Round</option>
            <option value="HR_ROUND">HR Round</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading applications..." />
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No applications found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Roll No.</th>
                  <th className="py-3.5 px-4">Branch</th>
                  <th className="py-3.5 px-4">Company & Role</th>
                  <th className="py-3.5 px-4">CTC</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Resume</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {app.student?.user?.full_name}
                      <div className="text-[10px] text-slate-400 font-normal">{app.student?.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">{app.student?.roll_number}</td>
                    <td className="py-3.5 px-4">{app.student?.department}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{app.drive?.company?.name}</span>
                      <div className="text-[10px] text-slate-500">{app.drive?.job_title}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      ₹{app.drive?.package_lpa} LPA
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} type="application" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(app)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        Change Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for updating application */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Candidate Status"
      >
        {selectedApp && (
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-500">Candidate:</span>{' '}
                <span className="font-semibold text-slate-800">{selectedApp.student?.user?.full_name}</span> (
                {selectedApp.student?.roll_number})
              </div>
              <div className="mt-1">
                <span className="text-slate-500">Target Role:</span>{' '}
                <span className="font-semibold text-slate-800">{selectedApp.drive?.job_title}</span> @{' '}
                {selectedApp.drive?.company?.name} (₹{selectedApp.drive?.package_lpa} LPA)
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Application Stage *</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:border-indigo-600"
              >
                <option value="APPLIED">APPLIED</option>
                <option value="SHORTLISTED">SHORTLISTED</option>
                <option value="TECHNICAL_ROUND">TECHNICAL ROUND</option>
                <option value="HR_ROUND">HR ROUND</option>
                <option value="SELECTED">SELECTED (OFFER MADE)</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Feedback & Notes</label>
              <textarea
                rows={3}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Interview schedule, feedback, or internal notes..."
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>

            {newStatus === 'SELECTED' && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <input
                  type="checkbox"
                  id="markPlacedAdminCheck"
                  checked={markPlaced}
                  onChange={(e) => setMarkPlaced(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <label htmlFor="markPlacedAdminCheck" className="text-xs font-semibold text-emerald-800">
                  Mark student as Placed in profile with this company and CTC
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
                Update Status
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { applicationsApi } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FileText, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationsApi.getMyApplications();
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { key: 'APPLIED', label: 'Application Submitted' },
    { key: 'SHORTLISTED', label: 'Resume Shortlisted' },
    { key: 'TECHNICAL_ROUND', label: 'Technical Assessment' },
    { key: 'HR_ROUND', label: 'HR Interview' },
    { key: 'SELECTED', label: 'Offer Received' },
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case 'APPLIED': return 0;
      case 'SHORTLISTED': return 1;
      case 'TECHNICAL_ROUND': return 2;
      case 'HR_ROUND': return 3;
      case 'SELECTED': return 4;
      case 'REJECTED': return -1;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Placement Applications</h1>
        <p className="text-sm text-slate-500">Track stage-by-stage evaluation progress and feedback</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your applications..." />
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No applications submitted yet</p>
          <p className="text-xs text-slate-400 mt-1">Explore available placement drives and submit your profile.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {applications.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isRejected = app.status === 'REJECTED';

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      {app.drive?.company?.name}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{app.drive?.job_title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Applied on {new Date(app.applied_at).toLocaleDateString()} &bull;{' '}
                      <span className="font-semibold text-emerald-600">₹{app.drive?.package_lpa} LPA</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} type="application" />
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="py-6">
                  {isRejected ? (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-rose-900">Application Closed / Not Selected</h4>
                        <p className="text-xs text-rose-700 mt-0.5">
                          Thank you for your participation. Continue exploring other open recruitment drives.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Connection Bar */}
                      <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
                        {stages.map((stage, idx) => {
                          const isDone = currentStageIdx >= idx;
                          const isCurrent = currentStageIdx === idx;

                          return (
                            <div key={stage.key} className="flex flex-col items-center text-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                  isDone
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                    : 'bg-white border-slate-300 text-slate-400'
                                } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                              >
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span
                                className={`text-[11px] font-semibold mt-2 ${
                                  isCurrent ? 'text-indigo-600' : isDone ? 'text-slate-800' : 'text-slate-400'
                                }`}
                              >
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Feedback notes */}
                {app.notes && (
                  <div className="mt-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-bold text-slate-700">Recruiter Feedback / Remarks:</span>
                    <p className="text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{app.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useContext, useEffect } from 'react';
import PatientContext from '../../context/info/PatientContext';
import Labpatients from './Labpatients';
import { Clock, FlaskConical, CheckCircle2, Activity } from 'lucide-react';

export default function Labentry() {
  const { labassi_get_pati, labassi_pati } = useContext(PatientContext);

  useEffect(() => {
    labassi_get_pati();
    // eslint-disable-next-line
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  // pending    → no patientdata records at all
  // inProgress → at least one record exists but no predictions yet (any model)
  // completed  → at least one prediction result exists across any model
  const hasPrediction = (p) => {
    const records = p.patientData || [];
    return records.some(d =>
      d.skinData?.predictions?.length > 0 ||
      d.liverData?.prediction !== undefined ||
      d.cvdData?.prediction   !== undefined ||
      d.basicHealthData?.health_score !== undefined
    );
  };

  const hasAnyData = (p) => (p.patientData?.length ?? 0) > 0;

  const stats = {
    pending:    labassi_pati.filter(p => !hasAnyData(p)).length,
    inProgress: labassi_pati.filter(p => hasAnyData(p) && !hasPrediction(p)).length,
    completed:  labassi_pati.filter(p => hasPrediction(p)).length,
    total:      labassi_pati.length,
  };

  // ── Coverage breakdown for sub-stats ──────────────────────────────────────
  const coverage = {
    skin:  labassi_pati.filter(p => p.patientData?.some(d => d.skinData?.images?.length > 0)).length,
    liver: labassi_pati.filter(p => p.patientData?.some(d => d.liverData?.bilirubin)).length,
    cvd:   labassi_pati.filter(p => p.patientData?.some(d => d.cvdData?.bloodPressure)).length,
    basic: labassi_pati.filter(p => p.patientData?.some(d => d.basicHealthData?.WBC)).length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lab Assistant Dashboard</h1>
        <p className="text-gray-500 mt-1">Process lab tests and submit results efficiently</p>
      </header>

      {/* ── Status stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Pending Tests"
          value={stats.pending}
          label="No data uploaded yet"
          icon={<Clock size={24} />}
          color="amber"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          label="Data uploaded, awaiting prediction"
          icon={<FlaskConical size={24} />}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          label="At least one prediction done"
          icon={<CheckCircle2 size={24} />}
          color="green"
        />
      </div>

      {/* ── Data coverage breakdown ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <CoverageCard label="Skin Images"    value={coverage.skin}  total={stats.total} color="purple" />
        <CoverageCard label="Liver Data"     value={coverage.liver} total={stats.total} color="blue"   />
        <CoverageCard label="CVD Data"       value={coverage.cvd}   total={stats.total} color="rose"   />
        <CoverageCard label="Basic Health"   value={coverage.basic} total={stats.total} color="teal"   />
      </div>

      {/* ── Patient table ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Assigned Patients</h2>
            <p className="text-xs text-gray-400 mt-0.5">{stats.total} patient(s) assigned to you</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Activity size={14} />
            <span>Upload data using the action buttons</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-50">
                <th className="px-6 py-4 font-bold">Patient</th>
                <th className="px-6 py-4 font-bold">Contact</th>
                <th className="px-6 py-4 font-bold">Data Uploaded</th>
                <th className="px-6 py-4 font-bold text-right">Upload Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {labassi_pati.map((patient) => (
                <Labpatients
                  key={patient.patient_id?._id}
                  patient={patient}
                />
              ))}
            </tbody>
          </table>

          {labassi_pati.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No patients assigned yet.</p>
              <p className="text-xs mt-1">Contact your administrator to get assigned.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
const STAT_COLORS = {
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'text-amber-600' },
  blue:  { bg: 'bg-blue-50',  text: 'text-blue-600',  label: 'text-blue-600'  },
  green: { bg: 'bg-green-50', text: 'text-green-600', label: 'text-green-600' },
};

const StatCard = ({ title, value, label, icon, color = 'blue' }) => {
  const c = STAT_COLORS[color] || STAT_COLORS.blue;
  return (
    <div className="p-6 rounded-3xl border bg-white flex justify-between items-start">
      <div>
        <p className="text-sm font-semibold text-gray-400 mb-1">{title}</p>
        <h3 className="text-4xl font-black text-gray-900 mb-2">{value}</h3>
        <p className={`text-xs font-bold uppercase tracking-tight ${c.label}`}>{label}</p>
      </div>
      <div className={`p-4 rounded-2xl ${c.bg} ${c.text}`}>
        {icon}
      </div>
    </div>
  );
};

// ── Coverage card ─────────────────────────────────────────────────────────────
const COV_COLORS = {
  purple: { bar: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50' },
  blue:   { bar: 'bg-blue-500',   text: 'text-blue-600',   bg: 'bg-blue-50'   },
  rose:   { bar: 'bg-rose-500',   text: 'text-rose-600',   bg: 'bg-rose-50'   },
  teal:   { bar: 'bg-teal-500',   text: 'text-teal-600',   bg: 'bg-teal-50'   },
};

const CoverageCard = ({ label, value, total, color = 'blue' }) => {
  const c = COV_COLORS[color] || COV_COLORS.blue;
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className={`p-4 rounded-2xl border ${c.bg} border-opacity-50`}>
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-black mb-2 ${c.text}`}>{value}<span className="text-sm font-medium text-gray-400"> / {total}</span></p>
      <div className="w-full bg-white rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all duration-700 ${c.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-gray-400 mt-1">{pct}% coverage</p>
    </div>
  );
};
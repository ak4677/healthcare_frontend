import React, { useContext, useEffect } from 'react';
import PatientContext from '../../context/info/PatientContext';
import Labpatients from './Labpatients';
import { Clock, FlaskConical, CheckCircle2 } from 'lucide-react';


export default function Labentry() {
  const { labassi_get_pati, labassi_pati } = useContext(PatientContext);

  useEffect(() => {
    labassi_get_pati();
  }, []);

  // labassi_pati items are patient_lab docs with patientData populated.
  // A patient is "pending" if no patientdata records exist yet.
  // A patient is "in progress" if records exist but skin predictions are empty.
  // A patient is "completed" if at least one skin prediction result exists.
  const stats = {
    pending: labassi_pati.filter(p =>
      !p.patientData || p.patientData.length === 0
    ).length,

    inProgress: labassi_pati.filter(p =>
      p.patientData?.length > 0 &&
      !p.patientData.some(d => d.skinData?.predictions?.length > 0)
    ).length,

    completed: labassi_pati.filter(p =>
      p.patientData?.some(d => d.skinData?.predictions?.length > 0)
    ).length
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lab Assistant Dashboard</h1>
        <p className="text-gray-500 mt-1">Process lab tests and submit results efficiently</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Pending Tests"
          value={stats.pending}
          label="Needs processing"
          icon={<Clock size={24} />}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          label="Data uploaded, awaiting prediction"
          icon={<FlaskConical size={24} />}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          label="Prediction done"
          icon={<CheckCircle2 size={24} />}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Assigned Patients</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-50">
                <th className="px-6 py-4 font-bold">Patient</th>
                <th className="px-6 py-4 font-bold">Contact</th>
                <th className="px-6 py-4 font-bold">Data Uploaded</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {labassi_pati.map((patient) => (
                <Labpatients
                  key={patient.patient_id._id}
                  patient={patient}
                />
              ))}
            </tbody>
          </table>

          {labassi_pati.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              No patients assigned yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, label, icon }) => (
  <div className="p-6 rounded-3xl border bg-white flex justify-between items-start">
    <div>
      <p className="text-sm font-semibold text-gray-400 mb-1">{title}</p>
      <h3 className="text-4xl font-black text-gray-900 mb-2">{value}</h3>
      <p className="text-xs font-bold uppercase tracking-tight text-blue-600">{label}</p>
    </div>
    <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
      {icon}
    </div>
  </div>
);

/*
 * ── REQUIRED BACKEND FIX ─────────────────────────────────────────────────────
 * The GET /api/datatras/lab_assistant/patients route must populate patientData
 * so the frontend stats and disease column work correctly.
 *
 * Change this in datatrans.js:
 *
 *   // BEFORE (broken — no patientData populated)
 *   const patients = await patient_lab
 *     .find({ lab_assistant: req.user.id })
 *     .populate('patient_id');
 *
 *   // AFTER (fixed — also fetches patientdata records for each patient)
 *   const assignments = await patient_lab
 *     .find({ lab_assistant: req.user.id })
 *     .populate('patient_id');
 *
 *   const patientIds = assignments.map(a => a.patient_id._id);
 *   const allPatientData = await patientdata.find({ patient: { $in: patientIds } });
 *
 *   const result = assignments.map(a => ({
 *     ...a.toObject(),
 *     patientData: allPatientData.filter(d =>
 *       d.patient.equals(a.patient_id._id)
 *     )
 *   }));
 *
 *   res.status(200).json(result);
 * ─────────────────────────────────────────────────────────────────────────────
 */
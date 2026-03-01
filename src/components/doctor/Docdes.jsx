import React, { useContext, useEffect, useState } from 'react';
import Patientcard from '../Patientcard';
import PatientContext from '../../context/info/PatientContext';
import { 
    LayoutDashboard, 
    Users, 
    Trash2, 
    User, 
    FlaskConical, 
    Stethoscope,
    Plus,
    Search
} from 'lucide-react';

export default function Docdes() {
    const fetching = useContext(PatientContext);
    const { 
        fetchdata, doc_create_assig, doc_get_assis, 
        doc_get_assistant, doc_delete_assig,
        patientdata, doc_assistent, pati_assi_lab 
    } = fetching;

    const [active, setActive] = useState("dashboard"); // Only two main tabs now
    const [form, setForm] = useState({ pati: "", lab_assi: "" });

    useEffect(() => {
        fetchdata();
        doc_get_assis();
        doc_get_assistant();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.pati && form.lab_assi) {
            doc_create_assig(form.pati, form.lab_assi);
            setForm({ pati: "", lab_assi: "" });
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col fixed h-full">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                        <Stethoscope size={24} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">Smart Health</h1>
                </div>

                <nav className="space-y-1">
                    <button
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active === "dashboard" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-gray-500 hover:bg-gray-50"}`}
                        onClick={() => setActive("dashboard")}
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-semibold text-sm">Lab Management</span>
                    </button>
                    <button
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active === "patients" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-gray-500 hover:bg-gray-50"}`}
                        onClick={() => setActive("patients")}
                    >
                        <Users size={20} />
                        <span className="font-semibold text-sm">Patients Directory</span>
                    </button>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 ml-64 p-8">
                {active === "dashboard" && (
                    <div className="max-w-7xl mx-auto">
                        <header className="mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900">Laboratory Control</h2>
                            <p className="text-gray-500">Assign patients to labs and monitor progress.</p>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Create Form */}
                            <div className="lg:col-span-1">
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-8">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <Plus className="text-blue-600" /> New Assignment
                                    </h3>
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Patient</label>
                                            <select
                                                name="pati"
                                                value={form.pati}
                                                onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
                                                className="w-full bg-gray-50 border-gray-100 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                required
                                            >
                                                <option value="">Select Patient</option>
                                                {patientdata.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Lab Assistant</label>
                                            <select
                                                name="lab_assi"
                                                value={form.lab_assi}
                                                onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
                                                className="w-full bg-gray-50 border-gray-100 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                required
                                            >
                                                <option value="">Select Assistant</option>
                                                {doc_assistent.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                                            </select>
                                        </div>
                                        <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95">
                                            Confirm Assignment
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Right Column: Active Assignments Grid */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-800">Active Assignments</h3>
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                        Total: {pati_assi_lab.length}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pati_assi_lab.length === 0 ? (
                                        <div className="col-span-full py-12 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                                            <p className="text-gray-400">No lab assignments yet.</p>
                                        </div>
                                    ) : (
                                        pati_assi_lab.map((a, index) => (
                                            <div key={index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group transition-all hover:border-blue-200">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><User size={16} /></div>
                                                        <span className="text-sm font-bold text-gray-700">{a.patient_id?.name || "N/A"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600"><FlaskConical size={16} /></div>
                                                        <span className="text-sm font-semibold text-gray-500">{a.lab_assistant?.name || "N/A"}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => doc_delete_assig(a._id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {active === "patients" && (
                    <div className="max-w-7xl mx-auto">
                        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900">Patients Directory</h2>
                                <p className="text-gray-500">Full list of patients registered in the system.</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" placeholder="Search patients..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64" />
                            </div>
                        </header>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {patientdata.map((patient) => (
                                <Patientcard key={patient._id} patient={patient} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
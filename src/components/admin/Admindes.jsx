import React, { useContext, useEffect, useState } from 'react';
import PatientContext from '../../context/info/PatientContext';
import AdmissionCard from './AdmissionCard';
import AddAssignment from '../AddAssignment/AddAssignment';
import DoctorCard from './DoctorCard';
import PatientCard from './PatientCard';
import AssistantCard from './AssistantCard';
import AddDoctor from '../AddAssignment/AddDoctor';
import AddLab_assistant from '../AddAssignment/AddLab_assistant';
import AddPatient from '../AddAssignment/AddPatient';
import { 
  Users, 
  UserRound, 
  FlaskConical, 
  ClipboardList, 
  Plus 
} from 'lucide-react';

export default function Admindes() {
    const [fetchTarget, setFetchTarget] = useState(localStorage.getItem('fetch') || 'assignments');
    const fetching = useContext(PatientContext);
    const [isEditVisible, setEditVisible] = useState(false);
    
    const { fetchassignment, getdoctors, getpatients, getlabassistant, assignments, Doctors, Patients, Assistent } = fetching;

    useEffect(() => {
        localStorage.setItem('fetch', fetchTarget);
        if (fetchTarget === 'assignments') fetchassignment();
        else if (fetchTarget === 'doctor') getdoctors();
        else if (fetchTarget === 'lab_assistant') getlabassistant();
        else if (fetchTarget === 'patient') getpatients();
    }, [fetchTarget]);

    const update = () => setEditVisible(true);
    const hideEdit = () => setEditVisible(false);

    // Sidebar Menu Configuration
    const menuItems = [
        { id: 'assignments', label: 'Assignments', icon: <ClipboardList className="w-5 h-5" /> },
        { id: 'doctor', label: 'Doctors', icon: <UserRound className="w-5 h-5" /> },
        { id: 'lab_assistant', label: 'Lab Assistants', icon: <FlaskConical className="w-5 h-5" /> },
        { id: 'patient', label: 'Patients', icon: <Users className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* --- Modals (Original Logic Maintained) --- */}
            {fetchTarget === 'assignments' && isEditVisible && <AddAssignment className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center" visible={isEditVisible} onClose={hideEdit} />}
            {fetchTarget === 'doctor' && isEditVisible && <AddDoctor className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center" visible={isEditVisible} onClose={hideEdit} refresh={getdoctors}/>}
            {fetchTarget === 'patient' && isEditVisible && <AddPatient className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center" visible={isEditVisible} onClose={hideEdit} />}
            {fetchTarget === 'lab_assistant' && isEditVisible && <AddLab_assistant className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center" visible={isEditVisible} onClose={hideEdit} />}

            {/* --- Sidebar --- */}
            <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed top-16 left-0 p-4 shadow-sm z-40">
                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setFetchTarget(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                fetchTarget === item.id 
                                ? 'bg-[#0284C7] text-white shadow-md shadow-blue-100' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* --- Main Content Area --- */}
            <main className="flex-1 ml-64 p-8 mt-16">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 capitalize">
                            {fetchTarget.replace('_', ' ')} Management
                        </h2>
                        <p className="text-gray-500 text-sm">Manage your hospital {fetchTarget} and records</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* --- New Entry Card --- */}
                    <div 
                        onClick={update}
                        className="group flex flex-col items-center justify-center h-48 bg-white border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-[#0284C7] hover:bg-blue-50 transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#0284C7] transition-colors">
                            <Plus className="w-6 h-6 text-gray-400 group-hover:text-white" />
                        </div>
                        <span className="mt-3 font-semibold text-gray-600 group-hover:text-[#0284C7]">
                            New {fetchTarget.split('_')[0]}
                        </span>
                    </div>

                    {/* --- Dynamic Content Rendering --- */}
                    {fetchTarget === 'assignments' && (
                        Array.isArray(assignments) && assignments.length > 0 
                        ? assignments.map((assistante) => <AdmissionCard key={assistante._id} assistante={assistante} />)
                        : <EmptyState label="assignments" />
                    )}

                    {fetchTarget === 'doctor' && (
                        Array.isArray(Doctors) && Doctors.length > 0 
                        ? Doctors.map((doc) => <DoctorCard key={doc._id} doctor={doc} />)
                        : <EmptyState label="doctors" />
                    )}

                    {fetchTarget === 'patient' && (
                        Array.isArray(Patients) && Patients.length > 0 
                        ? Patients.map((pati) => <PatientCard key={pati._id} patient={pati} />)
                        : <EmptyState label="patients" />
                    )}

                    {fetchTarget === 'lab_assistant' && (
                        Array.isArray(Assistent) && Assistent.length > 0 
                        ? Assistent.map((assi) => <AssistantCard key={assi._id} assis={assi} />)
                        : <EmptyState label="lab assistants" />
                    )}
                </div>
            </main>
        </div>
    );
}

// Small helper component for "No Data" state
function EmptyState({ label }) {
    return (
        <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
            <ClipboardList className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-lg font-medium">No {label} found.</p>
        </div>
    );
}
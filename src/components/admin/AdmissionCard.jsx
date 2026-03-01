import React, { useContext } from 'react'
import PatientContext from '../../context/info/PatientContext'
import { Trash2, Calendar, User, UserRoundCog } from 'lucide-react'

export default function AdmissionCard(props) {
    const deleting = useContext(PatientContext)
    const { deleteassignment } = deleting
    
    return (
        <div className="bg-white border-l-4 border-l-[#0284C7] border-y border-r border-gray-100 rounded-r-2xl rounded-l-md shadow-sm p-5 hover:shadow-md transition-all duration-300 relative">
            <button 
                onClick={() => deleteassignment(props.assistante._id)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
                <Trash2 className="w-5 h-5" />
            </button>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <UserRoundCog className="w-5 h-5 text-[#0284C7]" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Assigned Doctor</p>
                        <h5 className="text-md font-bold text-gray-900">Dr. {props.assistante.doctor_id.name}</h5>
                    </div>
                </div>

                <div className="h-px bg-gray-100 w-full" />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Patient Name</p>
                            <h5 className="text-md font-semibold text-gray-800">{props.assistante.patient_id.name}</h5>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Age</p>
                        <span className="inline-block bg-gray-100 px-3 py-1 rounded-lg text-sm font-bold text-gray-700">
                            {props.assistante.patient_id.Age} yrs
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
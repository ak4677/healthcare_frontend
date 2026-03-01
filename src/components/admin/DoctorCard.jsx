import React, { useContext } from 'react'
import PatientContext from '../../context/info/PatientContext'
import { Trash2, Phone, Mail, Award } from 'lucide-react'

function DoctorCard(props) {
    const deleting = useContext(PatientContext)
    const { deleterole } = deleting
    
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-all duration-300 relative">
            <button 
                onClick={() => deleterole(props.doctor._id)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
                <Trash2 className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 text-[#0284C7] rounded-xl flex items-center justify-center font-bold text-lg">
                    DR
                </div>
                
                <div className="flex-1 pr-8">
                    <h5 className="text-lg font-bold text-gray-900 leading-tight">
                        Dr. {props.doctor.name}
                    </h5>
                    
                    <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3.5 h-3.5" />
                            {props.doctor.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3.5 h-3.5" />
                            {props.doctor.Number}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                         <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            props.doctor.isActivated 
                            ? "bg-blue-50 text-[#0284C7]" 
                            : "bg-gray-100 text-gray-500"
                        }`}>
                            {props.doctor.isActivated ? "Verified" : "Pending"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DoctorCard
import React, { useContext } from 'react'
import PatientContext from '../../context/info/PatientContext'
import { Trash2, FlaskConical, Mail } from 'lucide-react'

function AssistantCard(props) {
    const deleting = useContext(PatientContext)
    const { deleterole } = deleting
    
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-all duration-300 relative group">
            <button 
                onClick={() => deleterole(props.assis._id)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
                <Trash2 className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-bold text-lg">
                    {props.assis.name.substring(0, 2).toUpperCase()}
                </div>
                
                <div className="flex-1 pr-8">
                    <h5 className="text-lg font-bold text-gray-900 leading-tight">
                        {props.assis.name}
                    </h5>
                    
                    <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3.5 h-3.5" />
                            {props.assis.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FlaskConical className="w-3.5 h-3.5" />
                            {props.assis.lab_name}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                            props.assis.isActivated 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${props.assis.isActivated ? "bg-green-500" : "bg-red-500"}`}></span>
                            {props.assis.isActivated ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AssistantCard
import React, { useContext } from 'react'
import PatientContext from '../../context/info/PatientContext'
import { Trash2, Phone, User as UserIcon } from 'lucide-react'

function PatientCard(props) {
  const deleting = useContext(PatientContext)
  const { deleterole } = deleting
  
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-all duration-300 relative">
      <button 
        onClick={() => deleterole(props.patient._id)}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg">
          {props.patient.name.substring(0, 1).toUpperCase()}
        </div>
        
        <div className="flex-1 pr-8">
          <h5 className="text-lg font-bold text-gray-900 leading-tight">
            {props.patient.name}
          </h5>
          
          <div className="mt-2 grid grid-cols-1 gap-1">
            <p className="text-sm text-gray-500 truncate">{props.patient.email}</p>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                <UserIcon className="w-3 h-3" /> {props.patient.sex}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                <Phone className="w-3 h-3" /> {props.patient.Number}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${props.patient.isActivated ? "text-green-600" : "text-red-500"}`}>
              ● {props.patient.isActivated ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientCard
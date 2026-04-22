import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Activity, ChevronRight, AlertCircle } from 'lucide-react';

export default function Patientcard({ patient }) {
    const navigate = useNavigate();
    const [hoveredSegment, setHoveredSegment] = useState(null);

    // Data Extraction & Fallbacks
    const prediction = patient.prediction ?? 0;
    const risks = patient.risk_percentages ?? [0, 0, 0];
    const hasData = !risks.every(r => r === 0);
    const circumference = Math.PI * 32; // 2 * pi * r (r=16)

    // Gauge Calculations
    const safeDashArray = `${(risks[0] / 100) * circumference / 2} ${circumference}`;
    const okDashArray = `${(risks[1] / 100) * circumference / 2} ${circumference}`;
    const dangerDashArray = `${(risks[2] / 100) * circumference / 2} ${circumference}`;

    const okDashOffset = `-${(risks[0] / 100) * circumference / 2}`;
    const dangerDashOffset = `-${((risks[0] + risks[1]) / 100) * circumference / 2}`;

    // Color logic based on prediction
    const statusColors = {
        0: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", label: "Safe (Low Risk)" },
        1: { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", label: "Caution (Moderate)" },
        2: { text: "text-red-600", bg: "bg-red-50", border: "border-red-100", label: "Critical (High Risk)" },
        null: { text: "text-gray-400", bg: "bg-gray-50", border: "border-gray-100", label: "No Data Available" }
    };

    const currentStatus = hasData ? statusColors[prediction] : statusColors[null];

    return (
        <div 
            onClick={() => navigate(`/Patides/${patient._id}`)}
            className="group relative bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer overflow-hidden"
        >
            {/* Header: Name & ID */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${currentStatus.bg} ${currentStatus.text} transition-colors`}>
                        <User size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                            {patient.name}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Patient ID: {patient._id}
                        </span>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full border ${currentStatus.border} ${currentStatus.bg} ${currentStatus.text} text-[10px] font-bold uppercase`}>
                    {currentStatus.label}
                </div>
            </div>

            {/* The Diagnostic Gauge Section */}
            <div className="relative w-48 h-28 mx-auto mb-4 mt-2">
                <svg className="w-full h-full rotate-180" viewBox="0 0 36 36">
                    {/* Background track */}
                    <circle
                        cx="18" cy="18" r="16" fill="none"
                        className="stroke-gray-100 dark:stroke-neutral-700"
                        strokeWidth="3.5"
                        strokeDasharray="50 100"
                        strokeLinecap="round"
                    />

                    {hasData && (
                        <>
                            {/* Safe Segment */}
                            <circle
                                cx="18" cy="18" r="16" fill="none"
                                className={`stroke-current text-emerald-500 transition-all duration-500 ${hoveredSegment === 'safe' ? 'stroke-[4.5]' : 'stroke-[3.5]'}`}
                                strokeDasharray={safeDashArray}
                                strokeLinecap="round"
                                onMouseEnter={() => setHoveredSegment('safe')}
                                onMouseLeave={() => setHoveredSegment(null)}
                            />
                            {/* Warning Segment */}
                            <circle
                                cx="18" cy="18" r="16" fill="none"
                                className={`stroke-current text-amber-400 transition-all duration-500 ${hoveredSegment === 'ok' ? 'stroke-[4.5]' : 'stroke-[3.5]'}`}
                                strokeDasharray={okDashArray}
                                strokeDashoffset={okDashOffset}
                                strokeLinecap="round"
                                onMouseEnter={() => setHoveredSegment('ok')}
                                onMouseLeave={() => setHoveredSegment(null)}
                            />
                            {/* Danger Segment */}
                            <circle
                                cx="18" cy="18" r="16" fill="none"
                                className={`stroke-current text-red-500 transition-all duration-500 ${hoveredSegment === 'danger' ? 'stroke-[4.5]' : 'stroke-[3.5]'}`}
                                strokeDasharray={dangerDashArray}
                                strokeDashoffset={dangerDashOffset}
                                strokeLinecap="round"
                                onMouseEnter={() => setHoveredSegment('danger')}
                                onMouseLeave={() => setHoveredSegment(null)}
                            />
                        </>
                    )}
                </svg>

                {/* Center Value */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-center">
                    <p className={`text-2xl font-black ${currentStatus.text}`}>
                        {hoveredSegment === 'safe' ? `${risks[0]}%` : 
                         hoveredSegment === 'ok' ? `${risks[1]}%` : 
                         hoveredSegment === 'danger' ? `${risks[2]}%` : 
                         hasData ? `${risks[prediction]}%` : "--"}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                        {hoveredSegment ? `${hoveredSegment} Probability` : "Risk Factor"}
                    </p>
                </div>
            </div>

            {/* Patient Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Age</span>
                    </div>
                    <p className="text-sm font-bold text-gray-700">{patient.age || "--"} Years</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Activity size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Condition</span>
                    </div>
                    <p className="text-sm font-bold text-gray-700 truncate">{patient.condition || "Stable"}</p>
                </div>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-100">
                <span className="text-xs font-medium text-gray-400 group-hover:text-blue-500 transition-colors flex items-center gap-1">
                    <AlertCircle size={14} /> View clinical details
                </span>
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <ChevronRight size={18} />
                </div>
            </div>
        </div>
    );
}
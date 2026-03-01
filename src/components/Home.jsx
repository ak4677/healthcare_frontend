import React, { useContext, useEffect } from 'react'
import {useNavigate } from 'react-router-dom'
import PatientContext from '../context/info/PatientContext'
import DoctorImage from './images/doctor.png';
export default function Home() {
  const Navigate=useNavigate()
  const getinfo = useContext(PatientContext)
  const {setrole}=getinfo
  useEffect(()=>{
    localStorage.clear()
  },[])
  return (
    <>
      <div className="flex min-h-screen w-full bg-white">
      
      {/* LEFT SIDE: Hero Section (Visible on Desktop) */}
      <div className="hidden lg:flex w-1/2 relative bg-blue-600 items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={DoctorImage} 
            alt="Medical Professional" 
            className="w-full h-full object-cover" 
          />
          {/* Blue Overlay */}
          <div className="absolute inset-0 bg-blue-600/80 mix-blend-multiply"></div>
        </div>

        {/* Text Content */}
        <div className="relative z-10 p-12 text-white max-w-xl">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Welcome to Smart Health
          </h1>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Your comprehensive healthcare management system. Advanced diagnostics, 
            seamless patient care, and intelligent health tracking all in one place.
          </p>
          <div className="flex items-center gap-4 mt-12">
            <div className="h-1 w-12 bg-blue-300"></div>
            <p className="text-sm font-medium uppercase tracking-wider">
              Trusted by healthcare professionals worldwide
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Role Selection (Functional Part) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-white">
        
        <div className="w-full max-w-2xl">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Please select your portal
            </h2>
            <p className="text-slate-500 text-lg">
              Choose your role to access the appropriate dashboard and features
            </p>
          </div>

          {/* Grid Layout for Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* PATIENT CARD */}
            <button 
              onClick={() => { localStorage.setItem('role', "Patient"); Navigate("/Login"); }}
              className="flex flex-col items-center text-center p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:border-blue-400 transition-all duration-300 group"
            >
              <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-600 transition-colors">
                {/* User Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Patient</h3>
              <p className="text-sm text-slate-500">Access your health records and appointments</p>
            </button>

            {/* DOCTOR CARD */}
            <button 
              onClick={() => { localStorage.setItem('role', "Doctor"); Navigate("/Login"); }}
              className="flex flex-col items-center text-center p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:border-green-400 transition-all duration-300 group"
            >
              <div className="bg-green-50 p-4 rounded-full mb-4 group-hover:bg-green-600 transition-colors">
                {/* Stethoscope Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Doctor</h3>
              <p className="text-sm text-slate-500">Manage patients and AI diagnostics</p>
            </button>

            {/* ADMIN CARD */}
            <button 
              onClick={() => { localStorage.setItem('role', "Admin"); Navigate("/Login"); }}
              className="flex flex-col items-center text-center p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:border-purple-400 transition-all duration-300 group"
            >
              <div className="bg-purple-50 p-4 rounded-full mb-4 group-hover:bg-purple-600 transition-colors">
                {/* Shield Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Admin</h3>
              <p className="text-sm text-slate-500">Manage hospital operations and assignments</p>
            </button>

            {/* LAB ASSISTANT CARD */}
            <button 
              onClick={() => { localStorage.setItem('role', "lab_assistant"); Navigate("/Login"); }}
              className="flex flex-col items-center text-center p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:border-orange-400 transition-all duration-300 group"
            >
              <div className="bg-orange-50 p-4 rounded-full mb-4 group-hover:bg-orange-600 transition-colors">
                {/* Flask Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Lab Assistant</h3>
              <p className="text-sm text-slate-500">Enter test results and lab reports</p>
            </button>

          </div>
        </div>
      </div>
    </div>

    </>
  )
}

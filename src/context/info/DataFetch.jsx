import { React, useState } from "react";
import { useContext } from "react";
import PatientContext from "./PatientContext";


export default function DataFetch(props) {
    const intial = []
    const [patientdata, Setpatinetdata] = useState(intial)
    const [logininfo, setlogininfo] = useState({})
    const [assignments, setassignments] = useState(intial)
    const [Doctors, setDoctors] = useState(intial)
    const [Patients, setPatients] = useState(intial)
    const [Assistent, setAssistent] = useState(intial)
    const [doc_assistent, setdoc_assistent] = useState(intial)
    const [pati_assi_lab, setpati_assi_lab] = useState(intial)
    const [labassi_pati, setlabassi_pati] = useState(intial);
    const [predictedData, setpredictedData] = useState(intial)
    const [patient_madical_data, setpatient_madical_data] = useState(intial)
    const [skinPredictions, setSkinPredictions] = useState({});

    const [appointments, setAppointments] = useState([]);
    const [emergencyDoctors, setEmergencyDoctors] = useState([]);
    const [assignedDoctor, setAssignedDoctor] = useState(null);


    const backend=import.meta.env.VITE_BACKEND
    // console.log(backend);
    //patient data fetching
    const fetchdata = async () => {
        const response = await fetch(`${backend}/api/datatras/doctor/patients`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            }
        })
        const data = await response.json();
        console.log("fetching" + data);
        Setpatinetdata(data)
    }

    //login into the system
    const info = async () => {
        const response = await fetch(`${backend}/api/datatras/getinfo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
                // "auth-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Y2M5M2Y2OTcyOTljMmRkYmNlNThiYiIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3NDIyMzMxNTIsImV4cCI6MTc0MjIzNjc1Mn0.-87ZombJ3U4KvkeZFAIQ5XtRZSWfcX4I5tKzfL7s8-0",
            }
        })
        const data = await response.json();
        setlogininfo(data)
    }

    //fetching all assignments of the admin
    const fetchassignment = async () => {
        const response = await fetch(`${backend}/api/datatras/assignments`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
                // "auth-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Y2M5M2Y2OTcyOTljMmRkYmNlNThiYiIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3NDIyMzMxNTIsImV4cCI6MTc0MjIzNjc1Mn0.-87ZombJ3U4KvkeZFAIQ5XtRZSWfcX4I5tKzfL7s8-0",
            }
        })
        const data = await response.json();
        // console.log(data)
        setassignments(data)
    }

    //cleate all assignments of the admin
    const createassignment = async (doctor_id, patient_id) => {
        const response = await fetch(`${backend}/api/datatras/assignments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
                // "auth-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Y2M5M2Y2OTcyOTljMmRkYmNlNThiYiIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3NDIyMzMxNTIsImV4cCI6MTc0MjIzNjc1Mn0.-87ZombJ3U4KvkeZFAIQ5XtRZSWfcX4I5tKzfL7s8-0",
            },
            body: JSON.stringify({ doctor_id, patient_id })
        })
        const data = await response.json();
        if (response.ok) {
            fetchassignment()
            alert(data);

        }
        else { alert(data) }
        // setassignments(data)
    }

    //ge all doctors after login 
    const getdoctors = async () => {
        const response = await fetch(`${backend}/api/datatras//admin/doctors`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            }
        })
        const data = await response.json()
        // console.log("doctor"+data);
        setDoctors(data);
    }

    //get all the patients
    const getpatients = async () => {
        const response = await fetch(`${backend}/api/datatras//admin/patients`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            }
        })
        const data = await response.json()
        // console.log("patient"+data);
        setPatients(data);
    }
    //get all lab_assitant
    const getlabassistant = async () => {
        const response = await fetch(`${backend}/api/datatras//admin/Assistant`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            }
        })
        const data = await response.json()
        // console.log("assi"+data);
        setAssistent(data);
    }

    //create new doctor
    const createdoctor = async (name, email, Number) => {
        const response = await fetch(`${backend}/api/auth/createdoc`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
            body: JSON.stringify({ name, email, Number })
        })
        const data = await response.json()
        if (response.ok) {
            getdoctors()
            alert(data.message);

        }
        else { alert(data) }
        // console.log("assi"+data);
    }

    //create new patient
    const createPatient = async (name, email, Number, Age, sex) => {
        const response = await fetch(`${backend}/api/auth/addpatient`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
            body: JSON.stringify({ name, email, Number, Age, sex })
        })
        const data = await response.json()
        if (response.ok) {
            getpatients()
            alert(data.message);

        }
        else { alert(data) }
        // console.log("assi"+data);
    }

    //create new lab_assistant
    const createlab_assistant = async (name, email, Number, lab_name) => {
        const response = await fetch(`${backend}/api/auth/createlabassis`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
            body: JSON.stringify({ name, email, Number, lab_name })
        })
        const data = await response.json()
        if (response.ok) {
            getlabassistant()
            alert(data.message);

        }
        else { alert(data) }
        // console.log("assi"+data);
    }

    //deleting assignment
    const deleteassignment = async (id) => {
        const response = await fetch(`${backend}/api/datatras/deleteassignment/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            }
        })
        const data = await response.json()
        if (response.ok) {
            if (role === 'assignments') fetchassignment();
        } else {
            alert(data.error || "Server fetching issue in assignment");
        }
    }
    const deleterole = async (id) => {
        const role = localStorage.getItem('fetch');
        const response = await fetch(`${backend}/api/datatras/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
            body: JSON.stringify({ role })
        })
        const data = await response.json()
        if (response.ok) {
            alert(data.delete);
            // Trigger the appropriate refetch based on current view
            if (role === 'doctor') getdoctors();
            else if (role === 'patient') getpatients();
            else if (role === 'lab_assistant') getlabassistant();
        } else {
            alert(data.error || "Server fetching issue in role");
        }
    }

    const doc_create_assig = async (patient, lab_assistant) => {
        const response = await fetch(`${backend}/api/datatras/doctor/assign-lab`, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
            body: JSON.stringify({ patient, lab_assistant })
        })
        const data = await response.json();
        if (response.ok) {
            doc_get_assis();
            alert(data.message)
        } else {
            alert(data)
        }
    }

    const doc_delete_assig = async (id) => {
        const response = await fetch(`${backend}/api/datatras/doctor/deletelab/${id}`, {
            method: "DELETE",
            headers: {
                "Content-type": "application/json",
                "auth-token": localStorage.getItem('token')
            }
        })
        const data = await response.json();
        if (response.ok) {
            doc_get_assis()
        } else {
            alert(data)
        }
    }
    const doc_get_assis = async () => {
        const response = await fetch(`${backend}/api/datatras/doctor/lab_assigned`, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                "auth-token": localStorage.getItem('token')
            }
        })
        const data = await response.json()
        if (response.ok) {
            setpati_assi_lab(data);
        } else {
            alert(data);
        }
    }
    const doc_get_assistant = async () => {
        const response = await fetch(`${backend}/api/datatras/doctor/Assistant`, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                "auth-token": localStorage.getItem('token')
            }
        })
        const data = await response.json()
        if (response.ok) {
            setdoc_assistent(data);
        } else {
            alert(data);
        }
    }
    const labassi_get_pati = async () => {
        const response = await fetch(`${backend}/api/datatras/lab_assistant/patients`, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                "auth-token": localStorage.getItem('token')
            }
        })
        const data = await response.json();
        if (response.ok) {
            setlabassi_pati(data);
        } else {
            alert(data);
        }
    }


    const upload_patient_data = async (formate) => {
        const formData = new FormData();

        formData.append("patient", formate.patient);

        // ---------------- LIVER ----------------
        if (formate.liverData) {
            Object.keys(formate.liverData).forEach(key => {
                formData.append(key, formate.liverData[key]);
            });
        }

        // ---------------- SKIN ----------------
        if (formate.skinFiles && formate.skinFiles.length > 0) {
            formate.skinFiles.forEach(file => {
                formData.append("images", file);
            });
        }

        // ---------------- CVD ----------------
        if (formate.cvdData) {
            Object.keys(formate.cvdData).forEach(key => {
                formData.append(key, formate.cvdData[key]);
            });
        }
        const response = await fetch(`${backend}/api/datatras/lab_assistant/upload`, {
            method: "POST",
            headers: {
                // "Content-type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
            body: formData
        })
        const data = await response.json();
        if (response.ok) {
            alert(data.message)
        } else {
            alert(data)
        }
    }

    //predict crihossis
    const prediction = async (id, lab_results) => {
        const response = await fetch(`${backend}/api/datatras/${id}/labdata`, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
            body: JSON.stringify(lab_results)
        })
        const data = await response.json()
        if (response.ok) {
            setpredictedData(data);
            alert(data.success)
        } else {
            alert(data);
        }
    }

    //patient get its own madical data
    const medical_data = async () => {
        const responce = await fetch(`${backend}/api/datatras/patient`, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                "auth-token": localStorage.getItem('token')
            }
        })
        const data = await responce.json()
        if (responce.ok) {
            setpatient_madical_data(data);
            console.log(data)
        } else {
            alert(data)
        }
    }

    const skin_predict = async (patientDataId, imageIndex = 0) => {
        const response = await fetch(`${backend}/api/models/skinPredict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ patientDataId, imageIndex })
        });
        const data = await response.json();
        if (response.ok) {
            // Keyed by "patientDataId_imageIndex" so multiple predictions
            // can be tracked at the same time in the UI
            setSkinPredictions(prev => ({
                ...prev,
                [`${patientDataId}_${imageIndex}`]: data.prediction
            }));
            return data.prediction;
        } else {
            alert(data.error || 'Skin prediction failed');
            return null;
        }
    };

    const skin_predict_all = async (patientDataId) => {
        const response = await fetch(`${backend}/api/models/skinPredictAll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ patientDataId })
        });
        const data = await response.json();
        if (response.ok) {
            const newPredictions = {};
            data.predictions.forEach((pred, idx) => {
                if (!pred.error) {
                    newPredictions[`${patientDataId}_${idx}`] = pred;
                }
            });
            setSkinPredictions(prev => ({ ...prev, ...newPredictions }));
            return data.predictions;
        } else {
            alert(data.error || 'Bulk skin prediction failed');
            return null;
        }
    };

    // ── Liver cirrhosis prediction ────────────────────────────────────────────────
    const predict_liver = async (patientDataId) => {
        const response = await fetch(`${backend}/api/datatras/${patientDataId}/predict/liver`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            }
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.error || 'Liver prediction failed');
        }
    };

    // ── CVD prediction ────────────────────────────────────────────────────────────
    const predict_cvd = async (patientDataId) => {
        const response = await fetch(`${backend}/api/datatras/${patientDataId}/predict/cvd`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            }
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.error || 'CVD prediction failed');
        }
    };

    // ── Basic health prediction ───────────────────────────────────────────────────
    const predict_basic = async (patientDataId) => {
        const response = await fetch(`${backend}/api/datatras/${patientDataId}/predict/basic`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            }
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.error || 'Basic health prediction failed');
        }
    };

    // Fetch patient's or doctor's appointments
    const fetchAppointments = async () => {
        const response = await fetch(`${backend}/api/appointments/my`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem("token")
            }
        });
        const data = await response.json();
        if (response.ok) setAppointments(Array.isArray(data) ? data : []);
        else console.error("Failed to fetch appointments:", data);
    };

    // Fetch the doctor assigned to this patient
    const fetchAssignedDoctor = async () => {
        const response = await fetch(`${backend}/api/appointments/doctors/assigned`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem("token")
            }
        });
        const data = await response.json();
        if (response.ok) setAssignedDoctor(data);
    };

    // Fetch all doctors for emergency (with availability status + distance)
    const fetchEmergencyDoctors = async (lat, lng) => {
        const query = lat && lng ? `?lat=${lat}&lng=${lng}` : "";
        const response = await fetch(`${backend}/api/appointments/doctors/emergency${query}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem("token")
            }
        });
        const data = await response.json();
        if (response.ok) setEmergencyDoctors(Array.isArray(data) ? data : []);
    };

    // Book a normal appointment
    const bookAppointment = async ({ doctor_id, scheduled_at, consultation_type, reason }) => {
        const response = await fetch(`${backend}/api/appointments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem("token")
            },
            body: JSON.stringify({ doctor_id, scheduled_at, type: "normal", consultation_type, reason })
        });
        const data = await response.json();
        if (response.ok) {
            fetchAppointments();
            alert(data.message);
        } else {
            alert(data.error || "Failed to book appointment");
        }
    };

    // Book an emergency appointment
    const bookEmergencyAppointment = async ({ doctor_id, scheduled_at, patient_location }) => {
        const response = await fetch(`${backend}/api/appointments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem("token")
            },
            body: JSON.stringify({
                doctor_id,
                scheduled_at,
                type: "emergency",
                consultation_type: "video",
                reason: "Emergency consultation",
                patient_location
            })
        });
        const data = await response.json();
        if (response.ok) {
            fetchAppointments();
            alert(data.message);
        } else {
            alert(data.error || "Failed to book emergency appointment");
        }
    };

    // Doctor: confirm or decline an appointment
    const updateAppointmentStatus = async (appointmentId, status, doctor_note = "") => {
        const response = await fetch(`${backend}/api/appointments/${appointmentId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem("token")
            },
            body: JSON.stringify({ status, doctor_note })
        });
        const data = await response.json();
        if (response.ok) {
            fetchAppointments();
            alert(data.message);
        } else {
            alert(data.error || "Failed to update appointment");
        }
    };

    // Doctor: mark appointment as completed
    const completeAppointment = async (appointmentId) => {
        const response = await fetch(`${backend}/api/appointments/${appointmentId}/complete`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem("token")
            }
        });
        const data = await response.json();
        if (response.ok) fetchAppointments();
        else alert(data.error || "Failed to complete appointment");
    };

    // Patient: cancel a pending appointment
    const cancelAppointment = async (appointmentId) => {
        const response = await fetch(`${backend}/api/appointments/${appointmentId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem("token")
            }
        });
        const data = await response.json();
        if (response.ok) {
            fetchAppointments();
            alert(data.message);
        } else {
            alert(data.error || "Failed to cancel");
        }
    };
    return (
        <PatientContext.Provider value={{
            patientdata, logininfo, assignments, Doctors, Patients, Assistent, doc_assistent, pati_assi_lab, labassi_pati,
            predictedData, patient_madical_data, skinPredictions, appointments, emergencyDoctors, assignedDoctor,
            fetchdata, info, fetchassignment, createassignment, getdoctors, getpatients,
            getlabassistant, createdoctor, createlab_assistant, createPatient, deleteassignment,
            deleterole, doc_create_assig, doc_get_assis, labassi_get_pati, doc_get_assistant, doc_delete_assig,
            upload_patient_data, prediction, medical_data, skin_predict, skin_predict_all,
            fetchAppointments, fetchAssignedDoctor, fetchEmergencyDoctors,
            bookAppointment, bookEmergencyAppointment,
            updateAppointmentStatus, completeAppointment, cancelAppointment, predict_liver, predict_cvd, predict_basic
        }}>
            {props.children}
        </PatientContext.Provider>
    )
}
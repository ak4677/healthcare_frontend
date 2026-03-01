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
    //patient data fetching
    const fetchdata = async () => {
        const response = await fetch("http://localhost:5000/api/datatras/doctor/patients", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            }
        })
        const data = await response.json();
        console.log("fetching"+data);
        Setpatinetdata(data)
    }

    //login into the system
    const info = async () => {
        const response = await fetch("http://localhost:5000/api/datatras/getinfo", {
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
        const response = await fetch("http://localhost:5000/api/datatras/assignments", {
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
        const response = await fetch("http://localhost:5000/api/datatras/assignments", {
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
        const response = await fetch("http://localhost:5000/api/datatras//admin/doctors", {
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
        const response = await fetch("http://localhost:5000/api/datatras//admin/patients", {
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
        const response = await fetch("http://localhost:5000/api/datatras//admin/Assistant", {
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
        const response = await fetch("http://localhost:5000/api/auth/createdoc", {
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
        const response = await fetch("http://localhost:5000/api/auth/addpatient", {
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
        const response = await fetch("http://localhost:5000/api/auth/createlabassis", {
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
        const response = await fetch(`http://localhost:5000/api/datatras/deleteassignment/${id}`, {
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
        const response = await fetch(`http://localhost:5000/api/datatras/delete/${id}`, {
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
        const response = await fetch("http://localhost:5000/api/datatras/doctor/assign-lab", {
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
        const response = await fetch(`http://localhost:5000/api/datatras/doctor/deletelab/${id}`, {
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
        const response = await fetch("http://localhost:5000/api/datatras/doctor/lab_assigned", {
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
        const response = await fetch("http://localhost:5000/api/datatras/doctor/Assistant", {
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
        const response = await fetch("http://localhost:5000/api/datatras/lab_assistant/patients", {
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
        const response = await fetch("http://localhost:5000/api/datatras/lab_assistant/upload", {
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
        const response = await fetch(`http://localhost:5000/api/datatras/${id}/labdata`, {
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
        const responce = await fetch("http://localhost:5000/api/datatras/patient", {
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
    const response = await fetch('http://localhost:5000/api/models/skinPredict', {
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
    const response = await fetch('http://localhost:5000/api/models/skinPredictAll', {
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
    return (
        <PatientContext.Provider value={{
            patientdata, logininfo, assignments, Doctors, Patients, Assistent, doc_assistent, pati_assi_lab, labassi_pati,
            predictedData, patient_madical_data,skinPredictions,
            fetchdata, info, fetchassignment, createassignment, getdoctors, getpatients,
            getlabassistant, createdoctor, createlab_assistant, createPatient, deleteassignment,
            deleterole, doc_create_assig, doc_get_assis, labassi_get_pati, doc_get_assistant, doc_delete_assig,
            upload_patient_data, prediction, medical_data, skin_predict, skin_predict_all
        }}>
            {props.children}
        </PatientContext.Provider>
    )
}
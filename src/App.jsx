import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Login from './components/Login'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Patides from './components/patient/Patides'
import Labentry from './components/lab/Labentry'
import DataFetch from './context/info/DataFetch'
import Docdes from './components/doctor/Docdes'
import Info from './components/Info'
import Admindes from './components/admin/Admindes'
import Signup from './components/Signup'
import AdminKey from './components/admin/AdminKey'
import CreateAdmin from './components/admin/CreateAdmin'
function App() {

  return (
    <DataFetch>
      <BrowserRouter >
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Docdes" element={<Docdes />} />
          <Route path="/Patides/:id" element={<Patides />} />
          <Route path="/Patides" element={<Patides />} />
          <Route path="/Labentry" element={<Labentry />} />
          <Route path="/Info" element={<Info />} />
          <Route path="/Admindes" element={<Admindes />} />
          <Route path="/AdminKey" element={<AdminKey />} />
          <Route path="/CreateAdmin" element={<CreateAdmin />} />
        </Routes>
      </BrowserRouter>
    </DataFetch>
  )
}

export default App

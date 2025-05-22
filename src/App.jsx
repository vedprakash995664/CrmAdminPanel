import { useEffect, useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import AdminDashboard from './Pages/AdminDashboard'
import AssignedLead from './Pages/AssignedLeads';
import UnassignedLead from './Pages/UnassignedLeads'
import Employee from './Pages/Employee'
import Login from './Components/Login'
import Leads from './Pages/Leads'
import DynamicCard from './Components/DynamicCard';
import Priority from './Pages/Settings/Priority'
import LeadStatus from './Pages/Settings/LeadStatus'
import Source from './Pages/Settings/Sources'
import Tag from './Pages/Settings/Tag'
import FullLeads from './Pages/FullLeads'
import Profile from './Pages/Profile'
import EmployeeCardView from './Pages/EmployeeCardView'
import EmployeesFullPage from './Pages/EmployeesFullPage';
import ExportNumbers from './Pages/ExportNumbers';

import PasswordResetPage from './Components/PasswordResetPage';

function App() {


  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/dashboard' element={<AdminDashboard/>}/>
          <Route path='/forget-password' element={<PasswordResetPage/>}/>
          <Route path='/leads' element={<Leads/>}/>
          <Route path='/assignedLeads' element={<AssignedLead/>}/>
          <Route path='/unassignedLeads' element={<UnassignedLead/>}/>
          <Route path='/employee' element={<Employee/>}/>
          <Route  path='/profile' element={<Profile/>}/>
          <Route  path='/exportNumbers' element={<ExportNumbers/>}/>
          <Route  path='/employee/employeefullpage' element={<EmployeesFullPage/>}/>

          <Route path='/card' element={<DynamicCard/>}/>
          <Route path='/cardd' element={<EmployeeCardView/>}/>


          <Route  path='/priority' element={<Priority/>}/>
          <Route  path='/source' element={<Source/>}/>
          <Route  path='/tag' element={<Tag/>}/>
          <Route  path='/status' element={<LeadStatus/>}/>

          <Route  path='/dashboard/fullLeads' element={<FullLeads/>}/>
          <Route  path='/leads/fullLeads' element={<FullLeads/>}/>
          <Route  path='/assignedLeads/fullLeads' element={<FullLeads/>}/>
          <Route  path='/unassignedLeads/fullLeads' element={<FullLeads/>}/>
        </Routes>
      </Router>      
    </>
  )
}

export default App

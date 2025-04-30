import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Dashboard from '../Components/Dashboard';

import './CSS/AdminDashboard.css';
// import { fetchLeads } from '../Features/LeadSlice'; // Optional if using Redux
import { Toast } from 'primereact/toast'; // If using PrimeReact for toasts

function MainDashboard() {
  const navigate = useNavigate();
  // Local States
  const [leads, setLeads] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalUnAssignedRecords, setTotalUnAssignedRecords] = useState(0);
  const [totalClosedRecords, setTotalClosedRecords] = useState(0);
  const [totalAssignedRecords, setTotalAssignedRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [tableTitle, setTableTitle] = useState('Unassigned Leads');

  const toast = useRef(null);

  // Optional filters
  const employeeFilter = '';
  const tagsFilter = '';

  // Environment or session-based config
  const AdminId = sessionStorage.getItem('AdminId');
  const APi_Url = import.meta.env.VITE_API_URL;
  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/lead/getall/${AdminId}`);
      
      if (response.data?.success) {  
        console.log('====================================')
        console.log(response.data)
        console.log('====================================')
        setTotalRecords(response.data.totalLeads);
        setTotalAssignedRecords(response.data.totalAssignedLeads)
        setTotalUnAssignedRecords(response.data.totalUnassignedLeads)
        setTotalClosedRecords(response.data.totalClosedLeads)
      } else {
        setTotalRecords(0);
      }
    } catch (error) {
      // console.error("Error fetching leads:", error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch lead data.',
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('Token');
    if (!token) {
      navigate('/');
    } else {
      fetchLeads();
    }
  }, [navigate]);

  return (
    <Dashboard active="dashboard">
      <Toast ref={toast} />
      <div className="main-dashboard-container">
        <div className="main-dashboard-outer">
          
          {/* Dashboard Cards */}
          <div className="dashboard-cards-container">

            <div className="dashboard-card">
              <div className="card-icon">
                <i className="ri-database-2-line"></i>
              </div>
              <div className="card-content">
                <h4>Total Leads</h4>
                <h1>{isLoading ? <div className="circle-loader"></div> :totalRecords}</h1>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-icon">
                <i className="ri-user-unfollow-line"></i>
              </div>
              <div className="card-content">
                <h4>Unassigned Leads</h4>
                <h1>{isLoading ? <div className="circle-loader"></div> : totalUnAssignedRecords}</h1>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-icon">
                <i className="ri-user-follow-line"></i>
              </div>
              <div className="card-content">
                <h4>Assigned Leads</h4>
                <h1>{isLoading ? <div className="circle-loader"></div> : totalAssignedRecords}</h1>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-icon">
                <i className="ri-check-double-line"></i>
              </div>
              <div className="card-content">
                <h4>Closed Leads</h4>
                <h1>{isLoading ? <div className="circle-loader"></div> :totalClosedRecords}</h1>
              </div>
            </div>

          </div>

          {/* Table Display */}
          <div className="main-dashboard-bottom">
            <div className="main-table-container">
              {/* <DynamicTable lead={unassignedLeads} tableTitle={tableTitle} /> */}
            </div>
          </div>

          {/* Cards Display */}
          <div className="main-card-container">
            {/* <DynamicCard lead={unassignedLeads} /> */}
          </div>

        </div>
      </div>
    </Dashboard>
  );
}

export default MainDashboard;

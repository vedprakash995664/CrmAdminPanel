import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dashboard from '../Components/Dashboard';
import { Toast } from 'primereact/toast';
import './CSS/AdminDashboard.css';

function MainDashboard() {
  const navigate = useNavigate();
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalUnAssignedRecords, setTotalUnAssignedRecords] = useState(0);
  const [totalClosedRecords, setTotalClosedRecords] = useState(0);
  const [totalAssignedRecords, setTotalAssignedRecords] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalTags, setTotalTags] = useState(0);
  const [totalStatus, setTotalStatus] = useState(0);
  const [totalPriority, setTotalPriority] = useState(0);
  const [totalSources, setTotalSources] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useRef(null);
  const AdminId = sessionStorage.getItem('AdminId');
  const APi_Url = import.meta.env.VITE_API_URL;

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/lead/getall/${AdminId}`);
      if (response.data?.success) {
        setTotalRecords(response.data.totalLeads);
        setTotalAssignedRecords(response.data.totalAssignedLeads);
        setTotalUnAssignedRecords(response.data.totalUnassignedLeads);
        setTotalClosedRecords(response.data.totalClosedLeads);
        setTotalEmployees(response.data.totalEmployees || 0);
        setTotalTags(response.data.totalTags || 0);
        setTotalStatus(response.data.totalStatus || 0);
        setTotalPriority(response.data.totalPriority || 0);
        setTotalSources(response.data.totalSources || 0);
      } else {
        setTotalRecords(0);
      }
    } catch (error) {
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

  const metrics = [
    { title: 'Total Leads', icon: 'ri-database-2-line', value: totalRecords },
    { title: 'Unassigned Leads', icon: 'ri-user-unfollow-line', value: totalUnAssignedRecords },
    { title: 'Assigned Leads', icon: 'ri-user-follow-line', value: totalAssignedRecords },
    { title: 'Closed Leads', icon: 'ri-check-double-line', value: totalClosedRecords },
    { title: 'Total Employees', icon: 'ri-group-line', value: totalEmployees },
    { title: 'Total Tags', icon: 'ri-price-tag-3-line', value: totalTags },
    { title: 'Total Status', icon: 'ri-list-check-2', value: totalStatus },
    { title: 'Total Priority', icon: 'ri-flag-line', value: totalPriority },
    { title: 'Total Sources', icon: 'ri-share-line', value: totalSources },
  ];

  return (
    <Dashboard active="dashboard">
      <Toast ref={toast} />
      <div className="main-dashboard-container">
        <div className="main-dashboard-outer">
          <div className="dashboard-cards-container">
            {metrics.map((metric, index) => (
              <div className="dashboard-card" key={index}>
                <div className="card-icon">
                  <i className={metric.icon}></i>
                </div>
                <div className="card-content">
                  <h4>{metric.title}</h4>
                  <h1>{isLoading ? <div className="circle-loader"></div> : metric.value}</h1>
                </div>
              </div>
            ))}
          </div>
          <div className="main-dashboard-bottom">
            <div className="main-table-container"></div>
          </div>
          <div className="main-card-container"></div>
        </div>
      </div>
    </Dashboard>
  );
}

export default MainDashboard;

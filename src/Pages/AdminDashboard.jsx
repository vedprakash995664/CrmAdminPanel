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
  const [totalUnactiveEmployees, setTotalUnactiveEmployees] = useState(0);
  const [totalTags, setTotalTags] = useState(0);

  const [leadsLoading, setLeadsLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);

  const toast = useRef(null);
  const AdminId = sessionStorage.getItem('AdminId');
  const APi_Url = import.meta.env.VITE_API_URL;

  const fetchEmployee = async () => {
    try {
      setEmployeeLoading(true);

      const [allRes, blockedRes] = await Promise.all([
        axios.get(`${APi_Url}/digicoder/crm/api/v1/employee/getall/${AdminId}`),
        axios.get(`${APi_Url}/digicoder/crm/api/v1/employee/employees/blocked/${AdminId}`)
      ]);

      if (allRes.data?.success) {
        setTotalEmployees(allRes.data.employees.length);
      } else {
        setTotalEmployees(0);
      }

      if (blockedRes.data?.success) {
        setTotalUnactiveEmployees(blockedRes.data.employees.length);
      } else {
        setTotalUnactiveEmployees(0);
      }

    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch employee data.',
        life: 3000,
      });
    } finally {
      setEmployeeLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      setTagsLoading(true);
      const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/tags/getall/${AdminId}`);
      if (response.data?.success) {
        setTotalTags(response.data.tags.length);
      } else {
        setTotalTags(0);
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch tag data.',
        life: 3000,
      });
    } finally {
      setTagsLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      setLeadsLoading(true);
      const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/lead/getall/${AdminId}`);
      if (response.data?.success) {
        setTotalRecords(response.data.totalLeads);
        setTotalAssignedRecords(response.data.totalAssignedLeads);
        setTotalUnAssignedRecords(response.data.totalUnassignedLeads);
        setTotalClosedRecords(response.data.totalClosedLeads);
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
      setLeadsLoading(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('Token');
    if (!token) {
      navigate('/');
    } else {
      fetchLeads();
      fetchEmployee();
      fetchTags();
    }
  }, [navigate]);

  const actionCards = [
    // {
    //   title: 'Add Lead',
    //   icon: 'ri-user-add-line',
    //   route: '/addLead',
    //   color: '#4CAF50'
    // },
    // {
    //   title: 'Import Leads',
    //   icon: 'ri-download-line',
    //   route: '/importLeads',
    //   color: '#2196F3'
    // }
  ];

  const metrics = [
    {
      title: 'Total Leads',
      icon: 'ri-database-2-line',
      value: totalRecords,
      loading: leadsLoading,
      route: '/leads',
    },
    {
      title: 'Unassigned Leads',
      icon: 'ri-user-unfollow-line',
      value: totalUnAssignedRecords,
      loading: leadsLoading,
      route: '/unassignedLeads',
    },
    {
      title: 'Assigned Leads',
      icon: 'ri-user-follow-line',
      value: totalAssignedRecords,
      loading: leadsLoading,
      route: '/assignedLeads',
    },
    {
      title: 'Closed Leads',
      icon: 'ri-check-double-line',
      value: totalClosedRecords,
      loading: leadsLoading,
      route: '',
    },
    {
      title: 'Total Employees',
      icon: 'ri-group-line',
      value: totalEmployees,
      loading: employeeLoading,
      route: '/employee',
    },
    {
      title: 'Unactive Employees',
      icon: 'ri-user-settings-line',
      value: totalUnactiveEmployees,
      loading: employeeLoading,
      route: '/employee?status=inactive',
    },
    {
      title: 'Total Tags',
      icon: 'ri-price-tag-3-line',
      value: totalTags,
      loading: tagsLoading,
      route: '/tag',
    },
    {
      title: 'Export Numbers',
      icon: 'ri-download-2-line', // Changed icon for Export Numbers
      value: 'Export', // Changed value to text
      loading: tagsLoading,
      route: '/exportNumbers',
    },
  ];

  return (
    <Dashboard active="dashboard">
      <Toast ref={toast} />
      <div className="main-dashboard-container">
        <div className="main-dashboard-outer">
          {/* Action Cards Row */}
          <div className="dashboard-cards-container">
            {actionCards.map((card, index) => (
              <div
                className="dashboard-card action-card"
                key={`action-${index}`}
                onClick={() => navigate(card.route)}
                style={{ backgroundColor: card.color, cursor: 'pointer' }}
              >
                <div className="card-icon">
                  <i className={card.icon} style={{ color: 'white' }}></i>
                </div>
                <div className="card-content">
                  <h4 style={{ color: 'white' }}>{card.title}</h4>
                </div>
              </div>
            ))}
          </div>
          
          {/* Metrics Cards */}
          <div className="dashboard-cards-container">
            {metrics.map((metric, index) => {
              const handleClick = () => {
                if (metric.route) {
                  navigate(metric.route);
                }
              };

              const isClickable = !!metric.route;

              return (
                <div
                  className="dashboard-card"
                  key={index}
                  onClick={handleClick}
                  style={{ cursor: isClickable ? 'pointer' : 'default' }}
                >
                  <div className="card-icon">
                    <i className={metric.icon}></i>
                  </div>
                  <div className="card-content">
                    <h4>{metric.title}</h4>
                    <h1>
                      {metric.loading ? (
                        <div className="circle-loader"></div>
                      ) : (
                        metric.value
                      )}
                    </h1>
                  </div>
                </div>
              );
            })}
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
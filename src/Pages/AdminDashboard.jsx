import React, { useEffect, useState } from 'react';
import Dashboard from '../Components/Dashboard';
import DynamicTable from '../Components/DynmicTables';
import './CSS/AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import DynamicCard from '../Components/DynamicCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads } from '../Features/LeadSlice';

function MainDashboard() {
  const [TableTitle, setTableTitle] = useState('Unassigned Leads');
  const navigate = useNavigate(); 
  const dispatch = useDispatch();
  const leads = useSelector((state) => state.leads.leads);
  const filteredLead = leads.filter((lead) => lead.deleted === false && !lead.leadAssignedTo);
  const assignedLead = leads.filter((lead) => lead.deleted === false && lead.leadAssignedTo);
  const totalLeads = leads.filter((lead) => lead.deleted === false);
  const closedLeads = leads.filter((lead) => lead.deleted === false && lead.closed === true);

  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    } else {
      dispatch(fetchLeads());
    }
  }, [dispatch, navigate]);

  return (
    <>
      <Dashboard active={'dashboard'}>
        <div className="main-dashboard-container">
          <div className="main-dashboard-outer">
            <div className="dashboard-cards-container">

            <div className="dashboard-card">
                <div className="card-icon">
                  <i className="ri-database-2-line"></i>
                </div>
                <div className="card-content">
                  <h4>Total Leads</h4>
                  <h1>{(totalLeads.length > 0) ? totalLeads.length : <div className="circle-loader"></div>}</h1>
                </div>
              </div>
 
              <div className="dashboard-card">
                <div className="card-icon">
                  <i className="ri-user-unfollow-line"></i>
                </div>
                <div className="card-content">
                  <h4>Unassigned Leads</h4>
                  <h1>{(totalLeads.length > 0) ? filteredLead.length : <div className="circle-loader"></div>}</h1>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">
                  <i className="ri-user-follow-line"></i>
                </div>
                <div className="card-content">
                  <h4>Assigned Leads</h4>
                  <h1>{(totalLeads.length > 0) ? assignedLead.length : <div className="circle-loader"></div>}</h1>
                </div>
              </div>
             
              
             
              
              <div className="dashboard-card">
                <div className="card-icon">
                  <i className="ri-check-double-line"></i>
                </div>
                <div className="card-content">
                  <h4>Closed Leads</h4>
                  <h1>{(totalLeads.length > 0) ? closedLeads.length : <div className="circle-loader"></div>}</h1>
                </div>
              </div>
            </div>
            <div className="main-dashboard-bottom">
              <div className='main-table-container'>
                <DynamicTable lead={filteredLead} tableTitle={TableTitle} />
              </div>
            </div>
            
            <div className='main-card-container'>
              <DynamicCard lead={filteredLead} />
            </div>
          </div>
        </div>
      </Dashboard>
    </>
  );
}

export default MainDashboard;
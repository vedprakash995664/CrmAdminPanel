import React, { useEffect, useState } from 'react'
import Dashboard from '../Components/Dashboard';
import { LineChart } from '@mui/x-charts/LineChart';
import DynamicTable from '../Components/DynmicTables';
import './CSS/AdminDashboard.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DynamicCard from '../Components/DynamicCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads } from '../Features/LeadSlice';

function MainDashboard() {
  const [tableData, setTableData] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [TableTitle, setTableTitle] = useState('Unassigned Leads')
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const leads = useSelector((state) => state.leads.leads);
  const filteredLead = leads.filter((lead) => lead.deleted === false && !lead.leadAssignedTo)
  const AssignedLead = leads.filter((lead) => lead.deleted === false && lead.leadAssignedTo)
  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    } else {
      dispatch(fetchLeads());
    }
  }, [dispatch]);

  return (
    <>
      <Dashboard active={'dashboard'}>
        <div className="main-dashboard-container">
          <div className="main-dashboard-outer">
            <div className="main-dashboard-top">
              <div className="main-top-1">
                <div className="chart">
                  <span>Data</span>
                  <LineChart
                    xAxis={[{ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }]}
                    series={[
                      {
                        data: [2, 3, 5.5, 8.5, 1.5, 5, 1, 4, 3, 8],
                        showMark: ({ index }) => index % 2 === 0,
                      },

                    ]}
                  />
                </div>
              </div>
              <div className="main-top-2">
                <div className="main-top-2-card1">
                  <h4>Assigned Leads</h4>
                  <h1>{AssignedLead.length}</h1>
                </div>
                <div className="main-top-2-card2">
                  <h4>Unassigned Leads</h4>
                  <h1>{filteredLead.length}</h1>
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
  )
}

export default MainDashboard

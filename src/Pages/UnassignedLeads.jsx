import React, { useEffect, useState } from 'react'
import Dashboard from '../Components/Dashboard'
import { useNavigate } from 'react-router-dom';
import DynamicTable from '../Components/DynmicTables';
import Modal from '../Components/LeadForm';
import DynamicCard from '../Components/DynamicCard';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads } from '../Features/LeadSlice';

function UnassignedLeads() {
const [lead,setLead]=useState([])
  const [leadData, setLeadData] = useState([]);
  const [tableTitle, setTableTitle] = useState('Unassigned Leads');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [buttonTitle, setButtonTitle] = useState('');
  const navigate = useNavigate();

const APi_Url = import.meta.env.VITE_API_URL;
  const AdminId = sessionStorage.getItem('AdminId');
    const fetchLead=async()=>{
      const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/lead/getUnassignedLeads/${AdminId}`);
      setLead(response.data.leads) 
      console.log(response.data.leads);
      
    }
    useEffect(()=>{
      fetchLead();
    },[])
  
  const dispatch = useDispatch();
  // const leads = useSelector((state) => state.leads.leads);
  const filteredLead=lead
  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Fetch lead data on component mount
  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    } else {
         dispatch(fetchLeads());
    }
  }, [dispatch]);
  return (
    <div>
      <Dashboard active={'unassigned'}>
        <div className="lead-table-container">
          <DynamicTable className='dynamicTable' lead={filteredLead} tableTitle={tableTitle} />
        </div>
        <div className='lead-card-container'>
          <DynamicCard className='dynamicTable' lead={filteredLead} tableTitle={tableTitle} />
        </div>
        <Modal isOpen={isModalOpen} onClose={closeModal} title={title} buttonTitle={buttonTitle} leadData={filteredLead} />
      </Dashboard>

    </div>
  )
}

export default UnassignedLeads;

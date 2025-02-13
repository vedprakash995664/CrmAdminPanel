import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Slice to handle leads state
const leadsSlice = createSlice({
  name: 'leads',
  initialState: {
    leads: [],
    Priority: [],
    LeadStatus:null,
    Employee:null,
    leadSources:[],
    tag:[],
  },

  reducers: {
    setLeads: (state, action) => {
      state.leads = action.payload;
    },
    setPriority: (state, action) => {  
      state.Priority = action.payload;
    },
    setTags: (state, action) => {  
      state.tag = action.payload;
    },
    setLeadStatus: (state, action) => {
      state.LeadStatus = action.payload;
    },
    setEmployee: (state, action) => {
      state.Employee = action.payload;
    },
    setLeadSources: (state, action) => {
      state.leadSources = action.payload;
    },
    
  },
});

export const { setLeads, setPriority,setLeadStatus,setEmployee ,setLeadSources,setTags} = leadsSlice.actions;

// Thunk to fetch leads data
export const fetchLeads = () => async (dispatch) => {
  try {
    const APi_Url=import.meta.env.VITE_API_URL
    const AdminId = sessionStorage.getItem('AdminId');
    const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/lead/getall/${AdminId}`);
    dispatch(setLeads(response.data.leads));
  } catch (error) {
    console.error('Error fetching leads:', error);
  }
};
// Thunk to fetch leads data
export const fetchTags = () => async (dispatch) => {
  try {
    const APi_Url=import.meta.env.VITE_API_URL
    const AdminId = sessionStorage.getItem('AdminId');
    const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/tags/getall/${AdminId}`);
    dispatch(setTags(response.data.tags));
    
  } catch (error) {
    console.error('Error fetching tags:', error);
  }
};

// Thunk to fetch priority data
export const fetchPriority =() =>async(dispatch) => {
  try {
    const APi_Url=import.meta.env.VITE_API_URL
    const AdminId = sessionStorage.getItem('AdminId');
    const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/priority/get/${AdminId}`);
    // console.log('Priority response:', response.data); 
    dispatch(setPriority(response.data.priorities)); 
  } catch (error) {
    console.error('Error fetching priority data:', error);
  }
};
// Thunk to fetch priority data
export const fetchLeadStatus = () => async (dispatch) => {
  try {
    const APi_Url=import.meta.env.VITE_API_URL
    const AdminId = sessionStorage.getItem('AdminId');
    const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/leadstatus/getall/${AdminId}`);
    dispatch(setLeadStatus(response.data.leadStatus));
  } catch (error) {
    console.error('Error fetching priority data:', error);
  }
};
// Thunk to fetch priority data
export const fetchEmployee = () => async (dispatch) => {
  try {
    const APi_Url=import.meta.env.VITE_API_URL
    // console.log('Fetching Employee');
    const AdminId = sessionStorage.getItem('AdminId');
    const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/employee/getall/${AdminId}`);
    dispatch(setEmployee(response.data.employees));
  } catch (error) {
    console.error('Error fetching Employee data:', error);
  }
};
export const fetchSources = () => async (dispatch) => {
  try {
    const APi_Url=import.meta.env.VITE_API_URL
    // console.log('Fetching Employee');
    const AdminId = sessionStorage.getItem('AdminId');
    const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/leadSources/getall/${AdminId}`);
    dispatch(setLeadSources(response.data.leadSources));
  } catch (error) {
    console.error('Error fetching Employee data:', error);
  }
};

export default leadsSlice.reducer;

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import Dashboard from '../Components/Dashboard';
import axios from "axios";
import Swal from 'sweetalert2';
import { fetchLeads } from "../Features/LeadSlice";
import { useDispatch, useSelector } from "react-redux";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

// Material UI Icons
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TodayIcon from '@mui/icons-material/Today';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CancelIcon from '@mui/icons-material/Cancel';
import TagIcon from '@mui/icons-material/Tag';

import './CSS/EmployeesFullPage.css';

function EmployeesFullPage() {
  const APi_Url = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Employee Data
  const EmployeeData = JSON.parse(localStorage.getItem("Employee")) ;
  const currentEmployeeId = EmployeeData._id;
  let EmpStatus = EmployeeData.blocked ? "Blocked" : "Active";

  // State Management
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [followupData, setFollowUpData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Redux Leads Data
  const leads = useSelector((state) => state.leads.leads);
  const filteredLead = leads.filter((lead) => lead.deleted === false);
  const closedLeads = leads.filter((lead) => lead.closed === true);
  const NegativeLeads = leads.filter((lead) => lead.negative === true);

  // Form Data
  const [formData, setFormData] = useState({
    Name: EmployeeData?.empName || "",
    Email: EmployeeData?.empEmail || "",
    Password: EmployeeData?.empPassword || "",
    Phone: EmployeeData?.empPhoneNumber || "",
    Gender: EmployeeData?.empGender || "",
    DateOfBirth: EmployeeData?.empDOB || "",
    Designation: EmployeeData?.empDesignation || "",
    City: EmployeeData?.empCity || "",
    ZipCode: EmployeeData?.empZipCode || "",
    State: EmployeeData?.empState || "",
    Country: EmployeeData?.empCountry || "",
    JoiningDate: EmployeeData?.createdAt || "",
    Status: EmpStatus,
  });

  // Fetch assigned leads
  const fetchAssignedLeads = async () => {
    try {
      const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/lead/empgetall/${currentEmployeeId}`);
      setAssignedLeads(response.data.leads || []);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.warn("No Assigned leads found");
      } else {
        toast.error("Failed to fetch assigned leads");
      }
      // console.error("Error fetching assigned leads:", error);
    }
  };
  

  // Fetch followups
  const fetchFollowUps = async () => {
    try {
      const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/followup/getfollowedby/${currentEmployeeId}`);
      setFollowUpData(response.data.followups || []);
    } catch (error) {
      console.error("Error fetching followups:", error);
    }
  };

  // Calculate report metrics
  const calculateReportMetrics = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Total assigned leads
    const totalAssigned = assignedLeads.length;
    
    // Closed leads (both closed and not negative)
    const closedLeads = assignedLeads.filter(lead => lead.closed === true && lead.negative === false);
    
    // Negative leads
    const negativeLeads = assignedLeads.filter(lead => lead.negative === true);
    
    // Pending leads (not closed and not negative)
    const pendingLeads = assignedLeads.filter(lead => lead.closed === false && lead.negative === false);
    
    // Today's followups
    const todaysFollowups = followupData.filter(item => {
      const createdDate = new Date(item.createdAt).toISOString().split('T')[0];
      return createdDate === today;
    }).length;
    
    // Total followups
    const totalFollowups = followupData.length;
    
    // Leads with no followups
    const leadsWithNoFollowups = assignedLeads.filter(lead => {
      return !followupData.some(followup => followup.leadId === lead._id);
    }).length;
    
    // Unique tags
    const uniqueTagNames = [
      ...new Set(
        assignedLeads
          .map(item => item.tags || [])       
          .flat()                             
          .map(tag => tag?.tagName)            
          .filter(tagName => tagName)         
      )
    ];
    
    return {
      totalAssigned,
      closedLeads: closedLeads.length,
      negativeLeads: negativeLeads.length,
      pendingLeads: pendingLeads.length,
      todaysFollowups,
      totalFollowups,
      leadsWithNoFollowups,
      uniqueTagNames
    };
  };

  const reportMetrics = calculateReportMetrics();

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdate = () => {
    setIsEditing(true);
    setIsDisabled(false);
  };

  const handleSave = async () => {
    const EmployeeDataEdit = {
      empName: formData.Name || "",
      empPhoneNumber: formData.Phone || "",
      empEmail: formData.Email || "",
      empPassword: formData.Password || "",
      empGender: formData.Gender || "",
      empDOB: formData.DateOfBirth || "",
      empDesignation: formData.Designation || "",
      empCity: formData.City || "",
      empState: formData.State || "",
      empZipCode: formData.ZipCode || "",
      empCountry: formData.Country || "",
    };

    try {
      const response = await axios.put(
        `${APi_Url}/digicoder/crm/api/v1/employee/update/${currentEmployeeId}`,
        EmployeeDataEdit,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (response.status === 200) {
        toast.success("Updated successfully!");
        setIsEditing(false);
        setIsDisabled(true);
        navigate('/employee')
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update data!");
    }
  };

  const handleBack = () => {
    navigate('/employee');
    localStorage.removeItem("Employee");
  };

  const handleBlock = async () => {
    const result = await Swal.fire({
      title: `Are you sure you want to ${EmployeeData.blocked ? 'unblock' : 'block'} ${EmployeeData.empName}?`,
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${EmployeeData.blocked ? 'unblock' : 'block'} it!`,
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      const AdminId = sessionStorage.getItem("AdminId");
      const blockEmployee = EmployeeData._id;

      const response = await axios.put(
        `${APi_Url}/digicoder/crm/api/v1/employee/block/${AdminId}`,
        { empId: blockEmployee }
      );

      if (response.status === 200) {
        toast.success(`${EmployeeData.empName} has been ${EmployeeData.blocked ? 'unblocked' : 'blocked'} successfully.`);
        navigate('/employee')
        setFormData(prev => ({ ...prev, Status: response.data.employee.blocked ? "Blocked" : "Active" }));
      }
    } catch (error) {
      toast.error(`Failed to ${EmployeeData.blocked ? 'unblock' : 'block'} the employee.`);
    }
  };

  // Effects
  useEffect(() => {
    fetchAssignedLeads();
    fetchFollowUps();
    dispatch(fetchLeads());

    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [dispatch, navigate]);

  // Dialog footer
  const footerContent = (
    <div>
      <Button 
        label="Close" 
        icon="pi pi-times" 
        onClick={() => setVisible(false)} 
        className="p-button-text" 
      />
    </div>
  );

  return (
    <div>
      <Dashboard active={'employee'}>
        <div className="content fullLead-outer">
          <div className="fullLead-outer">
            <div className="fullLeads-header">
              <div className="back-btn">
                <button onClick={handleBack}><i className="ri-arrow-left-line"></i> Back</button>
              </div>
              <div className="fullLeads-icons">
                <button 
                  style={{ color: EmployeeData.blocked ? "green" : "red" }} 
                  onClick={() => handleBlock()}
                >
                  <i className={EmployeeData.blocked ? "ri-user-unfollow-fill" : "ri-user-follow-fill"}></i>
                  {EmployeeData.blocked ? " Unblock" : " Block"}
                </button>
              </div>
            </div>

            <div className="fullLeads-view-data">
              <div className="view-data-title">
                <span>EMPLOYEE DETAILS</span>
              </div>
              <div className="view-info-form">
                <div className="form-row">
                  <div>
                    <div className="label">Name</div>
                    <input
                      type="text"
                      className="input-field"
                      name="Name"
                      value={formData.Name}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Phone Number</div>
                    <input
                      type="number"
                      className="input-field"
                      name="Phone"
                      value={formData.Phone}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div>
                    <div className="label">Email</div>
                    <input
                      type="email"
                      className="input-field"
                      name="Email"
                      value={formData.Email}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Password</div>
                    <input
                      type="text"
                      className="input-field"
                      name="Password"
                      value={formData.Password}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Gender</div>
                    <select
                      className="input-field"
                      name="Gender"
                      value={formData.Gender}
                      onChange={handleChange}
                      disabled={isDisabled}
                    >
                      <option value="" disabled>-- Select --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <div className="label">Date of Birth</div>
                    <input
                      type="date"
                      className="input-field"
                      name="DateOfBirth"
                      value={formData.DateOfBirth}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Designation</div>
                    <input
                      type="text"
                      className="input-field"
                      name="Designation"
                      value={formData.Designation}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">City</div>
                    <input
                      type="text"
                      className="input-field"
                      name="City"
                      value={formData.City}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Zip Code</div>
                    <input
                      type="number"
                      className="input-field"
                      name="ZipCode"
                      value={formData.ZipCode}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">State</div>
                    <input
                      type="text"
                      className="input-field"
                      name="State"
                      value={formData.State}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Country</div>
                    <input
                      type="text"
                      className="input-field"
                      name="Country"
                      value={formData.Country}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Joining Date</div>
                    <input
                      type="text"
                      className="input-field"
                      name="createdDate"
                      value={new Date(formData.JoiningDate).toLocaleDateString()}
                      disabled
                    />
                  </div>
                  <div>
                    <div className="label">Status</div>
                    <input
                      type="text"
                      className="input-field"
                      name="LeadStatus"
                      value={formData.Status}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>
                <div className="view-edit-btn">
                  <button onClick={isEditing ? handleSave : handleUpdate}>
                    {isEditing ? "Save Changes" : "Edit Profile"}
                  </button>
                </div>
              </div>
            </div>

            <div className="report-title">
              <span>EMPLOYEE PERFORMANCE REPORT</span>
              <Button 
                label="View Assigned Tags" 
                icon="pi pi-tags" 
                onClick={() => setVisible(true)} 
                className="AssignedTagsBtn" 
              />
            </div>

            <div className="report-grid">
              {/* Assigned Leads Card */}
              <div className="report-card">
                <div className="report-icon">
                  <AssignmentIndIcon style={{ fontSize: "40px", color: "#3f51b5" }} />
                </div>
                <div className="report-content">
                  <span>Assigned Leads</span>
                  <p>{reportMetrics.totalAssigned}</p>
                  <small>Total leads assigned to this employee</small>
                </div>
              </div>

              {/* Closed Leads Card */}
              <div className="report-card success-card">
                <div className="report-icon">
                  <CheckCircleIcon style={{ fontSize: "40px", color: "white" }} />
                </div>
                <div className="report-content">
                  <span>Closed Leads</span>
                  <p>{reportMetrics.closedLeads}</p>
                  <small>
                    {reportMetrics.totalAssigned > 0 ? 
                      `${Math.round((reportMetrics.closedLeads / reportMetrics.totalAssigned) * 100)}% Success Rate` : 
                      'No leads assigned'}
                  </small>
                </div>
              </div>

              {/* Pending Leads Card */}
              <div className="report-card warning-card">
                <div className="report-icon">
                  <PendingActionsIcon style={{ fontSize: "40px", color: "white" }} />
                </div>
                <div className="report-content">
                  <span>Pending Leads</span>
                  <p>{reportMetrics.pendingLeads}</p>
                  <small>{reportMetrics.leadsWithNoFollowups} need followup</small>
                </div>
              </div>

              {/* Negative Leads Card */}
              <div className="report-card danger-card">
                <div className="report-icon">
                  <CancelIcon style={{ fontSize: "40px", color: "white" }} />
                </div>
                <div className="report-content">
                  <span>Negative Leads</span>
                  <p>{reportMetrics.negativeLeads}</p>
                  <small>
                    {reportMetrics.totalAssigned > 0 ? 
                      `${Math.round((reportMetrics.negativeLeads / reportMetrics.totalAssigned) * 100)}% of total` : 
                      ''}
                  </small>
                </div>
              </div>

              {/* Today's Followups Card */}
              <div className="report-card info-card">
                <div className="report-icon">
                  <TodayIcon style={{ fontSize: "40px", color: "white" }} />
                </div>
                <div className="report-content">
                  <span>Today's Followups</span>
                  <p>{reportMetrics.todaysFollowups}</p>
                  <small>{new Date().toLocaleDateString()}</small>
                </div>
              </div>

              {/* Total Followups Card */}
              <div className="report-card primary-card">
                <div className="report-icon">
                  <WorkHistoryIcon style={{ fontSize: "40px", color: "white" }} />
                </div>
                <div className="report-content">
                  <span>Total Followups</span>
                  <p>{reportMetrics.totalFollowups}</p>
                  <small>
                    Avg: {reportMetrics.totalAssigned > 0 ? 
                      Math.round(reportMetrics.totalFollowups / reportMetrics.totalAssigned) : 0} per lead
                  </small>
                </div>
              </div>
            </div>

            {/* Tags Dialog */}
            <Dialog 
              className="AssignedTagsContainer" 
              header={
                <div className="dialog-header">
                  <TagIcon style={{ marginRight: '10px' }} />
                  <span>Assigned Tags</span>
                </div>
              } 
              visible={visible} 
              onHide={() => setVisible(false)} 
              footer={footerContent}
              style={{ width: '50vw' }}
            >
              <div className="tags-container">
                {reportMetrics.uniqueTagNames.length > 0 ? (
                  reportMetrics.uniqueTagNames.map((tag, index) => (
                    <span key={index} className="tag-badge">
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="no-tags-message">No tags assigned to this employee's leads</p>
                )}
              </div>
            </Dialog>
          </div>
        </div>
      </Dashboard>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default EmployeesFullPage;
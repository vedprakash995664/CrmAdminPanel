import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useLocation, useNavigate } from "react-router-dom";
import './CSS/FullLeads.css';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import { Dropdown } from 'primereact/dropdown';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import Dashboard from '../Components/Dashboard';
import axios from "axios";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { fetchPriority, fetchSources, fetchTags } from "../Features/LeadSlice";

function FullLeads() {
  const dispatch = useDispatch();
  const priorityData = useSelector((state) => state.leads.Priority);
  const sourcesData = useSelector((state) => state.leads.leadSources);
  const tagData = useSelector((state) => state.leads.tag);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [sourcesOptions, setSourcesOptions] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const APi_Url=import.meta.env.VITE_API_URL
  const navigate = useNavigate();
  const location = useLocation();
  const { viewdata } = location.state || [];
  const { tableTitle } = location.state || {};
  const { fromEdit } = location.state || {};
  const [selectedTags, setSelectedTags] = useState(viewdata?.tags || []);

  const [formData, setFormData] = useState({
    name: viewdata?.name || "",
    email: viewdata?.email || "",
    Phone: viewdata?.phone || "",
    gender: viewdata?.gender || "",
    dob: viewdata?.dob || "",
    priority: viewdata?.priority || "",
    sources: viewdata?.sources || "",
    city: viewdata?.city || "",
    zipCode: viewdata?.zipCode || "",
    state: viewdata?.state || "",
    country: viewdata?.country || "",
    leadStatus: viewdata?.leadStatus || "",
    leadAssignedTo: viewdata?.leadAssignedTo?.empName || "",
    tags: viewdata?.tags || []
  });

  const FormApiData = {
    name: formData.name,
    email: formData.email,
    gender: formData.gender,
    dob: formData.dob,
    priority: formData.priority,
    sources: formData.sources,
    city: formData.city,
    zipCode: formData.zipCode,
    state: formData.state,
    country: formData.country,
    leadStatus: formData.leadStatus,
    tags: selectedTags
  };


  useEffect(() => {
    dispatch(fetchPriority());
    dispatch(fetchSources());
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    if (priorityData && Array.isArray(priorityData)) {
      setPriorityOptions(
        priorityData.map((priority) => ({
          label: priority.priorityText,
          value: priority.priorityText
        }))
      );
    }
  }, [priorityData]);

  useEffect(() => {
    if (sourcesData && Array.isArray(sourcesData)) {
      setSourcesOptions(
        sourcesData.map((sources) => ({
          label: sources.leadSourcesText,
          value: sources.leadSourcesText
        }))
      );
    }
  }, [sourcesData]);

  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }

    if (fromEdit) {
      setIsEditing(true);
      setIsDisabled(false);
    }
  }, [navigate, fromEdit]);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_BOTTOM = 10;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_BOTTOM,
      },
    },
  };

  const handleTagChange = (event) => {
    const { value } = event.target;
    setSelectedTags(value);
    setFormData(prevData => ({
      ...prevData,
      tags: value
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdate = () => {
    setIsEditing(true);
    setIsDisabled(false);
  };

  const handleSave = async () => {
    console.log("Saving sdschuydata", FormApiData);
    console.log(viewdata._id);

    try {
      const response = await axios.put(
        `${APi_Url}/digicoder/crm/api/v1/lead/update/${viewdata._id}`,
        FormApiData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        toast.success("Updated successfully!");
        setTimeout(() => {
          navigate('/leads')
        }, 500)
      } else {
        console.log(response);
        toast.error("Failed to update the lead. Please try again.");
      }

      setIsEditing(false);
      setIsDisabled(true);
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Error occurred while updating. Please try again.");
    }
  };

  const handleBack = () => {
    localStorage.removeItem("currentUserId");
    if (tableTitle === 'Leads') {
      navigate('/leads');
    } else if (tableTitle === 'Assigned Leads') {
      navigate("/assignedLeads");
    } else if (tableTitle === 'Unassigned Leads') {
      navigate("/unassignedLeads");
    } else if (tableTitle === 'dashboard') {
      navigate("/Leads");
    }
  };
const [activeData,setActiveData]=useState()
  useEffect(()=>{
    if (tableTitle === 'Leads') {
      setActiveData("leads")
    } else if (tableTitle === 'Assigned Leads') {
      setActiveData("assigned")
    } else if (tableTitle === 'Unassigned Leads') {
      setActiveData("unassigned")
    } else if (tableTitle === 'dashboard') {
      setActiveData("dashboard")
    }
  })

  const handleDelete = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.put(
            `${APi_Url}/digicoder/crm/api/v1/lead/delete/${viewdata._id}`
          );

          if (response.status === 200) {
            toast.success('Lead deleted successfully!');
            navigate('/leads');
          }
        } catch (error) {
          console.error("Error deleting lead:", error);
          toast.error('There was an error deleting the lead.');
        }
      }
    });
  };

  const fetchFollowups = async () => {
    try {
      const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/followup/getall/${viewdata._id}`);
      setFollowUps(response.data.followups); 
    } catch (error) {
      console.log(error);
    }
  }

  const [followUps, setFollowUps] = useState([]);

  useEffect(() => {
    fetchFollowups()
  }, [])

  return (
    <div>
      <Dashboard active={activeData}>
        <div className="content fullLead-outer">
          <div className="fullLead-outer">
            <div className="fullLeads-header">
              <div className="back-btn">
                <button onClick={handleBack}>
                  <i className="ri-arrow-left-line"></i> Back
                </button>
              </div>
              <div className="fullLeads-icons">
                <button style={{ color: "red" }} onClick={handleDelete}>
                  <i className="ri-delete-bin-5-fill"></i>
                </button>
              </div>
            </div>

            <div className="fullLeads-view-data">
              <div className="view-data-title">
                <span>INFORMATION</span>
              </div>
              <div className="view-info-form">
                <div className="form-row">
                  <div>
                    <div className="label">Name</div>
                    <input
                      type="text"
                      className="input-field"
                      name="name"
                      value={formData.name}
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
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Gender</div>
                    <select
                      className="input-field"
                      name="gender"
                      value={formData.gender}
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
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Priority</div>
                    <Dropdown
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      options={priorityOptions}
                      onChange={(e) => handleChange({ target: { name: 'priority', value: e.value } })}
                      optionLabel="label"
                      disabled={isDisabled}
                      placeholder="Select priority"
                      className="p-dropdown"
                    />
                  </div>
                  <div>
                    <div className="label">Source</div>
                    <Dropdown
                      id="sources"
                      name="sources"
                      value={formData.sources}
                      options={sourcesOptions}
                      onChange={(e) => handleChange({ target: { name: 'sources', value: e.value } })}
                      optionLabel="label"
                      disabled={isDisabled}
                      placeholder="Select source"
                      className="p-dropdown"
                    />
                  </div>
                  <div>
                    <div className="label">City</div>
                    <input
                      type="text"
                      className="input-field"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Zip Code</div>
                    <input
                      type="number"
                      className="input-field"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">State</div>
                    <input
                      type="text"
                      className="input-field"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Country</div>
                    <input
                      type="text"
                      className="input-field"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <FormControl sx={{ width: "250px", m: 1 }}>
                      <InputLabel id="tags-label">Tags</InputLabel>
                      <Select
                        labelId="tags-label"
                        id="tags-select"
                        multiple
                        value={selectedTags}
                        onChange={handleTagChange}
                        input={<OutlinedInput label="Tags" />}
                        renderValue={(selected) => selected.join(', ')}
                        MenuProps={MenuProps}
                        disabled={isDisabled}
                      >
                        {tagData.map((item) => (
                          <MenuItem key={item.tagName} value={item.tagName}>
                            <Checkbox checked={selectedTags.indexOf(item.tagName) > -1} />
                            <ListItemText primary={item.tagName} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  <div>
                    <div className="label">Lead Status</div>
                    <input
                      type="text"
                      className="input-field"
                      name="leadStatus"
                      value={formData.leadStatus}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Assigned To</div>
                    <input
                      type="text"
                      className="input-field"
                      name="leadAssignedTo"
                      value={formData.leadAssignedTo}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="view-edit-btn">
                  <button onClick={isEditing ? handleSave : handleUpdate}>
                    {isEditing ? "Save" : "Update"}
                  </button>
                </div>
              </div>
            </div>

            <div className="follow-ups">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="view-data-titlee">
                  <span>FOLLOW UP</span>
                </div>
              </div>

              <div className="follow-ups">
                {followUps.map((followUp,index) => (
                  <div key={followUp.id} className="follow-outer">
                    <div className="follow-body">
                      <div className="follow-body-header">
                        <div className="followup-srNo">{index+1}</div>
                        <div>
                          <span className="cratedBy">Created Date-</span>
                          <span className="cratedBy">{followUp.createdAt.split("T")[0]}</span>
                          <div style={{ marginTop: "5px" }}>
                            <span className="cratedBy">Created By-</span>
                            <span className="cratedBy">{followUp.followedBy.empName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="follow-ups-txt">
                        <p>{followUp.followupMessage
                        }</p>
                      </div>
                    </div>
                    <hr />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Dashboard>
      <ToastContainer />
    </div>
  );
}

export default FullLeads;

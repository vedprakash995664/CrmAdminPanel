import React, { useEffect, useRef, useState, useCallback } from 'react';
import Dashboard from '../Components/Dashboard';
import DynamicTable from '../Components/DynmicTables';
import DynamicCard from '../Components/DynamicCard';
import './CSS/Lead.css';
import ModalForm from '../Components/LeadForm';
import { Dropdown } from 'primereact/dropdown';
import * as XLSX from 'xlsx';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployee, fetchLeads, fetchPriority, fetchSources } from '../Features/LeadSlice';
import axios from 'axios';
import DeletedDynamicTable from '../Components/DeletedDynamicTable';
import DeletedDynamicCard from '../Components/DeletedDynamicCard';
import { Toast } from 'primereact/toast';

function Leads() {
  // State management
  const [leadData, setLeadData] = useState([]);
  const [lead, setLeads] = useState([]);
  const [tableTitle] = useState('Leads');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [buttonTitle, setButtonTitle] = useState('');
  const [fileData, setFileData] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Custom MultiSelect states
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [filteredTags, setFilteredTags] = useState([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  
  // Refs and Redux
  const tagData = useSelector((state) => state.leads.tag);
  const tagDropdownRef = useRef(null);
  const toast = useRef(null);
  const dispatch = useDispatch();
  
  // API URL and Admin ID
  const APi_Url = import.meta.env.VITE_API_URL;
  const AdminId = sessionStorage.getItem('AdminId');
  
  // Selector data
  const priorityData = useSelector((state) => state.leads.Priority);
  const sourcesData = useSelector((state) => state.leads.leadSources);
  const employeeData = useSelector((state) => 
    state.leads.Employee?.filter(item => item?.blocked === false) || []
  );

  // Options for dropdowns
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [sourcesOptions, setSourcesOptions] = useState([]);
  const [employee, setEmployee] = useState([]);

  // Constants
  const MAX_VISIBLE_TAGS = 2;

  // Event handlers
  const handleClose = useCallback(() => setShow(false), []);
  const handleShow = useCallback(() => setShow(true), []);

  // Filter leads by deleted status
  const filteredLead = lead.filter(lead => !lead.deleted);
  const deletedLead = lead.filter(lead => lead.deleted);

  // Format dropdown options when data changes
  useEffect(() => {
    if (Array.isArray(sourcesData)) {
      setSourcesOptions(
        sourcesData.map(sources => ({
          label: sources.leadSourcesText,
          value: sources._id
        }))
      );
    }
    
    if (Array.isArray(priorityData)) {
      setPriorityOptions(
        priorityData.map(priority => ({
          label: priority.priorityText,
          value: priority._id
        }))
      );
    }
    
    if (Array.isArray(employeeData)) {
      setEmployee(
        employeeData.map(employee => ({
          label: employee.empName,
          value: employee._id
        }))
      );
    }
  }, [sourcesData, priorityData, employeeData]);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchPriority());
    dispatch(fetchSources());
    dispatch(fetchEmployee());
    fetchLead();
  }, [dispatch]);

  // Filter tags based on search query
  useEffect(() => {
    if (Array.isArray(tagData)) {
      if (tagSearchQuery.trim() === '') {
        setFilteredTags(tagData);
      } else {
        const filtered = tagData.filter(tag => 
          tag.tagName.toLowerCase().includes(tagSearchQuery.toLowerCase())
        );
        setFilteredTags(filtered);
      }
    }
  }, [tagSearchQuery, tagData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setIsTagDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // API call to fetch leads
  const fetchLead = useCallback(async () => {
    try {
      const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/lead/getall/${AdminId}`);
      if (response.data && response.data.leads) {
        setLeads(response.data.leads);
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch lead data.',
        life: 3000,
      });
    }
  }, [APi_Url, AdminId]);

  // Open modal for adding a new lead
  const handleAdd = useCallback(() => {
    setTitle('Add New Lead');
    setButtonTitle('Add Lead');
    setIsModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Handle Excel file upload
  const handleFileUpload = useCallback((e) => {
    setLoading(true);
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const arrayBuffer = evt.target.result;
          const wb = XLSX.read(arrayBuffer, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(ws);

          if (data.length > 0) {
            setLeadData(data);
            setFileData(data);
          } else {
            toast.current?.show({
              severity: 'warn',
              summary: 'No Data',
              detail: 'No data found in the uploaded Excel file.',
              life: 3000,
            });
          }
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to process Excel file.',
            life: 3000,
          });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.current?.show({
        severity: 'warn',
        summary: 'Missing File',
        detail: 'No file selected. Please choose a file to upload.',
        life: 3000,
      });
      setLoading(false);
    }
  }, []);

  // Handle bulk upload
  const handleBulkUpload = useCallback(async () => {
    if (!selectedSource || !selectedPriority) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Warning',
        detail: 'Please select both Source and Priority.',
        life: 3000,
      });
      return;
    }

    if (leadData.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'No Data',
        detail: 'Please upload an Excel file with lead data.',
        life: 3000,
      });
      return;
    }

    setIsUploading(true);

    // Apply selected values to all leads
    const processedLeadData = leadData.map(lead => ({
      ...lead,
      priority: selectedPriority,
      sources: selectedSource,
      leadAssignedTo: selectedEmployee,
      tags: selectedTagId
    }));

    try {
      const response = await axios.post(
        `${APi_Url}/digicoder/crm/api/v1/lead/addmany/${AdminId}`, 
        {
          leadsArray: processedLeadData,
          userType: 'Admin',
        }
      );

      if (response.data.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Leads added successfully.',
          life: 3000,
        });
        
        // First fetch updated data
        await fetchLead();
        
        // Reset states
        setLeadData([]);
        setFileData([]);
        setSelectedPriority(null);
        setSelectedSource(null);
        setSelectedEmployee(null);
        setSelectedTags([]);
        setSelectedTagId([]);
        
        // Close modal
        handleClose();
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: response.data.message || 'Something went wrong.',
          life: 3000,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'There was an error uploading the leads. Please try again.',
        life: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  }, [
    selectedSource, 
    selectedPriority, 
    selectedEmployee, 
    selectedTagId, 
    leadData, 
    handleClose, 
    fetchLead, 
    APi_Url, 
    AdminId
  ]);

  // Download sample file
  const handleDownload = useCallback(() => {
    const fileUrl = "/sample_leads.xlsx";
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "sample_leads.xlsx";
    link.click();
  }, []);

  // Handle dropdown changes
  const handlePriorityChange = useCallback((e) => {
    setSelectedPriority(e.value);
  }, []);

  const handleSourceChange = useCallback((e) => {
    setSelectedSource(e.value);
  }, []);

  const handleEmployeeChange = useCallback((e) => {
    setSelectedEmployee(e.value);
  }, []);

  // Custom MultiSelect functions
  const toggleTagDropdown = useCallback(() => {
    setIsTagDropdownOpen(prev => !prev);
  }, []);

  const handleTagSearchChange = useCallback((e) => {
    setTagSearchQuery(e.target.value);
  }, []);

  const toggleTagSelection = useCallback((myTag) => {
    setSelectedTags(prev => {
      if (prev.includes(myTag.tagName)) {
        return prev.filter(tag => tag !== myTag.tagName);
      } else {
        return [...prev, myTag.tagName];
      }
    });
    
    setSelectedTagId(prev => {
      if (prev.includes(myTag._id)) {
        return prev.filter(id => id !== myTag._id);
      } else {
        return [...prev, myTag._id];
      }
    });
  }, []);

  const removeTag = useCallback((tagToRemove, event) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
    
    // Find the tag id to remove
    const tagToRemoveObj = tagData?.find(tag => tag.tagName === tagToRemove);
    if (tagToRemoveObj) {
      setSelectedTagId(prev => prev.filter(id => id !== tagToRemoveObj._id));
    }
  }, [tagData]);

  const isTagSelected = useCallback((tagName) => {
    return selectedTags.includes(tagName);
  }, [selectedTags]);

  // Helper functions
  const truncateTag = useCallback((tag, maxLength = 10) => {
    return tag.length > maxLength ? `${tag.substring(0, maxLength)}...` : tag;
  }, []);

  const getDisplayTags = useCallback(() => {
    if (selectedTags.length <= MAX_VISIBLE_TAGS) {
      return selectedTags;
    }
    return [...selectedTags.slice(0, MAX_VISIBLE_TAGS)];
  }, [selectedTags, MAX_VISIBLE_TAGS]);

  return (
    <div>
      <Toast ref={toast} />
      <Dashboard active={'leads'}>
        <div className="content">
          <div className="lead-header">
            <div className="lead-Add-btn">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="import-excel"
              />
              <button onClick={handleShow}>Import Leads</button>
              <button onClick={handleAdd}>Add Lead</button>
            </div>
          </div>

          {loading && <div className="loading">Processing file...</div>}

          {/* Table Section */}
          <div className="lead-table-container">
            <DynamicTable className='dynamicTable' lead={filteredLead} tableTitle={tableTitle} />
          </div>
          <br /><br />
          <div className="lead-table-container">
            <DeletedDynamicTable lead={deletedLead} tableTitle={"Deleted Leads"} />
          </div>
          <div className="lead-card-container">
            <DynamicCard className='dynamicTable' lead={filteredLead} tableTitle={tableTitle} />
          </div>
          <br /><br />
          <div className="lead-card-container">
            <DeletedDynamicCard lead={deletedLead} tableTitle={"Deleted Leads"} />
          </div>
          <br />
          <ModalForm isOpen={isModalOpen} onClose={closeModal} title={title} buttonTitle={buttonTitle} leadData={filteredLead} />
        </div>

        {/* Modal for Import and Download */}
        <Modal
          show={show}
          onHide={handleClose}
          style={{ zIndex: 999 }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Import/Download Leads</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{ display: "flex", justifyContent: "space-around", gap: "10px" }}>
              <button
                style={{
                  padding: '10px',
                  border: "none",
                  backgroundColor: "#3454D1",
                  color: "white",
                  borderRadius: "5px",
                  width: "50%"
                }}
                onClick={() => document.getElementById('import-excel').click()}
              >
                Import Excel File
              </button>
              <button
                style={{
                  padding: '10px',
                  border: "none",
                  backgroundColor: "#FD1E20",
                  color: "white",
                  borderRadius: "5px",
                  width: "50%"
                }}
                onClick={handleDownload}
              >
                Download Sample File
              </button><br />
            </div><br />
            <div className='dropdown-option'>
              <Dropdown
                id="priority"
                name="priority"
                value={selectedPriority}
                options={priorityOptions}
                onChange={handlePriorityChange}
                optionLabel="label"
                optionValue="value"
                placeholder="Select priority"
                className="p-dropdown p-component"
                required
              />

              <Dropdown
                id="sources"
                name="sources"
                value={selectedSource}
                options={sourcesOptions}
                onChange={handleSourceChange}
                optionLabel="label"
                optionValue="value"
                placeholder="Select source"
                className="p-dropdown p-component"
                required
              />
            </div><br />
            <div style={{ display: "flex", gap: "10px" }}>
              <Dropdown
                id="employee"
                name="employee"
                value={selectedEmployee}
                options={employee}
                onChange={handleEmployeeChange}
                optionLabel="label"
                placeholder="Select Employee"
                className="p-dropdown p-component"
                style={{ width: "50%" }}
              />
              
              {/* Custom MultiSelect implementation with fixed height */}
              <div 
                ref={tagDropdownRef}
                style={{ 
                  width: '50%', 
                  position: 'relative',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
                }}
              >
                {/* MultiSelect header with fixed height */}
                <div 
                  onClick={toggleTagDropdown}
                  style={{
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    padding: '0.5rem 0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    height: '50px',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'nowrap', 
                    gap: '4px',
                    maxWidth: '90%',
                    overflow: 'hidden',
                    alignItems: 'center'
                  }}>
                    {selectedTags.length === 0 ? (
                      <span style={{ color: '#6c757d' }}>Select tags</span>
                    ) : (
                      <>
                        {getDisplayTags().map((tag, index) => (
                          <div 
                            key={index}
                            style={{
                              backgroundColor: '#e9ecef',
                              borderRadius: '3px',
                              padding: '0.2rem 0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '0.875rem',
                              whiteSpace: 'nowrap',
                              maxWidth: '80px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {truncateTag(tag)}
                            <span 
                              onClick={(e) => removeTag(tag, e)}
                              style={{
                                marginLeft: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              ×
                            </span>
                          </div>
                        ))}
                        {selectedTags.length > MAX_VISIBLE_TAGS && (
                          <div style={{
                            backgroundColor: '#e9ecef',
                            borderRadius: '3px',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.875rem',
                            whiteSpace: 'nowrap'
                          }}>
                            +{selectedTags.length - MAX_VISIBLE_TAGS} more
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <span style={{ color: '#6c757d' }}>▼</span>
                </div>

                {/* Dropdown panel */}
                {isTagDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    backgroundColor: 'white',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    marginTop: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 1000
                  }}>
                    {/* Search input */}
                    <div style={{ padding: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Search tags"
                        value={tagSearchQuery}
                        onChange={handleTagSearchChange}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #ced4da',
                          borderRadius: '4px'
                        }}
                      />
                    </div>

                    {/* Selected tags counter */}
                    {selectedTags.length > 0 && (
                      <div style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '0.875rem',
                        color: '#6c757d'
                      }}>
                        {selectedTags.length} item{selectedTags.length !== 1 ? 's' : ''} selected
                      </div>
                    )}

                    {/* Options list */}
                    <div style={{ 
                      maxHeight: '200px', 
                      overflowY: 'auto',
                      padding: '0.5rem 0'
                    }}>
                      {filteredTags.length > 0 ? filteredTags.map((tag) => (
                        <div
                          key={tag._id}
                          onClick={() => toggleTagSelection(tag)}
                          style={{
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            backgroundColor: isTagSelected(tag.tagName) ? '#e9ecef' : 'transparent',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isTagSelected(tag.tagName)}
                            readOnly
                            style={{ marginRight: '8px' }}
                          />
                          {tag.tagName}
                        </div>
                      )) : (
                        <div style={{ padding: '0.5rem 1rem', color: '#6c757d' }}>
                          No tags found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div><br />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <button 
                onClick={handleBulkUpload} 
                className='saveBulk'
                disabled={isUploading}
              >
                {isUploading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    <div className="spinner" style={{
                      width: "20px",
                      height: "20px",
                      border: "3px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "50%",
                      borderTop: "3px solid #fff",
                      animation: "spin 1s linear infinite"
                    }}></div>
                    <span>Uploading...</span>
                  </div>
                ) : 'Upload Leads'}
              </button>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Add this CSS for the spinner animation */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Dashboard>
    </div>
  );
}

export default Leads;
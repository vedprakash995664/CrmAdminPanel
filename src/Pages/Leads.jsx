import React, { useEffect, useState } from 'react';
import Dashboard from '../Components/Dashboard';
import DynamicTable from '../Components/DynmicTables';
import DynamicCard from '../Components/DynamicCard';
import './CSS/Lead.css';
import ModalForm from '../Components/LeadForm';
import { Dropdown } from 'primereact/dropdown';
import * as XLSX from 'xlsx'; // Import the xlsx library
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads, fetchPriority, fetchSources } from '../Features/LeadSlice';
import axios from 'axios';
import DeletedDynamicTable from '../Components/DeletedDynamicTable';
import DeletedDynamicCard from '../Components/DeletedDynamicCard';

function Leads() {
  const [leadData, setLeadData] = useState([]);
  const [tableTitle, setTableTitle] = useState('Leads');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [buttonTitle, setButtonTitle] = useState('');
  const [fileData, setFileData] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for file processing
  const [selectedPriority, setSelectedPriority] = useState(null); // State for selected priority
  const [selectedSource, setSelectedSource] = useState(null); // State for selected source
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const dispatch = useDispatch();
  const priorityData = useSelector((state) => state.leads.Priority);
  const sourcesData = useSelector((state) => state.leads.leadSources);

  const [priorityOptions, setPriorityOptions] = useState([]);
  const [sourcesOptions, setSourcesOptions] = useState([]);

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
    dispatch(fetchPriority());
    dispatch(fetchSources());
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

  const APi_Url = import.meta.env.VITE_API_URL;

  const leads = useSelector((state) => state.leads.leads);
  const filteredLead = leads.filter((lead) => lead.deleted === false);
  const deteledLead = leads.filter((lead) => lead.deleted === true);

  // Open modal for adding a new lead
  const handleAdd = () => {
    setTitle('Add New Lead');
    setButtonTitle('Add Lead');
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Fetch lead data on component mount
  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  // Handle Excel file upload
  const handleFileUpload = async (e) => {
    setLoading(true); // Start loading state
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload =(evt) => {
        const arrayBuffer = evt.target.result;
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length > 0) {
          // Append the Excel data to the existing lead data
          setLeadData((prevData) => [...prevData, ...data]);
          

          // Send the data to the backend via POST request
         
        } else {
          console.warn("No data found in the uploaded Excel file.");
        }

        setFileData(data); // Store the file data in state
        setLoading(false); // End loading state
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("No file selected. Please choose a file to upload.");
      setLoading(false);
    }
  };

  const handlebulkUpload = async () => {
    console.log(selectedPriority);
    console.log(selectedSource);
    console.log(leadData);

    leadData.forEach(lead => {
      lead.priority = selectedPriority; 
      lead.sources=selectedSource
    });
  
    console.log(leadData);
    try {
        const AdminId = sessionStorage.getItem("AdminId");
        const response = await axios.post(`${APi_Url}/digicoder/crm/api/v1/lead/addmany/${AdminId}`, {
          leadsArray: leadData,
          userType: 'Admin', // Adjust this based on your requirement (Admin or Employee)
        });
  
        // Handle the response
        if (response.data.success) {
          console.log("Leads added successfully:", response.data.leads);
          window.location.reload();
        } else {
          console.warn(response.data.message);
        }
      } catch (error) {
        console.error("Error adding leads:", error);
        alert("There was an error uploading the file. Please try again.");
      }
  }
  

  // Download sample file
  const handleDownload = () => {
    const fileUrl = "/sample_leads.xlsx";
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "sample_leads.xlsx";
    link.click();
  };

  // Handle dropdown change for priority
  const handlePriorityChange = (e) => {
    setSelectedPriority(e.value);
  };

  // Handle dropdown change for source
  const handleSourceChange = (e) => {
    setSelectedSource(e.value);
  };

  return (
    <div>
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
              <button onClick={handleShow}>Import</button>
              <button onClick={handleAdd}>Add Lead</button>
            </div>
          </div>

          {/* Loading indicator */}
          {loading && <div className="loading">Processing file...</div>}

          {/* Table Section */}
          <div className="lead-table-container">
            <DynamicTable className='dynamicTable' lead={filteredLead} tableTitle={tableTitle} />
          </div>
          <br /><br />
          <div className="lead-table-container">
            <DeletedDynamicTable lead={deteledLead} tableTitle={"Deleted Leads"} />
          </div>
          <div className="lead-card-container">
            <DynamicCard className='dynamicTable' lead={filteredLead} tableTitle={tableTitle} />
          </div>
          <br /><br />
          <div className="lead-card-container">
            <DeletedDynamicCard lead={deteledLead} tableTitle={"Deleted Leads"} />
          </div>
          <br />
          <ModalForm isOpen={isModalOpen} onClose={closeModal} title={title} buttonTitle={buttonTitle} leadData={filteredLead} />
        </div>

        {/* Modal for Import and Download */}
        <Modal
          show={show}
          onHide={handleClose}
          style={{zIndex:999}}
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
                  borderRadius: "5px"
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
                  borderRadius: "5px"
                }}
                onClick={handleDownload}
              >
                Download Sample File
              </button><br />
            </div><br />
            <div style={{ display: "flex", justifyContent: "space-around", gap: "10px" }}>

              {/* Set zIndex higher on Dropdown to ensure it appears above the Modal */}
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
                
              />

              <Dropdown
                id="sources"
                name="sources"
                value={selectedSource}
                options={sourcesOptions}
                onChange={handleSourceChange}
                optionLabel="value"
                placeholder="Select source"
                className="p-dropdown p-component"
                
              />
            </div><br />
            <button onClick={()=>handlebulkUpload()}>Save</button>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

      </Dashboard>
    </div>
  );
}

export default Leads;
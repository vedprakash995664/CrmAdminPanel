import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import Modal from 'react-bootstrap/Modal';
import Dashboard from '../../Components/Dashboard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTags } from '../../Features/LeadSlice';
import Swal from 'sweetalert2';
import axios from 'axios';

function Tag() {
  const APi_Url = import.meta.env.VITE_API_URL;
  const [newTag, setNewTag] = useState('');
  const [show, setShow] = useState(false);
  const dispatch = useDispatch();
  const tagData = useSelector((state) => state.leads.tag);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  const handleClose = () => {
    setShow(false);
    setNewTag('');
  };

  const handleShow = () => setShow(true);

  const handleSaveTag = async () => {
    if (!newTag.trim()) {
      toast.error('Tag name cannot be empty');
      return;
    }

    try {
      const AdminId = sessionStorage.getItem('AdminId');
      const userType = "Admin";
      const apiUrl = `${APi_Url}/digicoder/crm/api/v1/tags/add/${AdminId}`;
      
      const response = await axios.post(apiUrl, { tagName: newTag, userType });
      toast.success('Tag saved successfully');
      setShow(false);
      dispatch(fetchTags()); // Refetch after saving the new tag
    } catch (error) {
      toast.error('Error saving tag');
      console.error("Error details: ", error);
    }
  };

  const serialNumberTemplate = (rowData, props) => {
    return props.rowIndex + 1;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div>
        <button
          style={{ 
            color: "red", 
            backgroundColor: "transparent", 
            border: "none", 
            fontSize: "20px", 
            cursor: "pointer" 
          }}
          onClick={() => handleDelete(rowData)}
        >
          <i className="ri-delete-bin-5-fill"></i>
        </button>
      </div>
    );
  };

  const handleDelete = (rowData) => {
    if (!rowData._id) {
      toast.error('Invalid tag data');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const apiUrl = `${APi_Url}/digicoder/crm/api/v1/tags/delete/${rowData._id}`;
          await axios.delete(apiUrl);
          toast.success('Tag deleted successfully');
          dispatch(fetchTags()); // Refresh the list after deletion
        } catch (error) {
          console.error("Error deleting tag:", error);
          toast.error(error.response?.data?.message || 'Error deleting tag');
        }
      }
    });
  };

  return (
    <div>
      <Dashboard active={'tag'}>
        <div className="content-wrapper">
          <div className="content">
            <div className="card">
              <div className="flex justify-content-between p-4">
                <h1>Tags</h1>
                <button 
                  style={{
                    border: "none",
                    backgroundColor: "#3454D1",
                    color: "white",
                    fontSize: "18px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    padding: "0px 20px"
                  }}
                  onClick={handleShow}
                >
                  Add New
                </button>
              </div>
              
              <DataTable 
                value={tagData || []} 
                stripedRows 
                bordered
                emptyMessage="No tags found"
              >
                <Column 
                  header="Sr. No." 
                  body={serialNumberTemplate} 
                  style={{ width: '70px' }}
                />
                <Column field="tagName" header="Tags" sortable />
                <Column header="Action" body={actionBodyTemplate} />
              </DataTable>

              <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
              >
                <Modal.Header closeButton>
                  <Modal.Title>Add New Tag</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div style={{display:"flex", justifyContent:"space-around"}}>
                    <input 
                      type="text" 
                      placeholder="Enter tag" 
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      style={{
                        outline:"none", 
                        padding:"8px", 
                        width:"100%"
                      }}
                    />
                    <button 
                      onClick={handleSaveTag}
                      style={{
                        marginLeft:"10px", 
                        padding:"10px 26px", 
                        border:"none", 
                        backgroundColor:"#3454D1", 
                        color:"white", 
                        fontSize:"20px"
                      }}
                    >
                      Save
                    </button>
                  </div>
                </Modal.Body>
              </Modal>
            </div>
          </div>
        </div>
      </Dashboard>
      <ToastContainer />
    </div>
  );
}

export default Tag;

import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false); // Page loader
  const [btnLoading, setBtnLoading] = useState(false); // Button loader

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
    const loadTags = async () => {
      setLoading(true);
      await dispatch(fetchTags());
      setLoading(false);
    };
    loadTags();
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
      setBtnLoading(true);
      const AdminId = sessionStorage.getItem('AdminId');
      const userType = "Admin";
      const apiUrl = `${APi_Url}/digicoder/crm/api/v1/tags/add/${AdminId}`;
      
      await axios.post(apiUrl, { tagName: newTag, userType });
      toast.success('Tag saved successfully');
      setShow(false);
      setNewTag('');
      await dispatch(fetchTags());
    } catch (error) {
      toast.error('Error saving tag');
      console.error("Error details: ", error);
    } finally {
      setBtnLoading(false);
    }
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
          setLoading(true);
          const apiUrl = `${APi_Url}/digicoder/crm/api/v1/tags/delete/${rowData._id}`;
          await axios.delete(apiUrl);
          toast.success('Tag deleted successfully');
          await dispatch(fetchTags());
        } catch (error) {
          console.error("Error deleting tag:", error);
          toast.error(error.response?.data?.message || 'Error deleting tag');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const serialNumberTemplate = (rowData, props) => props.rowIndex + 1;

  const actionBodyTemplate = (rowData) => (
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
  );

  const filteredTags = tagData.filter(tag =>
    tag.tagName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

              <div className="flex justify-content-between p-4">
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    outline: "none",
                    padding: "8px",
                    width: "50%",
                    border: "1px solid #ccc",
                    borderRadius: "4px"
                  }}
                />
              </div>

              {loading ? (
                <div className="loader-wrapper">
                  <div className="custom-loader"></div>
                </div>
              ) : (
                <DataTable
                  value={filteredTags}
                  stripedRows
                  bordered
                  emptyMessage="No tags found"
                >
                  <Column header="Sr. No." body={serialNumberTemplate} style={{ width: '70px' }} />
                  <Column field="tagName" header="Tags" sortable />
                  <Column header="Action" body={actionBodyTemplate} />
                </DataTable>
              )}

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
                  <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <input
                      type="text"
                      placeholder="Enter tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      style={{ outline: "none", padding: "8px", width: "100%" }}
                    />
                    <button
                      onClick={handleSaveTag}
                      disabled={btnLoading}
                      style={{
                        marginLeft: "10px",
                        padding: "10px 26px",
                        border: "none",
                        backgroundColor: "#3454D1",
                        color: "white",
                        fontSize: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: btnLoading ? "not-allowed" : "pointer",
                        opacity: btnLoading ? 0.7 : 1
                      }}
                    >
                      {btnLoading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </Modal.Body>
              </Modal>
            </div>
          </div>
        </div>
      </Dashboard>
      <ToastContainer />

      {/* Styles for loaders */}
      <style>{`
        .loader-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 0;
        }

        .custom-loader {
          width: 60px;
          height: 60px;
          border: 6px solid #f3f3f3;
          border-top: 6px solid #3454D1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spinner-border {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          vertical-align: text-bottom;
          border: 0.15em solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spinner-border .75s linear infinite;
        }

        @keyframes spinner-border {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default Tag;

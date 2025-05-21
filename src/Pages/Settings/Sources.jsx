import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Modal from 'react-bootstrap/Modal';
import Dashboard from '../../Components/Dashboard';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { fetchSources } from '../../Features/LeadSlice';
import axios from 'axios';

function Sources() {
  const [show, setShow] = useState(false);
  const [SourcesText, setSourcesText] = useState('');
  const [loading, setLoading] = useState(false);     // For full page loader
  const [btnLoading, setBtnLoading] = useState(false); // For Save button loader

  const APi_Url = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sourcesData = useSelector((state) => state.leads.leadSources);

  const handleClose = () => {
    setShow(false);
    setSourcesText('');
  };

  const handleShow = () => setShow(true);

  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const loadSources = async () => {
      setLoading(true);
      await dispatch(fetchSources());
      setLoading(false);
    };
    loadSources();
  }, [dispatch]);

  const srNoTemplate = (rowData, { rowIndex }) => <span>{rowIndex + 1}</span>;

  const handleSaveSource = async () => {
    if (SourcesText.trim() === '') {
      toast.error('Source text cannot be empty');
      return;
    }

    try {
      setBtnLoading(true);
      const AdminId = sessionStorage.getItem('AdminId');
      const userType = 'Admin';
      const apiUrl = `${APi_Url}/digicoder/crm/api/v1/leadSources/add/${AdminId}`;
      await axios.post(apiUrl, { SourcesText, userType });
      toast.success('Source added successfully');
      setSourcesText('');
      setShow(false);
      await dispatch(fetchSources());
    } catch (error) {
      toast.error('Error saving source');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = (rowData) => {
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
          const apiUrl = `${APi_Url}/digicoder/crm/api/v1/leadSources/delete/${rowData._id}`;
          await axios.delete(apiUrl);
          toast.success('Source deleted successfully');
          await dispatch(fetchSources());
        } catch (error) {
          toast.error('Error deleting source');
        } finally {
          setLoading(false);
        }
      }
    });
  };

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

  return (
    <div>
      <Dashboard active={'source'}>
        <div className="content-wrapper">
          <div className="content">
            <div className="card">
              <div className="flex justify-content-between p-4">
                <h1>Sources</h1>
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

              {loading ? (
                <div className="loader-wrapper">
                  <div className="custom-loader"></div>
                </div>
              ) : (
                Array.isArray(sourcesData) && sourcesData.length > 0 ? (
                  <DataTable value={sourcesData} stripedRows bordered>
                    <Column body={srNoTemplate} header="Sr. No." sortable />
                    <Column field="leadSourcesText" header="Source" sortable />
                    <Column header="Action" body={actionBodyTemplate} />
                  </DataTable>
                ) : (
                  <div style={{ padding: "1rem" }}>No source data available</div>
                )
              )}

              <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
              >
                <Modal.Header closeButton>
                  <Modal.Title>Add New Source</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <input
                      type="text"
                      value={SourcesText}
                      onChange={(e) => setSourcesText(e.target.value)}
                      placeholder="Enter Source"
                      style={{ outline: "none", padding: "8px", width: "100%" }}
                    />
                    <button
                      onClick={handleSaveSource}
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

      {/* Loaders CSS */}
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

export default Sources;

import React, { useState, useEffect, useRef } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import Modal from './LeadForm';
import { useNavigate } from 'react-router-dom';
import './CSS/DynamicTable.css'
import AssignTaskModal from './AssignTaskModal';
import { Toast } from 'primereact/toast';
import Swal from 'sweetalert2'; // Import SweetAlert2

import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployee } from '../Features/LeadSlice';

export default function DynamicTable({ lead, tableTitle }) {
    const APi_Url=import.meta.env.VITE_API_URL
    const [showModal, setShowModal] = useState(false);
    const dispatch = useDispatch();
    const employeeData = useSelector((state) => state.leads.Employee|| []).filter((item)=>item?.blocked===false);

       useEffect(() => {  
            dispatch(fetchEmployee());
        }, [dispatch]);

    const toast = useRef(null);

    const handleShow = () => {
        if (selectedRows.length === 0) {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please select at least one row before assigning.', life: 3000 });
        } else {
            setShowModal(true);
        }
    };

    const handleClose = () => setShowModal(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [isEditMode, setEditMode] = useState(false);
    const [buttonTitle, setButtonTitle] = useState('');
    const [leadData, setLeadData] = useState([]);
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        phone: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        priority: { value: null, matchMode: FilterMatchMode.EQUALS },
        sources: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    });

    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(5);
    const [selectedRows, setSelectedRows] = useState([]);

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between gap-3 align-items-center p-2">
                <h5>{tableTitle}</h5>
                <div>
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" style={{ width: "100%", maxWidth: "200px", marginRight: "10px" }} />
                    <button onClick={handleShow} className='assignLeadBtn'>Assign Leads</button>
                </div>
            </div>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex justify-content-around gap-3">
                <button onClick={() => handleEdit(rowData)} style={{ borderRadius: "50%", border: "none", height: "40px", width: "40px", backgroundColor: "#EDF1FF", color: "#3454D1" }}>
                    <i className="ri-edit-box-fill"></i>
                </button>
                <button onClick={() => handleDelete(rowData)} style={{ borderRadius: "50%", border: "none", height: "40px", width: "40px", backgroundColor: "#EDF1FF", color: "red" }}>
                    <i className="ri-delete-bin-5-fill"></i>
                </button>
                <button onClick={() => handleView(rowData)} style={{ borderRadius: "50%", border: "none", height: "40px", width: "40px", backgroundColor: "#EDF1FF", color: "#3454D1", fontWeight: "bold" }}>
                    <i className="ri-eye-line"></i>
                </button>
            </div>
        );
    };

    const openModal = (isEdit) => {
        setEditMode(isEdit);
        setTitle(isEdit ? "Update Lead" : "Add New Lead");
        setButtonTitle(isEdit ? "Update Lead" : "Add Lead");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleEdit = (rowData) => {
        const viewdata = rowData;
        const fromEdit="FromEdit"
        navigate('fullLeads', { state: {tableTitle ,fromEdit,viewdata} });
        
    };


    const handleDelete = async (rowData) => {
        // Use SweetAlert2 for confirmation
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.put(`${APi_Url}/digicoder/crm/api/v1/lead/delete/${rowData._id}`);
                    
                    if (response.status === 200) {
                        // Filter out the deleted lead from the leadData state
                        const updatedLeads = leadData.filter((item) => item._id !== rowData._id);
                        setLeadData(updatedLeads);
                        
                        // Show success toast notification
                        toast.current.show({severity: 'success',summary: 'Success',detail: 'Lead deleted successfully!',life: 3000});
                        window.location.reload();
                    }
                } catch (error) {
                    console.error("Error deleting lead:", error);
                    // alert("There was an error deleting the lead.");
                    toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'There was an error deleting the lead.', life: 3000 });
                }
            }
        });
    };
    const handleView = (rowData) => {
        const viewdata = rowData;
        navigate('fullLeads', { state: { viewdata, tableTitle } });
    };

    const handleCheckboxChange = (e, rowData) => {
        const checked = e.target.checked;
        if (checked) {
            setSelectedRows([...selectedRows, rowData]);
        } else {
            setSelectedRows(selectedRows.filter(item => item !== rowData));
        }
    };
    
    

    const header = renderHeader();

    return (
        <div className="card">
            <Toast ref={toast} />
            <DataTable
                value={lead}
                rows={rows}
                first={first}
                paginator
                dataKey="id"
                filters={filters}
                filterDisplay="row"
                globalFilterFields={['name', 'phone', 'priority', 'sources', 'leadAssignedTo']}
                header={header}
                emptyMessage="No customers found."
                onPage={onPageChange}
                paginatorTemplate=" PrevPageLink PageLinks NextPageLink "
                removableSort
                style={{ borderRadius: "10px" }}
            >
                <Column
                    header="SR No"
                    body={(rowData, { rowIndex }) => (
                        <div className="flex align-items-center gap-3">
                            <input
                                type="checkbox"
                                
                                checked={selectedRows.includes(rowData)}
                                onChange={(e) => handleCheckboxChange(e, rowData)}
                            />
                            {first + rowIndex + 1}  {/* Adjusting index for pagination */}
                        </div>
                    )}
                    style={{ width: '10%' }}
                />
                <Column field="name" header="NAME" sortable style={{ width: '15%' }} />
                <Column field="phone" header="PHONE" sortable style={{ width: '15%' }} />
                <Column field="priority" header="PRIORITY" sortable style={{ width: '10%', textAlign: "center" }} />
                <Column field="sources" header="Sources" sortable style={{ width: '15%' }} />
                <Column
                    header="Assigned TO"
                    body={(rowData) => rowData.leadAssignedTo?.empName || "NA"}
                    sortable
                    style={{ width: '20%' }}
                />
                <Column header="ACTION" body={actionBodyTemplate} style={{ width: '15%' }} />
            </DataTable>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={title} buttonTitle={buttonTitle} leadData={leadData} />
            <AssignTaskModal
                show={showModal}
                handleClose={handleClose}
                employees={employeeData}
                selectedData={selectedRows}
            />
        </div>
    );
}

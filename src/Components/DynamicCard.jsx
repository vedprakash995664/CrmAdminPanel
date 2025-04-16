import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import Modal from './LeadForm';
import { useNavigate } from 'react-router-dom';
import './CSS/DynamicCard.css'
import './CSS/DynamicTable.css'
import AssignTaskModal from './AssignTaskModal';
import { Toast } from 'primereact/toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployee } from '../Features/LeadSlice';
import Swal from 'sweetalert2';
import axios from 'axios';
import { MultiSelect } from 'primereact/multiselect';

export default function DynamicCard({ lead, tableTitle }) {
    const APi_Url = import.meta.env.VITE_API_URL
    const [showModal, setShowModal] = useState(false);
    const [employees, setEmployee] = useState([]);
    const toast = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const employeeData = useSelector((state) => state.leads.Employee || []).filter((item) => item?.blocked === false);
    // Fetching employees
    useEffect(() => {
        dispatch(fetchEmployee());
    }, [dispatch]);


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [isEditMode, setEditMode] = useState(false);
    const [buttonTitle, setButtonTitle] = useState('');
    const [leadData, setLeadData] = useState([]);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        phone: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        priority: { value: null, matchMode: FilterMatchMode.EQUALS },
        source: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [tagSearchQuery, setTagSearchQuery] = useState('');
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedTagValues, setSelectedTagValues] = useState([]);
    // Prepare tag options for MultiSelect
    const tagData = useSelector((state) => state.leads.tag || []);

    const tagsOptions = useMemo(() => {
        return tagData
            .filter(tag =>
                tag.tagName.toLowerCase().includes(tagSearchQuery.toLowerCase())
            )
            .map(tag => ({ name: tag.tagName, value: tag.tagName }));
    }, [tagData, tagSearchQuery]);

    const handleShow = () => {
        if (selectedRows.length === 0) {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please select at least one row before assigning.', life: 3000 });
        } else {
            setShowModal(true);
        }
    };

    const handleClose = () => setShowModal(false);

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };
    const filteredLeads = lead.filter((rowData) => {
        // Filter by global search if it exists
        if (filters.global.value) {
            const searchValue = filters.global.value.toLowerCase();
            const matchesSearch = (
                rowData.name?.toLowerCase().includes(searchValue) ||
                rowData.phone?.toLowerCase().includes(searchValue) ||
                rowData.priority?.priorityText?.toLowerCase().includes(searchValue) ||
                rowData.sources?.leadSourcesText?.toLowerCase().includes(searchValue) ||
                rowData.leadAssignedTo?.empName?.toLowerCase().includes(searchValue) ||
                (Array.isArray(rowData.tags) && rowData.tags.some(tag =>
                    String(tag).toLowerCase().includes(searchValue))
                ))

            if (!matchesSearch) return false;
        }

        // Filter by selected tags if any
        if (selectedTagValues.length > 0) {
            if (!rowData.tags || !Array.isArray(rowData.tags)) return false;

            // Check if ALL selected tags match the item's tags
            return selectedTagValues.every(selectedTag => {
                return rowData.tags.some(tag => {
                    if (typeof tag === 'string') {
                        return tag.toLowerCase() === selectedTag.toLowerCase();
                    } else if (typeof tag === 'object' && tag !== null) {
                        return tag.tagName?.toLowerCase() === selectedTag.toLowerCase();
                    }
                    return false;
                });
            });
        }

        return true;
    });


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
        navigate('fullLeads', { state: { viewdata, tableTitle } });

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
                        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Lead deleted successfully!', life: 3000 });
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
    // const handleSearchChange = (event) => {
    //     setSearchQuery(event.target.value);
    //     setCurrentPage(1);
    //   };


    const clearAllFilters = () => {
        setSelectedTagValues([]);
        setSearchQuery('');
        setTagSearchQuery('');
        setCurrentPage(1);
    };
    const handleTagSearchChange = (event) => {
        setTagSearchQuery(event.target.value);
    };

    // Handle select all change
    const handleSelectAllChange = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        setSelectedRows(checked ? [...filteredLeads] : []);
    };
    const panelHeaderTemplate = () => {
        return (
            <div>
                <div className="panelHeaderTemplate">
                    <span className="font-bold">Tag Filters</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            clearAllFilters();
                        }}
                        className="clear-all-btn"
                        style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '20px',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="ri-close-circle-line"></i>
                    </button>
                </div>
                <div className="p-2 flex justify-between items-center">
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Search tags..."
                        value={tagSearchQuery}
                        onChange={handleTagSearchChange}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        );
    };


    const renderHeader = () => {
        return (
            <div className="filter-container">
                <div style={{ width: '100%', marginTop: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "start", gap: "20px", paddingInline: "0px" }}>
                        <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAllChange}
                            id="selectAllCheckbox1"
                        />
                        <label htmlFor="selectAllCheckbox1" style={{ marginLeft: '5px' }}>Select All</label>
                    </div>
                </div>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "0px" }}>
                    <InputText
                        value={globalFilterValue}
                        onChange={onGlobalFilterChange}
                        placeholder="Keyword Search"
                        style={{ width: "100%", marginRight: "10px" }}
                    />
                    <div className="custom-filter-box">
                        <MultiSelect

                            value={selectedTagValues}
                            options={tagsOptions}
                            optionLabel="name"
                            onChange={(e) => {
                                setSelectedTagValues(e.value);
                                setSelectAll(false);
                                setCurrentPage(1);
                            }}
                            filter
                            placeholder="Filter by Tags"
                            className="custom-input custom-multiselect"
                            panelStyle={{ width: "200px" }}
                            panelHeaderTemplate={panelHeaderTemplate}
                            // panelHeaderTemplate={""}
                            scrollHeight="200px"
                            display="chip"
                            itemTemplate={(option) => {
                                // Custom template for each option in the dropdown
                                return (
                                    <div className="custom-option-item">
                                        <span className="option-label">{option.name}</span>
                                    </div>
                                );
                            }}
                        />
                        {selectedTagValues.length > 0 && (
                            <button className="clear-btn" onClick={clearAllFilters}>
                                <i className="ri-close-circle-line"></i>
                            </button>
                        )}
                    </div>
                    <button onClick={handleShow} className='assignLeadBtn' style={{ width: "100%" }}>
                        Assign Leads {selectedRows.length > 0 ? `(${selectedRows.length})` : ''}
                    </button>
                </div>
            </div>
        );
    };


    return (
        <div className="card">
            <Toast ref={toast} />  {/* Toast component */}

            {/* Header */}
            {renderHeader()}

            {/* Card Layout for Leads */}
            <div className="card-container">
                {Array.isArray(filteredLeads) && filteredLeads.length > 0 ? (
                    filteredLeads.map((rowData, index) => (
                        <div className="lead-card" key={rowData._id}>
                            <div className="lead-card-header">
                                <input
                                    type="checkbox"
                                    checked={selectedRows.includes(rowData)}
                                    onChange={(e) => handleCheckboxChange(e, rowData)}
                                />
                                <span>{index + 1}</span>
                            </div>
                            <div className="lead-card-body">
                                <p><strong>Name:</strong> {rowData.name}</p>
                                <p><strong>Phone:</strong> {rowData.phone}</p>
                                <p><strong>Priority:</strong> {rowData.priority?.priorityText}</p>
                                <p><strong>Source:</strong> {rowData?.sources?.leadSourcesText}</p>
                            </div>
                            <div className="lead-card-actions">
                                <button onClick={() => handleEdit(rowData)} className="action-button edit">Edit</button>
                                <button onClick={() => handleDelete(rowData)} className="action-button delete">Delete</button>
                                <button onClick={() => handleView(rowData)} className="action-button view">View</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>No leads found</div>  // This will show if `lead` is empty or not an array
                )}
            </div>

            {/* Modals */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={title} buttonTitle={buttonTitle} leadData={leadData} />
            <AssignTaskModal show={showModal} handleClose={handleClose} employees={employeeData} selectedData={selectedRows} />
        </div>
    );
}

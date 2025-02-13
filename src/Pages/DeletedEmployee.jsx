import React, { useState, useEffect, useRef } from 'react';
import './CSS/Empolyees.css';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import EmployeeCardView from './EmployeeCardView';
import { useNavigate } from 'react-router-dom';
import { fetchEmployee } from '../Features/LeadSlice';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Dropdown } from 'primereact/dropdown';

import Swal from 'sweetalert2'; // Import SweetAlert2

function DeletedEmployee() {
    const APi_Url=import.meta.env.VITE_API_URL
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(5);
    const [data, setData] = useState([]);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [newEmployee, setNewEmployee] = useState(
        {
            empName: "",
            empPhoneNumber: "",
            empEmail: "",
            empPassword: "",
            empGender: "",
            empDOB: "",
            empDesignation: "",
            empCity: "",
            empState: "",
            empZipCode: "",
            empCountry: "",
            userType: 'Admin'
        });
    const [isEditing, setIsEditing] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const toast = useRef(null);  // Create a ref for Toast
    const dispatch = useDispatch();
    const employeeData = useSelector((state) => state.leads.Employee || []).filter((item) => item?.blocked === true);

    useEffect(() => {
        dispatch(fetchEmployee());
    }, [dispatch]);

    const filters = {
        global: { value: globalFilterValue, matchMode: FilterMatchMode.CONTAINS },
        empName: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        empPhoneNumber: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    };

    const onGlobalFilterChange = (e) => {
        setGlobalFilterValue(e.target.value);
    };

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };


    const handleUnBlock = async (rowData) => {
        // Show SweetAlert2 confirmation dialog
        const result = await Swal.fire({
            title: `Are you sure you want to Unblock ${rowData.empName}?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Unblock it!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true
        });

        // If user cancels, exit early
        if (!result.isConfirmed) return;

        try {
            // Block the employee by making the PUT request
            const AdminId = sessionStorage.getItem("AdminId");
            const unblockEmployee = rowData._id;

            const response = await axios.put(`${APi_Url}/digicoder/crm/api/v1/employee/unblock/${AdminId}`, { empId: unblockEmployee });

            if (response.status === 200) {
                // Show success toast
                toast.current.show({
                    severity: 'success',
                    summary: 'Unblocked',
                    detail: `${rowData.empName} has been Unblocked successfully.`,
                    life: 3000
                });
                dispatch(fetchEmployee());
            }
        } catch (error) {
            // Show error toast in case of failure
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to Unblocked the employee.',
                life: 3000
            });
        }
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex justify-content-around gap-3">
                <button onClick={() => handleUnBlock(rowData)} style={{ borderRadius: "50%", border: "none", height: "40px", width: "40px", backgroundColor: "#EDF1FF", color: "#3454D1" }}>
                <i class="ri-lock-unlock-fill"></i>{/* This could be a lock icon to represent blocking */}
                </button>
            </div>
        );
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between gap-3 align-items-center p-2">
                <h5>Blocked Employee</h5>
                <div>
                    <InputText
                        value={globalFilterValue}
                        onChange={onGlobalFilterChange}
                        placeholder="Search"
                        style={{ width: "100%", maxWidth: "200px", marginRight: "10px" }}
                    />
                </div>
            </div>
        );
    };


    const closeEmployeeModal = () => {
        setShowEmployeeModal(false);
        setSelectedEmployee(null);
    };

    const handleAddEmployee = async () => {
        if (!newEmployee.empName || !newEmployee.empPhoneNumber || !newEmployee.empEmail) {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please fill in all fields before adding an employee.', life: 3000 });
            return;
        } else {
            try {
                const AdminId = sessionStorage.getItem('AdminId');
                const apiUrl = `${APi_Url}/digicoder/crm/api/v1/employee/add/${AdminId}`;
                const response = await axios.post(apiUrl, newEmployee);
                setShowEmployeeModal(false);
                dispatch(fetchEmployee());
            } catch (error) {
                console.error("Error details: ", error);
            }
        }
    };

    const handleUpdateEmployee = async () => {
        const EmployeeId = newEmployee._id
        try {
            // Assuming `newEmployee` contains the updated employee data
            const response = await axios.put(`${APi_Url}/digicoder/crm/api/v1/employee/update/${EmployeeId}`, newEmployee, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // Check if the response contains the updated employee data
            const updatedEmployee = response.data;

            // Update the local state with the updated employee data
            const updatedData = data.map(emp =>
                emp.empEmail === selectedEmployee.empEmail ? updatedEmployee : emp
            );

            setData(updatedData);
            toast.current.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Employee updated successfully!',
                life: 3000,
            });
            closeEmployeeModal(); // Close modal after update
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || error.message || 'Failed to update employee!',
                life: 3000,
            });
        }
    };

    const header = renderHeader();

    const serialNumberTemplate = (rowData, { rowIndex }) => {
        return rowIndex + 1 + first;
    };

    return (
        <>

            <div className='large-view'>
                <div className="content">
                    <DataTable
                        value={employeeData}
                        rows={rows}
                        first={first}
                        paginator
                        filters={filters}
                        filterDisplay="row"
                        globalFilter={globalFilterValue}
                        globalFilterFields={['empName', 'empPhoneNumber', 'empEmail']}
                        header={header}
                        emptyMessage="No data found."
                        onPage={onPageChange}
                        paginatorTemplate=" PrevPageLink PageLinks NextPageLink "
                        removableSort
                        style={{ borderRadius: "10px" }}
                    >
                        <Column header="SR No" body={serialNumberTemplate} style={{ width: '10%' }} />
                        <Column field="empName" header="Name" sortable style={{ width: '15%' }} />
                        <Column field="empPhoneNumber" header="Phone" sortable style={{ width: '10%' }} />
                        <Column field="empEmail" header="Email" sortable style={{ width: '15%' }} />
                        <Column field="createdAt" header="Date Of Joining" sortable style={{ width: '25%' }} />
                        <Column header="ACTION" body={actionBodyTemplate} style={{ width: '15%' }} />
                    </DataTable>
                </div>
            </div>

            <div className='card-view-employee'>
                <EmployeeCardView />
            </div>



            {/* Employee Modal */}
            <Dialog header={isEditing ? "Edit Employee" : "Add New Employee"} visible={showEmployeeModal} onHide={closeEmployeeModal} style={{ width: '50vw' }}>
                <div className="p-fluid">
                    <div className="p-field">
                        <label htmlFor="name">Name</label>
                        <InputText
                            id="name"
                            value={newEmployee.empName}
                            onChange={(e) => setNewEmployee({ ...newEmployee, empName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="email">Email</label>
                        <InputText
                            id="email"
                            value={newEmployee.empEmail}
                            onChange={(e) => setNewEmployee({ ...newEmployee, empEmail: e.target.value })}
                            required
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="phone">Phone</label>
                        <InputText
                            id="phone"
                            value={newEmployee.empPhoneNumber}
                            onChange={(e) => setNewEmployee({ ...newEmployee, empPhoneNumber: e.target.value })}
                            required
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="password">Password</label>
                        <InputText
                            id="password"
                            value={newEmployee.empPassword}
                            onChange={(e) => setNewEmployee({ ...newEmployee, empPassword: e.target.value })}
                            required
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="DOB">Date of Birth</label>
                        <InputText
                            id="DOB"
                            type="date"
                            value={newEmployee.empDOB}
                            onChange={(e) => setNewEmployee({ ...newEmployee, empDOB: e.target.value })}
                            required
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="designation">Designation</label>
                        <InputText
                            id="designation"
                            value={newEmployee.empDesignation}
                            onChange={(e) => setNewEmployee({ ...newEmployee, empDesignation: e.target.value })}
                            required
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="gender">Gender</label>
                        <Dropdown
                            id="gender"
                            value={newEmployee.empGender}
                            options={[
                                { label: 'Select', value: '' },
                                { label: 'Male', value: 'Male' },
                                { label: 'Female', value: 'Female' }
                            ]}
                            onChange={(e) => setNewEmployee({ ...newEmployee, empGender: e.value })}
                            placeholder="Select Gender"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="State">State</label>
                        <InputText
                            id="State"
                            value={newEmployee.empState}
                            onChange={(e) => setNewEmployee({ ...newEmployee, empState: e.target.value })}
                            required
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="City">City</label>
                        <InputText
                            id="City"
                            value={newEmployee.empCity}
                            onChange={(e) => setNewEmployee({ ...newEmployee, empCity: e.target.value })}
                            required
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="Country">Country</label>
                        <InputText
                            id="Country"
                            value={newEmployee.empCountry}
                            onChange={(e) => setNewEmployee({ ...newEmployee, empCountry: e.target.value })}
                            required
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="ZipCode">ZipCode</label>
                        <InputText
                            id="ZipCode"
                            value={newEmployee.empZipCode}
                            onChange={(e) => setNewEmployee({ ...newEmployee, empZipCode: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div className="p-d-flex p-jc-end mt-5">
                    <Button label="Cancel" icon="pi pi-times" onClick={closeEmployeeModal} className="p-button-text mr-4" />
                    <Button
                        label={isEditing ? "Update" : "Add"}
                        icon={isEditing ? "pi pi-check" : "pi pi-plus"}
                        onClick={isEditing ? handleUpdateEmployee : handleAddEmployee}
                        className="p-button-primary"
                    />
                </div>
            </Dialog>

            {/* PrimeReact Toast Component */}
            <Toast ref={toast} position="top-right" />
        </>
    );
}

export default DeletedEmployee;

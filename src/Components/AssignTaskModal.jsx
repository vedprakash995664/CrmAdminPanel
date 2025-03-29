import axios from 'axios';
import React, { useState } from 'react';
import { Modal, Button, Dropdown, DropdownButton, FormControl, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';

const AssignTaskModal = ({ show, handleClose, employees, selectedData }) => {

  const APi_Url = import.meta.env.VITE_API_URL;
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(false); // Loading state for the button

  // Filter employees based on the filter text (name)
  const filteredEmployees = employees.filter(employee =>
    employee.empName.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee); 
  };

  // Get the number of tasks selected
  const taskCount = selectedData ? selectedData.length : 0;

  const handleAssignLeads = async () => {
    const leadsArray = selectedData.map((item) => item._id);
    const empId = selectedEmployee._id;
  
    setLoading(true); // Set loading to true when the button is clicked

    try {
      // Make an async request to the API to assign leads
      const response = await axios.put(`${APi_Url}/digicoder/crm/api/v1/lead/assign`, {
        leadsArray,
        empId
      });
      
      if (response.status === 200) {
        // Show SweetAlert on successful lead assignment
        Swal.fire({
          icon: 'success',
          title: 'Leads Assigned',
          text: `${taskCount} lead(s) have been successfully assigned to ${selectedEmployee.empName || selectedEmployee.name}.`,
          confirmButtonText: 'OK'
        }).then(() => {
          handleClose();
          window.location.reload();
        });
      } else {
        // Handle unsuccessful response
        Swal.fire({
          icon: 'error',
          title: 'Assignment Failed',
          text: 'There was an issue assigning the leads. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      // Catch any errors during the API call
      console.error('Error assigning leads:', error);
      Swal.fire({
        icon: 'error',
        title: 'Assignment Failed',
        text: 'There was an issue assigning the leads. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false); // Stop loading after the operation completes
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          Assign Leads ({taskCount} {taskCount === 1 ? 'Lead' : 'Leads'} Selected)
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DropdownButton
          title={selectedEmployee ? selectedEmployee.empName : 'Select Employee'}
          variant="secondary"
          id="employee-dropdown"
          drop="down"
        >
          <FormControl
            type="text"
            placeholder="Filter by name"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <Dropdown.Item
                key={employee.id}
                onClick={() => handleSelectEmployee(employee)}  
              >
                {employee.empName}
              </Dropdown.Item>
            ))
          ) : (
            <Dropdown.Item disabled>No employees found</Dropdown.Item>
          )}
        </DropdownButton>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleAssignLeads}
          disabled={!selectedEmployee || loading} // Disable button when loading or no employee selected
        >
          {loading ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              style={{ marginRight: '10px' }}
            />
          ) : null}
          {loading ? 'Assigning...' : 'Assign Leads'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignTaskModal;

import axios from 'axios';
import React, { useState } from 'react';
import { Modal, Button, ListGroup, FormControl, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';

const AssignTaskModal = ({ show, handleClose, employees, selectedData }) => {
  const APi_Url = import.meta.env.VITE_API_URL;
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter employees based on the filter text (name)
  const filteredEmployees = employees.filter(employee =>
    employee.empName.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleSelectEmployee = (employee) => {
    // Check if employee is already selected
    const isAlreadySelected = selectedEmployees.some(emp => emp._id === employee._id);
    
    if (isAlreadySelected) {
      // Remove employee if already selected
      setSelectedEmployees(selectedEmployees.filter(emp => emp._id !== employee._id));
    } else {
      // Add employee to selected list
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  // Check if an employee is selected
  const isEmployeeSelected = (employee) => {
    return selectedEmployees.some(emp => emp._id === employee._id);
  };

  // Get the number of leads selected
  const leadCount = selectedData ? selectedData.length : 0;
  
  const handleAssignLeads = async () => {
    // We're now assigning one lead to multiple employees
    const leadId = selectedData[0]._id; // Get the single lead ID
    const employeeIds = selectedEmployees.map(emp => emp._id);
  
    setLoading(true);

    try {
      // Updated API endpoint and request body for the new schema
      const response = await axios.put(`${APi_Url}/digicoder/crm/api/v1/lead/assign`, {
        leadId,
        employeeIds
      });
      
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Lead Assigned',
          text: `The lead has been successfully assigned to ${selectedEmployees.length} employee(s).`,
          confirmButtonText: 'OK'
        }).then(() => {
          handleClose();
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Assignment Failed',
          text: 'There was an issue assigning the lead. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Error assigning lead:', error);
      Swal.fire({
        icon: 'error',
        title: 'Assignment Failed',
        text: 'There was an issue assigning the lead. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          Assign Lead to Multiple Employees
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {leadCount > 1 ? (
          <div className="alert alert-warning">
            Only one lead can be assigned to multiple employees at a time. 
            Please select just one lead.
          </div>
        ) : (
          <>
            <FormControl
              type="text"
              placeholder="Filter employees by name"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="mb-3"
            />
            
            <div className="mb-3">
              <h6>Selected Employees ({selectedEmployees.length}):</h6>
              {selectedEmployees.length > 0 ? (
                <ListGroup className="mb-3">
                  {selectedEmployees.map(emp => (
                    <ListGroup.Item 
                      key={emp._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      {emp.empName}
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleSelectEmployee(emp)}
                      >
                        Remove
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted">No employees selected</p>
              )}
            </div>
            
            <h6>Available Employees:</h6>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <ListGroup>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <ListGroup.Item 
                      key={employee._id}
                      action
                      active={isEmployeeSelected(employee)}
                      onClick={() => handleSelectEmployee(employee)}
                    >
                      {employee.empName}
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item disabled>No employees found</ListGroup.Item>
                )}
              </ListGroup>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleAssignLeads}
          disabled={selectedEmployees.length === 0 || loading || leadCount > 1}
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
          {loading ? 'Assigning...' : 'Assign Lead'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignTaskModal;
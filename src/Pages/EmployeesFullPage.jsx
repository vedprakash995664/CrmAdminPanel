import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import { useNavigate } from "react-router-dom";
import { BarChart } from '@mui/x-charts/BarChart';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import './CSS/EmployeesFullPage.css';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import Dashboard from '../Components/Dashboard';
import axios from "axios";
import Swal from 'sweetalert2'; // Import SweetAlert2

function EmployeesFullPage() {
  const APi_Url=import.meta.env.VITE_API_URL
  const navigate = useNavigate();
  const [isWeekdata, setisWeekdata] = useState(true);
  const [isMonthdata, setisMonthdata] = useState(false);
  const [isYeardata, setisYeardata] = useState(false);
  const [reportTitle, setReportTitle] = useState('Weekly Report');
  const EmployeeData = JSON.parse(localStorage.getItem("Employee"));
  console.log("data from here", EmployeeData);
  let EmpStatus = "Active";
  if (EmployeeData.blocked === true) {
    EmpStatus = "Blocked";
  }
  const currentEmployeeId = EmployeeData._id;
  const [formData, setFormData] = useState({
    Name: EmployeeData?.empName || "",
    Email: EmployeeData?.empEmail || "",
    Password: EmployeeData?.empPassword || "",
    Phone: EmployeeData?.empPhoneNumber || "",
    Gender: EmployeeData?.empGender || "",
    DateOfBirth: EmployeeData?.empDOB || "",
    Designation: EmployeeData?.empDesignation || "",
    City: EmployeeData?.empCity || "",
    ZipCode: EmployeeData?.empZipCode || "",
    State: EmployeeData?.empState || "",
    Country: EmployeeData?.empCountry || "",
    JoiningDate: "",
    Status: EmpStatus,
  });

  const EmployeeDataEdit = ({
    empName: formData.Name || "",
    empPhoneNumber: formData.Phone || "",
    empEmail: formData.Email || "",
    empPassword: formData.Password || "",
    empGender: formData.Gender || "",
    empDOB: formData.DateOfBirth || "",
    empDesignation: formData.Designation || "",
    empCity: formData.City || "",
    empState: formData.State || "",
    empZipCode: formData.ZipCode || "",
    empCountry: formData.Country || "",
  });

  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  const [isDisabled, setIsDisabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdate = () => {
    setIsEditing(true);
    setIsDisabled(false);
  };

  const handleSave = async () => {
    try {
      console.log("Saving data", formData);
      const response = await axios.put(
        `${APi_Url}/digicoder/crm/api/v1/employee/update/${currentEmployeeId}`,
        EmployeeDataEdit,  // Sending updated formData directly
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (response.status === 200) {
        toast.success("Updated successfully!");
        setIsEditing(false);
        setIsDisabled(true);
        navigate('/employee');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update data!");
    }
  };

  const handleBack = () => {
    navigate('/employee');
    localStorage.removeItem("Employee");
  };

  const [data, setData] = useState([60, 50, 15, 25]);
  const handleMonthData = () => {
    setReportTitle('MONTHLY-REPORT');
    setisWeekdata(false);
    setisYeardata(false);
    setisMonthdata(true);
    setData([200, 180, 10, 40]);
  };

  const handleWeekData = () => {
    setReportTitle('WEEKLY-REPORT');
    setisWeekdata(true);
    setisYeardata(false);
    setisMonthdata(false);
    setData([60, 50, 15, 25]);
  };

  const handleYearData = () => {
    setReportTitle('YEARLY-REPORT');
    setisWeekdata(false);
    setisYeardata(true);
    setisMonthdata(false);
    setData([500, 400, 80, 10]);
  };

  const handleBlock = async () => {
    const result = await Swal.fire({
      title: `Are you sure you want to block ${EmployeeData.empName}?`,
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, block it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      const AdminId = sessionStorage.getItem("AdminId");
      const blockEmployee = EmployeeData._id;

      const response = await axios.put(
        `${APi_Url}/digicoder/crm/api/v1/employee/block/${AdminId}`,
        { empId: blockEmployee }
      );

      if (response.status === 200) {
        toast.success(`${EmployeeData.empName} has been blocked successfully.`);
        navigate('/employee');
      }
    } catch (error) {
      toast.error('Failed to block the employee.');
    }
  };

  return (
    <div>
      <Dashboard active={'employee'}>
        <div className="content fullLead-outer">
          <div className="fullLead-outer">
            <div className="fullLeads-header">
              <div className="back-btn">
                <button onClick={handleBack}><i className="ri-arrow-left-line"></i> Back</button>
              </div>
              <div className="fullLeads-icons">
                <button style={{ color: "red" }} onClick={() => handleBlock()}><i className="ri-delete-bin-5-fill"></i></button>
              </div>
            </div>

            <div className="fullLeads-view-data">
              <div className="view-data-title">
                <span>EMPLOYEE DETAILS</span>
              </div>
              <div className="view-info-form">
                <div className="form-row">
                  <div>
                    <div className="label">Name</div>
                    <input
                      type="text"
                      className="input-field"
                      name="Name"
                      value={formData.Name}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Phone Number</div>
                    <input
                      type="number"
                      className="input-field"
                      name="Phone"
                      value={formData.Phone}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div>
                    <div className="label">Email</div>
                    <input
                      type="email"
                      className="input-field"
                      name="Email"
                      value={formData.Email}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Password</div>
                    <input
                      type="text"
                      className="input-field"
                      name="Password"
                      value={formData.Password}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Gender</div>
                    <select
                      className="input-field"
                      name="Gender"
                      value={formData.Gender}
                      onChange={handleChange}
                      disabled={isDisabled}
                    >
                      <option value="" disabled>-- Select --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <div className="label">Date of Birth</div>
                    <input
                      type="date"
                      className="input-field"
                      name="DateOfBirth"
                      value={formData.DateOfBirth}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Designation</div>
                    <input
                      type="text"
                      className="input-field"
                      name="Designation"
                      value={formData.Designation}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">City</div>
                    <input
                      type="text"
                      className="input-field"
                      name="City"
                      value={formData.City}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Zip Code</div>
                    <input
                      type="number"
                      className="input-field"
                      name="ZipCode"
                      value={formData.ZipCode}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">State</div>
                    <input
                      type="text"
                      className="input-field"
                      name="State"
                      value={formData.State}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Country</div>
                    <input
                      type="text"
                      className="input-field"
                      name="Country"
                      value={formData.Country}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Joining Date</div>
                    <input
                      type="text"
                      className="input-field"
                      name="createdDate"
                      value={formData.JoiningDate}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div>
                    <div className="label">Status</div>
                    <input
                      type="text"
                      className="input-field"
                      name="LeadStatus"
                      value={formData.Status}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                </div>
                <div className="view-edit-btn">
                  <button onClick={isEditing ? handleSave : handleUpdate}>
                    {isEditing ? "Save" : "Update"}
                  </button>
                </div>
              </div>
            </div>

            <div className="report-title">
              <span>EMPLOYEE REPORT</span>
              <h6 style={{color:"#3454D1"}}>{reportTitle}</h6>
            </div>
            <div className="report-btn">
              <button className={`weekly ${isWeekdata ? 'active-weekly' : ''}`} onClick={handleWeekData}>Weekly</button>
              <button className={`monthly ${isMonthdata ? 'active-monthly' : ''}`} onClick={handleMonthData}>Monthly</button>
              <button className={`yearly ${isYeardata ? 'active-yearly' : ''}`} onClick={handleYearData}>Yearly</button>
            </div>
            <div className="report-chart">
              <BarChart
                series={[{ data: data }]}
                height={290}
                xAxis={[{ data: ['Total Assigned Leads', 'Completed Leads', 'Pending Leads', 'Negative Leads'], scaleType: 'band' }]}
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
              />
            </div>

            {/* Weekly Report */}
            {isWeekdata && (
              <div className="report-bottom">
                <div className="report-card1">
                  <div className="report-card11">
                    <i className="ri-information-2-fill"></i>
                  </div>
                  <div className="report-card12">
                    <span>Assigned Leads</span>
                    <p>100+</p>
                  </div>
                </div>
                <div className="report-card1" style={{ backgroundColor: "#3454D1", color: "white" }}>
                  <div className="report-card11">
                    <i className="ri-verified-badge-fill" style={{ color: "white" }}></i>
                  </div>
                  <div className="report-card12">
                    <span style={{ color: "white" }}>Completed Leads</span>
                    <p style={{ color: "white" }}>100+</p>
                  </div>
                </div>
                <div className="report-card1" style={{ backgroundColor: "#3454D1" }}>
                  <div className="report-card11">
                    <PendingActionsIcon style={{ fontSize: "100px", color: "white" }} />
                  </div>
                  <div className="report-card12">
                    <span style={{ color: "white" }}>Pending Leads</span>
                    <p style={{ color: "white" }}>100+</p>
                  </div>
                </div>
                <div className="report-card1">
                  <div className="report-card11">
                    <UnpublishedIcon style={{ fontSize: "100px" }} />
                  </div>
                  <div className="report-card12">
                    <span>Negative Leads</span>
                    <p>100+</p>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Report */}
            {isMonthdata && (
              <div className="report-bottom">
                <div className="report-card1" style={{ backgroundColor: "#3454D1", color: "white" }}>
                  <div className="report-card11">
                    <i className="ri-information-2-fill" style={{ color: "white" }}></i>
                  </div>
                  <div className="report-card12">
                    <span style={{ color: "white" }}>Assigned Leads</span>
                    <p style={{ color: "white" }}>300+</p>
                  </div>
                </div>
                <div className="report-card1">
                  <div className="report-card11">
                    <i className="ri-verified-badge-fill"></i>
                  </div>
                  <div className="report-card12">
                    <span>Completed Leads</span>
                    <p>230+</p>
                  </div>
                </div>
                <div className="report-card1">
                  <div className="report-card11">
                    <PendingActionsIcon style={{ fontSize: "100px" }} />
                  </div>
                  <div className="report-card12">
                    <span>Pending Leads</span>
                    <p>60+</p>
                  </div>
                </div>
                <div className="report-card1" style={{ backgroundColor: "#3454D1" }}>
                  <div className="report-card11">
                    <UnpublishedIcon style={{ fontSize: "100px", color: "white" }} />
                  </div>
                  <div className="report-card12">
                    <span style={{ color: "white" }}>Negative Leads</span>
                    <p style={{ color: "white" }}>10</p>
                  </div>
                </div>
              </div>
            )}

            {/* Yearly Report */}
            {isYeardata && (
              <div className="report-bottom">
                <div className="report-card1">
                  <div className="report-card11">
                    <i className="ri-information-2-fill"></i>
                  </div>
                  <div className="report-card12">
                    <span>Assigned Leads</span>
                    <p>100+</p>
                  </div>
                </div>
                <div className="report-card1" style={{ backgroundColor: "#3454D1", color: "white" }}>
                  <div className="report-card11">
                    <i className="ri-verified-badge-fill" style={{ color: "white" }}></i>
                  </div>
                  <div className="report-card12">
                    <span style={{ color: "white" }}>Completed Leads</span>
                    <p style={{ color: "white" }}>200+</p>
                  </div>
                </div>
                <div className="report-card1" style={{ backgroundColor: "#3454D1" }}>
                  <div className="report-card11">
                    <PendingActionsIcon style={{ fontSize: "100px", color: "white" }} />
                  </div>
                  <div className="report-card12">
                    <span style={{ color: "white" }}>Pending Leads</span>
                    <p style={{ color: "white" }}>50+</p>
                  </div>
                </div>
                <div className="report-card1">
                  <div className="report-card11">
                    <UnpublishedIcon style={{ fontSize: "100px" }} />
                  </div>                                                
                  <div className="report-card12">
                    <span>Negative Leads</span>
                    <p>30</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </Dashboard>
      <ToastContainer />
    </div>
  );
}

export default EmployeesFullPage;

import React, { useEffect, useState } from "react";
import "./CSS/Dashboard.css";
import { ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'; 

const Dashboard = ({ children, active }) => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [isShow, setIsShow] = useState(false);  
  const user = sessionStorage.getItem("Name"); 
  
  const navigate = useNavigate();
  
  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };
  const handleIsShow = () => {
    setIsShow(prevState => !prevState);
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handlelogout = () => {
    Swal.fire({
      title: 'Are you sure ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, log me out',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Logged out successfully!',
          icon: 'success',
        }).then(() => {
          sessionStorage.removeItem("Token");
          sessionStorage.removeItem("AdminId");
          navigate('/');
        });
      } else {
        Swal.fire({
          title: 'Thanks',
          text: 'You are still logged in.',
          icon: 'info',
        });
      }
    });
  };

  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${sidebarActive ? "active" : ""}`}>
      <div className="sidebar-logo"><img src="/Images/logo.png" style={{width:"200px"}} alt="" /></div>
        <div className="navigation">
          <ul className="sidebar-nav-links">
            <Link className="navigation-link" to="/dashboard">
              <li>
                <button className={`sidebar-link ${active === 'dashboard' && 'active'}`}>
                  <i className="ri-dashboard-horizontal-fill"></i> &nbsp;Dashboard
                </button>
              </li>
            </Link>
            <Link className="navigation-link" to="/Leads">
              <li>
                <button className={`sidebar-link ${active === 'leads' && 'active'}`}>
                <i class="ri-information-2-fill"></i> &nbsp;Leads
                </button>
              </li>
            </Link>
            <Link className="navigation-link" to="/assignedLeads">
              <li>
                <button className={`sidebar-link ${active === 'assigned' && 'active'}`}>
                <i class="ri-verified-badge-fill"></i>&nbsp;Assigned Leads
                </button>
              </li>
            </Link>
            <Link className="navigation-link" to="/unassignedLeads">
              <li>
                <button className={`sidebar-link ${active === 'unassigned' && 'active'}`}>
                <i class="ri-chat-off-fill"></i> &nbsp;Unassigned Leads
                </button>
              </li>
            </Link>
            <Link className="navigation-link" to="/employee">
              <li>
                <button className={`sidebar-link ${active === 'employee' && 'active'}`}>
                <i className="ri-team-fill"></i> &nbsp;Employee
                </button>
              </li>
            </Link>
            
            <Link className="navigation-link" to="/status">
              <li>
                <button className={`sidebar-link ${active === 'status' && 'active'}`}>
                <i className="ri-timer-flash-fill"></i> &nbsp;Leads Status
                </button>
              </li>
            </Link>
            <Link className="navigation-link" to="/source">
              <li>
                <button className={`sidebar-link ${active === 'source' && 'active'}`}>
                <i className="ri-team-fill"></i> &nbsp; Lead Sources
                </button>
              </li>
            </Link>

            <Link className="navigation-link" to="/priority">
              <li>
                <button className={`sidebar-link ${active === 'priority' && 'active'}`}>
                <i className="ri-vip-diamond-fill"></i> &nbsp;Priority
                </button>
              </li>
            </Link>
            <Link className="navigation-link" to="/tag">
              <li>
                <button className={`sidebar-link ${active === 'tag' && 'active'}`}>
                <i className="ri-at-fill"></i> &nbsp;Tags
                </button>
              </li>
            </Link>
          </ul>  
        </div>
        <div className="logout-div">
          <button className="sidebar-linkk" onClick={() => handlelogout()}>
            <i className="ri-logout-circle-line"></i> &nbsp;Logout
          </button>
        </div>
        <button className="sidebar-close-btn" onClick={toggleSidebar}>
          ×
        </button>
      </div>

      <div className="main-content">
        <header className="header">
          <h1 className="header-title">Welcome Back, {user}</h1>
          <button className="hamburger" onClick={toggleSidebar}>
            {sidebarActive ? "×" : "☰"}
          </button>
          <div>
            <div className="sidebar-profile">
              <img 
                src="/Images/ved.jpg" 
                alt="" 
                className="img-fluid" 
                onClick={handleIsShow}
              />
            </div>
            {isShow && (
              <div className="newDiv">
                <div className={`newDiv-item ${active === 'profile' && 'newDiv-active'}`} onClick={handleProfile}><i className="ri-profile-fill" style={{color:"#3454D1"}}></i> Profile</div>
                <div className="newDiv-item logout" onClick={() => handlelogout()}><i className="ri-logout-circle-line" style={{color:"#3454D1"}}></i> Logout</div>
              </div>
            )}
          </div>
        </header>

        <div className="content-wrapper">
          <div className="content">
            {children}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Dashboard;

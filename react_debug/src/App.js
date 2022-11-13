import React, { useState, useEffect } from 'react';
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import {getToken} from './Utilities/Token'
import Navbar from './Components/Navbar';
import SideMenu from './Components/SideMenu';
import EmployeeSearch from './Apps/EmployeeSearch';
import TimeSheetCreate from './Apps/TimeSheetCreate';
import TimeSheetSearch from './Apps/TimeSheetSearch';
import Endpoints from './Utilities/Endpoints';
import './App.css';


function App() {


  let nav_config=
  {
    'title':'Accrualify',
    'sections':['Home','Contact','About Us'],
    'dropdowns':['Departments','Payroll','Accounting','Administration','Sales']
  };


  let [MenuLinks,setMenuLinks]=useState(
  {
    "Employee Reports":'/payroll/employee_search/',
    "Timesheet Reports":'/payroll/timesheet_search/',
    "Timesheet Entry":'/payroll/timesheet_create/',
  });
  async function checkAuthenticated()
  {
      const requestOptions={
          method: 'GET',
          headers:{'Content-Type': 'application/json', 'X-CSRFToken': getToken('csrftoken')},
      };
      let response = await fetch(`${Endpoints.domain}${Endpoints.checkAuthAPI}`,requestOptions);
      let data = await response.json();
      console.log(data);
  };

  async function getCSRF()
  {
      const requestOptions={
          method: 'GET',
          headers:{'Content-Type': 'application/json', 'X-CSRFToken': getToken('csrftoken')},
      };
      let response = await fetch(`${Endpoints.domain}${Endpoints.getCSRF}`,requestOptions);
      let data = await response.json();
  };
  useEffect(()=>
  {
    getCSRF();
    checkAuthenticated();
  },[])

  return (
    <div className="App-Home">
      <Navbar config={nav_config}></Navbar>
      <div className = "App-Home-Body">
        <div id="side_menu">
          <SideMenu MenuLinks = {MenuLinks}/>
        </div>
        <BrowserRouter>
          <Routes>
            <Route path = "/payroll/employee_search/" element={<EmployeeSearch endpoint="/api/payroll/employees/" />}/>
            <Route path = "/payroll/timesheet_create/" element={<TimeSheetCreate endpoint="/api/payroll/timesheet/" />}/>
            <Route path = "/payroll/timesheet_search/" element = {<TimeSheetSearch endpoint="/api/payroll/timesheet/" />}/>
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;

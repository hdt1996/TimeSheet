import React, { useState, useEffect } from 'react';
import Navbar from './Components/Navbar';
import SideMenu from './Components/SideMenu';
import EmployeeSearch from './Apps/EmployeeSearch';
import TimeSheetCreate from './Apps/TimeSheetCreate';
import TimeSheetSearch from './Apps/TimeSheetSearch';
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Components/Login';
import Slider from './Components/Slider';
import Fetcher from './Utilities/Fetcher';
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
    "Timesheet Reports":'/payroll/timeSheet_search/',
    "Timesheet Entry":'/payroll/timeSheet_create/',
  });
  async function checkAuthenticated()
  {
      const requestOptions={
          method: 'GET',
          headers:{'Content-Type': 'application/json'},
      };
      let response = await fetch(`${Fetcher.domain}${Fetcher.checkAuthAPI}`,requestOptions);
      let data = await response.json();
  };

  useEffect(()=>
  {
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
            <Route path = "/payroll/employee_search/" element={<EmployeeSearch endpoint="/payroll/api/employees/" />}/>
            <Route path = "/payroll/timeSheet_create/" element={<TimeSheetCreate endpoint="/payroll/api/timesheet/" />}/>
            <Route path = "/payroll/timeSheet_search/" element = {<TimeSheetSearch endpoint="/payroll/api/timesheet/" />}/>
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;

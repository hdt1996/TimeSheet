import React, { useState, useEffect } from 'react';
import Navbar from './Components/Navbar';
import SideMenu from './Components/SideMenu';
import EmpMgmt from './Apps/EmpMgmt';
import Billables from './Apps/Billables';
import {BrowserRouter, Routes, Route } from 'react-router-dom';

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
      "Admin Employee Management":'/payroll/emp_mgmt/',
      "Employee TimeSheet":'/payroll/timesheet/',
      "Training":'/payroll/training'
  });


  return (
    <div className="App-Home">
      <Navbar config={nav_config}></Navbar>
      <div className = "App-Home-Body">
        <div id="side_menu">
          <SideMenu MenuLinks = {MenuLinks} setMenuLinks = {setMenuLinks}/>
        </div>
        <BrowserRouter>
          <Routes>
            <Route path = "/payroll"/>
            <Route path = "/payroll/emp_mgmt/" element={<EmpMgmt/>}/>
            <Route path = "/payroll/timesheet/" element={<Billables/>}/>
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;

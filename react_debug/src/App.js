import React, { useState, useEffect, useRef} from 'react';
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import {getCSRF, checkAuth} from './Utilities/Endpoints'
import Navbar from './Components/Navbar';
import SideMenu from './Components/SideMenu';
import LazyWrapper from './Utilities/LazyWrapper';
import './App.css';


function App() {
  const EmployeeSearch = React.lazy(() => {return import('./Apps/EmployeeSearch')});
  const TimeSheetCreate = React.lazy(() => {return import('./Apps/TimeSheetCreate')});
  const TimeSheetSearch = React.lazy(() => {return import('./Apps/TimeSheetSearch')})

  let [UserData, setUserData] = useState(null);

  let nav_config=
  {
    'title':'Accrualify',
    'sections':['Home','Contact','About Us'],
    'dropdowns':['Departments','Payroll','Accounting','Administration','Sales']
  };


  let MenuLinks=useRef(
  {
    "Employee Reports":'/payroll/employee_search/',
    "Timesheet Reports":'/payroll/timesheet_search/',
    "Timesheet Entry":'/payroll/timesheet_create/',
  });

  useEffect(()=>
  {
    getCSRF();
    checkAuth();
  },[]);


  return (
    <div className="App-Home">
      <Navbar config={nav_config} UserData = {UserData} setUserData = {setUserData}></Navbar>
      <div className = "App-Home-Body">
        <div id="side_menu">
          <SideMenu MenuLinks = {MenuLinks.current}/>
        </div>
        <BrowserRouter>
            <Routes>
              <Route path = "/" />
              <Route path = "/payroll/employee_search/" element={<LazyWrapper Comp = {<EmployeeSearch endpoint="/api/payroll/employees/" UserData = {UserData}/>}/>}/>
              <Route path = "/payroll/timesheet_create/" element={<LazyWrapper Comp = {<TimeSheetCreate endpoint="/api/payroll/timesheet/" UserData = {UserData}/>}/>}/>
              <Route path = "/payroll/timesheet_search/" element = {<LazyWrapper Comp = {<TimeSheetSearch endpoint="/api/payroll/timesheet/" UserData = {UserData}/>}/>}/>
            </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;

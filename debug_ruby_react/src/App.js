import React, { Component} from 'react';
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import SideMenu from './Components/SideMenu';
import LazyWrapper from './Utilities/LazyWrapper';
import './AppV1.css';
import './AppV2.css';

export default class App extends Component {
  constructor(props)
  {
    super(props);
    this.state = 
    {
      "UserData":null,
    };
    this.TimeSheetCreate = React.lazy(() => {return import('./Apps/TimeSheetCreate')});
    this.TimeSheetSearch = React.lazy(() => {return import('./Apps/TimeSheetSearch')});
    this.MenuLinks=React.createRef();
    this.MenuLinks.current=
    {
      "Timesheet Reports":'/payroll/timesheet_search/',
      "Timesheet Entry":'/payroll/timesheet_create/',
    };
    this.NAV_CONFIG=
    {
      'title':'Accrualify',
      'sections':['Home','Contact','About Us'],
      'dropdowns':['Departments','Payroll','Accounting','Administration','Sales']
    };
  };

  async getUserData()
  {
    this.setState({'UserData':{"Success":{"user":{"is_superuser":true,"username":"filler"},"employee":{"id":0}}}})
    //this.setState({'UserData':data});
  };

  componentDidMount()
  { 
    //getCSRF();
    this.getUserData();
  };
  
  render()
  {
    return(
    <div className="fullsz disflxcol">
      <div className = "flx1 disflxrow bkmnclr1">

        <BrowserRouter>
          <SideMenu MenuLinks = {this.MenuLinks.current}/>
            <Routes>
              <Route path = "/payroll/index" element={<div></div>}/>
              <Route path = "/payroll/employee_search/" element={<LazyWrapper Comp = {<this.EmployeeSearch endpoint="/api/payroll/employees/" UserData = {this.state.UserData}/>}/>}/>
              <Route path = "/payroll/timesheet_create/" element={<LazyWrapper Comp = {<this.TimeSheetCreate endpoint="/api/payroll/timesheet/" UserData = {this.state.UserData}/>}/>}/>
              <Route path = "/payroll/timesheet_search/" element = {<LazyWrapper Comp = {<this.TimeSheetSearch endpoint="/api/payroll/timesheet/" UserData = {this.state.UserData}/>}/>}/>
            </Routes>
        </BrowserRouter>
      </div>
    </div>);
  };
}

import React, { Component} from 'react';
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import {getCSRF, checkAuth} from './Utilities/Endpoints'
import Navbar from './Components/Navbar';
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
    this.EmployeeSearch = React.lazy(() => {return import('./Apps/EmployeeSearch')});
    this.TimeSheetCreate = React.lazy(() => {return import('./Apps/TimeSheetCreate')});
    this.TimeSheetSearch = React.lazy(() => {return import('./Apps/TimeSheetSearch')});
    this.MenuLinks=React.createRef();
    this.MenuLinks.current=
    {
      "Employee Reports":'/payroll/employee_search/',
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
    let data = await checkAuth();
    this.setState({'UserData':data});
  };

  componentDidMount()
  { 
    getCSRF();
    this.getUserData();
  };
  
  render()
  {
    return(
    <div className="fullsz disflxcol">
      <Navbar config={this.NAV_CONFIG} UserData = {this.state.UserData} setUserData = {(value) => this.setState({'UserData':value})}></Navbar>
      <div className = "flx1 disflxrow bkmnclr1">

        <BrowserRouter>
          <SideMenu MenuLinks = {this.MenuLinks.current}/>
            <Routes>
              <Route path = "/" />
              <Route path = "/payroll/employee_search/" element={<LazyWrapper Comp = {<this.EmployeeSearch endpoint="/api/payroll/employees/" UserData = {this.state.UserData}/>}/>}/>
              <Route path = "/payroll/timesheet_create/" element={<LazyWrapper Comp = {<this.TimeSheetCreate endpoint="/api/payroll/timesheet/" UserData = {this.state.UserData}/>}/>}/>
              <Route path = "/payroll/timesheet_search/" element = {<LazyWrapper Comp = {<this.TimeSheetSearch endpoint="/api/payroll/timesheet/" UserData = {this.state.UserData}/>}/>}/>
            </Routes>
        </BrowserRouter>
      </div>
    </div>);
  };
}

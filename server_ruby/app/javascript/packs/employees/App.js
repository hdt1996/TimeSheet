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
      "Timesheet Reports":'/employees/timesheet_search/',
      "Timesheet Entry":'/employees/timesheet_create/',
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
              <Route path = "/employees/index" element={<div></div>}/>
              <Route path = "/employees/timesheet_create/" element={<LazyWrapper Comp = {<this.TimeSheetCreate endpoint="/api/employees/timesheet/" UserData = {this.state.UserData}/>}/>}/>
              <Route path = "/employees/timesheet_search/" element = {<LazyWrapper Comp = {<this.TimeSheetSearch endpoint="/api/employees/timesheet/" UserData = {this.state.UserData}/>}/>}/>
            </Routes>
        </BrowserRouter>
      </div>
    </div>);
  };
}

import logo from './logo.svg';
import Navbar from './Components/Navbar';
import Table from './Components/Table';

import './App.css';

function App() {
  let nav_config=
  {
    'title':'Accrualify',
    'sections':['Home','Contact','About Us'],
    'dropdowns':['Departments','Payroll','Accounting','Administration','Sales']
  };

  let tbl_config=
  {
    num_rows:2,
    num_cols:6,
    col_titles:['Employee ID','Department','Clocked In','Lunch In','Lunch Out','Clocked Out'], 
    values:[{}],
    col_width:125
  };


  return (
    <div className="App-Home">
      <Navbar config={nav_config}></Navbar>
      <div className = "App-Home-Body">
        <div id="left_menu">

        </div>

        <div id="main">
          <div className="App-Home-Title"></div>
          <div className="Comp-Table">
            <Table config={tbl_config}></Table>
          </div>
            
        </div>
      </div>
    </div>
  );
}

export default App;

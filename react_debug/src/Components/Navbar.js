import Login from "./Login";
import CreateLogin from "./CreateLogin";
import ForgotLogin from "./ForgotLogin";
import CloseIcon from '@mui/icons-material/Close';
import React, { useState, useEffect} from 'react';
import Endpoints from "../Utilities/Endpoints";
import { getToken } from "../Utilities/Token";
function Navbar({config={'title':'Title','sections':['Section1','Section2','Section3'],'dropdowns':['Dropdown1','Dropdown2','Dropdown3']}, UserData = null, setUserData}) {
  let title = config['title'];
  let sections = config['sections'];
  let dropdowns = config['dropdowns'];
  let [RenderLogin,setRenderLogin] = useState(false);
  let [RenderCreate, setRenderCreate] = useState(false);
  let [RenderForgot, setRenderForgot] = useState(false);
  let [ShowUserOptions, setShowUserOptions] = useState(false);

  function handleShowUserOptions()
  {
    if(ShowUserOptions)
    {
      setShowUserOptions(false);
    }
    else
    {
      setShowUserOptions(true);
    }
  };

  async function sendSignOut()
  {
      const requestOptions={
          method: 'POST',
          headers:{'Content-Type': 'application/json', 'X-CSRFToken': getToken('csrftoken')}
      };
      let response = await fetch(`${Endpoints.domain}${Endpoints.logOutAPI}`,requestOptions);
      let data = await response.json();
      if(data["Success"])
      {
          alert(`${data['Success']}`);
          setUserData(null);
          return;
      };
      alert(data['Error']);
  };

  useEffect(()=>
  {
  }, [RenderLogin, RenderCreate, RenderForgot]);
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <a className="navbar-brand" href="#">{title}</a>


      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
          {
            sections.map((sect, index)=>
            {
              return (
                <li className="nav-item" key={index}>
                  <a className="nav-link" href="#">{sect} 
                    <span className="sr-only">(current)</span>
                  </a>
                </li>
              )
            })
          }
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {dropdowns[0]}
            </a>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
              {
                dropdowns.slice(1).map((drp, index)=>
                {
                  return <a className="dropdown-item" href="#" key = {index}>{drp}</a>
                })
              }
            </div>
          </li>
        </ul>
        <form className="form-inline my-2 my-lg-0">
          <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search"></input>
          <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
        </form>

        <div id="SignIn">
          {
            RenderLogin?
            <div className="NavBar-Login">
              <CloseIcon id="Close" onClick={() =>{setRenderLogin(false)}}/>
              <Login setRenderLogin={setRenderLogin} setRenderCreate={setRenderCreate} setRenderForgot={setRenderForgot}></Login>
            </div>
            :
            RenderCreate?
            <div className="NavBar-Login">
              <CloseIcon id="Close" onClick={() =>{setRenderCreate(false)}}/>
              <CreateLogin setRenderLogin={setRenderLogin} setRenderCreate={setRenderCreate} setRenderForgot={setRenderForgot}></CreateLogin>
            </div>
            :
            RenderForgot?
            <div className="NavBar-Login">
              <CloseIcon id="Close" onClick={() =>{setRenderForgot(false)}}/>
              <ForgotLogin setRenderLogin={setRenderLogin} setRenderCreate={setRenderCreate} setRenderForgot={setRenderForgot}></ForgotLogin>
            </div>
            :
            UserData && UserData.Error?
            <div className="Logged-In">
              <div className = "Col" onClick={() => {handleShowUserOptions()}}>
                <div>Currently</div>
                <div>htran_dev</div>
              </div>
              <div className = "Col">
                <div>Employee ID</div>
                <div>{`1`}</div>
              </div>
              {
                ShowUserOptions?
                <div className="Options">
                  <button onClick = {() => {sendSignOut()}}>
                    Sign Out
                  </button>
                  <button>
                    Change Account Settings
                  </button>
                </div>
                :null
              }
            </div>
            :
            <button id="Button" onClick={() => {setRenderLogin(true)}}>
              Sign In
            </button>
          }

        </div>
      </div>
    </nav>
  );
}

/*
              <div>{UserData.Success.username}</div>
              <div>{`Employee ID: ${UserData.Success.employee.id}`}</div>

*/
export default Navbar;

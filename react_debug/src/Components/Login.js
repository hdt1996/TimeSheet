import Form from 'react-bootstrap/Form'
import React, { useState, useEffect, useRef} from "react";
import VisibilityIcon from '@mui/icons-material/Visibility';
import {login} from '../Utilities/Endpoints';
import {hidePasswordInput} from '../Utilities/Utils'
function Login({setRenderLogin, setRenderCreate, setRenderForgot, setUserData}) {
    let Password = useRef([]);
    let PassChar = useRef([0,0]);
    let ShowPass = useRef(false);
    let [Username, setUsername] = useState(null);

    function handleMouseUp()
    {
        let element = document.getElementById('login-password'); //Works much better than having a selectedPassword state!
        if(document.activeElement === element)
        {
            PassChar.current = [element.selectionStart,element.selectionEnd];
        };
    };

    function handleShowPassword(e)
    {
        let pass_element = document.getElementById('login-password');
        pass_element.value = Password.current.join('');
        ShowPass.current = true;
    };

    async function sendSignIn()
    {
        let data = await login({"username":Username, "password":Password.current.join('')});
        if(data["Success"])
        {
            alert(`${data['Success'].user.username} logged in`);
            setUserData(data);
            Password.current = [];
            setUsername(null);
            setRenderLogin(false);
            window.location.reload();
            return;
        };
        alert(data['Error']);
    };
    
    useEffect(()=>
    {
        window.addEventListener('mouseup',handleMouseUp);

        return () =>
        {
            window.removeEventListener('mouseup',handleMouseUp);
        };
    },[]);
    
    return (
        <Form className="Comp-Login">
            <div className = "CL-Row">
                <div style={{textAlign:"center", fontWeight:"bolder", borderBottom:"solid black .1em"}}>Welcome!</div>
                <br></br>
                <div>Username</div>
                <Form.Control onChange = {(e) => {setUsername(e.target.value)}} placeholder="Enter your Username"></Form.Control>
                <div>Password</div>
                <div className = "Password">
                    <Form.Control 
                        placeholder="Enter your Password" id="login-password"
                        onChange = {(e) => {hidePasswordInput(e,Password,PassChar, ShowPass)}}
                    ></Form.Control>
                    <div className = "ShowPass" onClick = {(e) => {handleShowPassword(e)}}><VisibilityIcon></VisibilityIcon></div>
                </div>

                <br></br>
                <button type="button" onClick={()=>{sendSignIn()}} >Sign In</button>
                <br></br>
                <div>
                    <a onClick = {() => {setRenderForgot(true);setRenderLogin(false);}}>Forgot username or password?</a>
                </div>
                <div>
                    <a onClick = {() => {setRenderCreate(true);setRenderLogin(false);}}>Create an account with us</a>
                </div>
            </div>
        </Form>
    );
  }
  
  export default Login;
  
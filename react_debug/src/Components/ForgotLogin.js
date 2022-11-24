import Form from 'react-bootstrap/Form'
import React from "react";

function ForgotLogin({setRenderLogin, setRenderCreate, setRenderForgot}) {

    return (
        <Form className="Comp-Forgot">
            <div className = "CF-Row">
                <div style={{fontWeight:"normal",fontSize:".85em", borderBottom:"solid black .1em", textAlign:"justify"}}>Please input your details into one of the following options to proceed...</div>
                <br></br>
                <div>Recovery by Email (Get Temp Password)</div>
                <Form.Control placeholder="Enter your recovery email"></Form.Control>
                <div>Recovery by Username (Security Questions)</div>
                <Form.Control placeholder="Enter your username"></Form.Control>

                <button type="button" id="button" onClick={()=>{}} >Initialize Account Recovery</button>
                <br></br>
                <div>
                    <a onClick = {() => {setRenderCreate(true);setRenderForgot(false);}}>Create an account with us</a>
                </div>
                <div>
                    <a onClick = {() => {setRenderLogin(true);setRenderForgot(false);}}>Go back to login</a>
                </div>
            </div>
        </Form>
    );
  }
  
  export default ForgotLogin;
  
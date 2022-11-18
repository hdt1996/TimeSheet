import Form from 'react-bootstrap/Form'
import React, { useState, useEffect} from "react";

function ForgotLogin({setRenderLogin, setRenderCreate, setRenderForgot}) {
    let [Password,setPassword] = useState([]);
    let [PassChar, setPassChar] = useState([0,0]);
    let [Username, setUsername] = useState(null);

    let handlePassInput = (e,type) => {
        let curr_password = [...Password];
        let value = e.target.value;
        let curr_pass_length = curr_password.join('').length;
        let diff = value.length - curr_pass_length;
        let mod_chars=[];
        let hidden_pass = [];
        let newPassChar = PassChar[1]+diff;
        let index_offset = PassChar[1]-PassChar[0];
        if(diff > 0)
        {
            mod_chars = value.slice(PassChar[0],newPassChar);
            if(value[value.length-1] !== '*' && diff === 1)
            {
                curr_password.splice(PassChar[0],diff,...mod_chars); 
            }
            else
            {
                curr_password.splice(PassChar[0],index_offset,...mod_chars); 
            }
        }
        else if(diff < 0)
        {
            mod_chars = value.slice(PassChar[0],newPassChar);
            let replaced=false;
            for(let i = 0; i < value.length;i++)
            {
                if(value[i] !== '*'){replaced=true; break;}
            };
            if(!replaced)
            {
                curr_password.splice(newPassChar,-diff);
            }
            else if (replaced)
            {
                curr_password.splice(PassChar[0],index_offset,...mod_chars);
            }
        }
        else
        {
            mod_chars = value.slice(PassChar[0],PassChar[1]);
            curr_password.splice(PassChar[0],index_offset,...mod_chars);
            newPassChar=PassChar[1];
        }
        for(let i = 0; i < value.length;i++){hidden_pass.push('*')};
        e.target.value = hidden_pass.join('');
        setPassChar([newPassChar,newPassChar]);
        setPassword(curr_password);
    };

    function handleMouseUp()
    {
        let element = document.querySelector("#Comp-Login-Password"); //Works much better than having a selectedPassword state!
        if(document.activeElement === element)
        {
            setPassChar([element.selectionStart,element.selectionEnd]);
        };
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
        <Form className="Comp-Forgot">
            <div className = "CF-Row">
                <div style={{fontWeight:"normal",fontSize:".85em", borderBottom:"solid black .1em", textAlign:"justify"}}>Please input your details into one of the following options to proceed...</div>
                <br></br>
                <div>Recovery by Email (Get Temp Password)</div>
                <Form.Control onChange = {(e) => {setUsername(e.target.value)}} placeholder="Enter your recovery email"></Form.Control>
                <div>Recovery by Username (Security Questions)</div>
                <div className = "Password">
                    <Form.Control 
                        placeholder="Enter your username" id="Comp-Login-Password"
                        onChange = {(e) => {handlePassInput(e,'')}}
                    ></Form.Control>
                </div>

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
  
import { Form, Col ,Row} from 'react-bootstrap'
import React, { useState, useEffect, useRef} from "react";
import DateRangeIcon from '@mui/icons-material/DateRange';
import Fetcher from '../Utilities/Fetcher';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import VisibilityIcon from '@mui/icons-material/Visibility';
import {buildDateTimeStr} from '../Utilities/Utils'

function CreateLogin({setRenderLogin, setRenderCreate, setRenderForgot}) {
    let FirstName= useRef(null);
    let LastName= useRef(null);
    let Password = useRef([]);
    let PersonalEmail = useRef('');
    let WorkEmail = useRef(null);
    let Department = useRef(null);
    let JobTitle = useRef(null);
    let HourlyorSalary = useRef(true);
    let PayRate = useRef(null);
    let PassChar = useRef([0,0]);
    let Username = useRef(null);

    let [ShowPass,setShowPass] = useState(false);
    let today = new Date();
    let [CurrentDate,setCurrentDate] = useState(today.toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}));
    let [ActiveCalendar,setActiveCalendar] = useState(false);
    let StartDate = useRef(buildDateTimeStr(today));

    let handlePassInput = (e) => {
        let curr_password = Password.current;
        let value = e.target.value;
        let curr_pass_length = curr_password.join('').length;
        let diff = value.length - curr_pass_length;
        let mod_chars=[];
        let hidden_pass = [];
        let currPassChar = PassChar.current
        let newPassChar = currPassChar[1]+diff;
        let index_offset = currPassChar[1]-currPassChar[0];
        console.log(diff);
        if(diff > 0)
        {
            mod_chars = value.slice(currPassChar[0],newPassChar);
            if(value[value.length-1] !== '*' && diff === 1)
            {
                curr_password.splice(currPassChar[0],diff,...mod_chars); 
            }
            else
            {
                curr_password.splice(currPassChar[0],index_offset,...mod_chars); 
            }
        }
        else if(diff < 0)
        {
            mod_chars = value.slice(currPassChar[0],newPassChar);
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
                curr_password.splice(currPassChar[0],index_offset,...mod_chars);
            }
        }
        else
        {
            mod_chars = value.slice(currPassChar[0],currPassChar[1]);
            curr_password.splice(currPassChar[0],index_offset,...mod_chars);
            newPassChar=currPassChar[1];
        }
        for(let i = 0; i < value.length;i++){hidden_pass.push('*')};
        e.target.value = hidden_pass.join('');
        PassChar.current = [newPassChar,newPassChar];
        Password.current = curr_password;
        console.log(curr_password)
    };

    function handleMouseUp()
    {
        let element = document.querySelector("#Comp-Login-Password"); //Works much better than having a selectedPassword state!
        if(document.activeElement === element)
        {
            PassChar.current = [element.selectionStart,element.selectionEnd];
        };
    };

    async function sendSignIn()
    {
        const requestOptions={
            method: 'POST',
            headers:{'Content-Type': 'application/json'},
            body:JSON.stringify(
            {
                "user":
                {
                    "first_name":FirstName.current,
                    "last_name":LastName.current,
                    "username":Username.current, 
                    "password":Password.current.join(''),
                    'email':PersonalEmail.current,
                },
                "employee":
                {
                    'work_email':WorkEmail.current,
                    'department':Department.current,
                    'job_title':JobTitle.current,
                    'hourly':HourlyorSalary.current,
                    'pay_rate':PayRate.current,
                    'start_date':StartDate.current
                }
            })
        };
        let response = await fetch(`${Fetcher.domain}${Fetcher.createLogin}`,requestOptions);
        let data = await response.json();
        if(!data["Error"])
        {
            alert(`Successfully Created User Entry ${data['User'].id}\nSuccessfully Created Employee Entry ${data['Employee'].id}`);
            Password.current=[];
            Username.current=null;
            return setRenderCreate(false);
        };
        alert(data['Error']);
    };

    let renderCalendar = () =>
    {
        if(ActiveCalendar === true)
        {
            return setActiveCalendar(false)
        };
        setActiveCalendar(true);
    };

    let handleDateChange = (e) =>
    {
        let date = new Date(e)
        let date_format = date.toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"});
        setCurrentDate(date_format);
        StartDate.current = buildDateTimeStr(date);
    };

    useEffect(()=>
    {
    },[Password, PassChar, ShowPass, Username]);
    

    useEffect(()=>
    {
        window.addEventListener('mouseup',handleMouseUp);

        return () =>
        {
            window.removeEventListener('mouseup',handleMouseUp);
        };
    },[]);
    
    return (
        <Form className="Comp-CreateLogin">
                <div className= "Input">
                    <div className = "Col">
                        <div>New Employee Username</div>
                        <Form.Control onChange = {(e) => {Username.current=e.target.value}} placeholder="Enter your Username (required)"></Form.Control>
                        <div>New Employee Password</div>
                        <div id = "Password">
                            <Form.Control 
                                placeholder="Enter your Password (required)" id="Comp-Login-Password"
                                onChange = {(e) => {handlePassInput(e)}}
                            >
                            </Form.Control>
                            <div><VisibilityIcon></VisibilityIcon></div>
                        </div>
                        <div>First Name</div>
                        <Form.Control onChange = {(e) => {FirstName.current=e.target.value}} placeholder="Enter employee's first name (required)"></Form.Control>
                        <div>Last Name</div>
                        <Form.Control onChange = {(e) => {LastName.current=e.target.value}} placeholder="Enter employee's last name (required)"></Form.Control>
                        <div>Personal Email</div>
                        <Form.Control onChange = {(e) => {PersonalEmail.current=e.target.value}} placeholder="Enter employee's personal email"></Form.Control>
                    </div>

                    <div className = "Col">
                        <div>Work Email</div>
                        <Form.Control onChange = {(e) => {WorkEmail.current=e.target.value}} placeholder="Enter employee's work email"></Form.Control>
                        <div>Department</div>
                        <Form.Control onChange = {(e) => {Department.current=e.target.value}} placeholder="Enter employee's department"></Form.Control>
                        <div>Job Title</div>
                        <Form.Control onChange = {(e) => {JobTitle.current=e.target.value}} placeholder="Enter employee's job title"></Form.Control>
                        <div>Hourly or Salary</div>
                        <Form.Control onChange = {(e) => {HourlyorSalary.current=e.target.value}} placeholder="Choose hourly or salary"></Form.Control>
                        <div>Pay Rate (Hourly per 40-Hour Week)</div>
                        <Form.Control onChange = {(e) => {PayRate.current=e.target.value}} placeholder="Enter employee's pay rate"></Form.Control>
                        <div>Start date</div>
                        <div id = "Date">
                            <Form.Control id="Value" placeholder={CurrentDate}></Form.Control>
                            <DateRangeIcon id = "Icon" onClick ={() => {renderCalendar()}} ></DateRangeIcon>
                            <div >
                            {
                                ActiveCalendar?
                                <DatePicker     
                                    value={CurrentDate} 
                                    disabledKeyboardNavigation
                                    placeholderText="mm/dd/yyyy" 
                                    format = 'yyyy-MM-dd' 
                                    onChange = {(e) =>handleDateChange((e))} 
                                    className = "FloatingCalendar TextField">

                                </DatePicker>:null
                            }
                            </div>
                        </div>
                    </div>
                </div>
                <br></br>
                <button type="button" id="button" onClick={()=>{sendSignIn()}} >Create Account</button>
                <br></br>
                <div>
                    <a onClick = {() => {console.log("Clicked to Recover");setRenderForgot(true);setRenderCreate(false);}}>Go to forgot username or password?</a>
                </div>
                <div>
                    <a onClick = {() => {console.log("Clicked to Create");setRenderLogin(true);setRenderCreate(false);}}>Go back to login</a>
                </div>
        </Form>
    );
  }
  
  export default CreateLogin;
  
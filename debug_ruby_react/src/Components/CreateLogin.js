import Form from 'react-bootstrap/Form'
import React, { useState, useEffect, useRef} from "react";
import DateRangeIcon from '@mui/icons-material/DateRange';
import {createLogin} from '../Utilities/Endpoints';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import VisibilityIcon from '@mui/icons-material/Visibility';
import {buildDateTimeStr, hidePasswordInput, alternativeBoolState} from '../Utilities/Utils';

function CreateLogin({setRenderLogin, setRenderCreate, setRenderForgot}) {
    let FirstName= useRef(null);
    let LastName= useRef(null);
    let Password = useRef([]);
    let PassChar = useRef([0,0]);
    let ShowPass = useRef(false);
    let PersonalEmail = useRef('');
    let WorkEmail = useRef(null);
    let Department = useRef(null);
    let JobTitle = useRef(null);
    let HourlyorSalary = useRef(true);
    let PayRate = useRef(null);
    let Username = useRef(null);
    let today = new Date();
    let [CurrentDate,setCurrentDate] = useState(today.toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}));
    let [ActiveCalendar,setActiveCalendar] = useState(false);
    let StartDate = useRef(buildDateTimeStr(today));

    function handleMouseUp()
    {
        let element = document.getElementById("create-password"); //Works much better than having a selectedPassword state!
        if(document.activeElement === element)
        {
            PassChar.current = [element.selectionStart,element.selectionEnd];
        };
    };
    
    let handleDateChange = (e) =>
    {
        let date = new Date(e)
        let date_format = date.toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"});
        setCurrentDate(date_format);
        StartDate.current = buildDateTimeStr(date);
    };

    function handleShowPassword()
    {
        let pass_element = document.getElementById("create-password");
        pass_element.value = Password.current.join('');
        ShowPass.current = true;
    };

    function makeSignUpData()
    {
        return (
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
        });
    };

    async function sendSignUp()
    {
        let data = await createLogin(makeSignUpData());
        if(data['Error'])
        {
            alert(data['Error']);
            return;
        };
        if(data['detail'])
        {
            alert(data['detail']);
            return;
        };
        alert(`Successfully Created User Entry ${data['User'].id}\nSuccessfully Created Employee Entry ${data['Employee'].id}\nReady to close`);
        if(setRenderCreate){setRenderCreate(false)};
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
        <Form className="Comp-CreateLogin">
            <div className= "Input">
                <div className = "Col">
                    <div className="Labels">Start date</div>
                    <div className= "Date">
                        <Form.Control className="Value" placeholder={CurrentDate}></Form.Control>
                        <DateRangeIcon className = "Icon" onClick ={() => {alternativeBoolState(ActiveCalendar,setActiveCalendar)}} ></DateRangeIcon>
                        <div >
                        {
                            ActiveCalendar?
                            <DatePicker     
                                value={CurrentDate} 
                                disabledKeyboardNavigation
                                placeholderText="mm/dd/yyyy" 
                                format = 'yyyy-MM-dd' 
                                onChange = {(e) =>handleDateChange((e))} 
                                className = "Field-Calendar TextField">
                            </DatePicker>:null
                        }
                        </div>
                    </div>
                </div>

                <div className = "Col">
                    <div className="Labels">Work Email</div>
                    <Form.Control onChange = {(e) => {WorkEmail.current=e.target.value}} placeholder="Enter employee's work email"></Form.Control>
                    <div className="Labels">Department</div>
                    <Form.Control onChange = {(e) => {Department.current=e.target.value}} placeholder="Enter employee's department"></Form.Control>
                    <div className="Labels">Job Title</div>
                    <Form.Control onChange = {(e) => {JobTitle.current=e.target.value}} placeholder="Enter employee's job title"></Form.Control>
                    <div className="Labels">Hourly or Salary</div>
                    <Form.Control onChange = {(e) => {HourlyorSalary.current=e.target.value}} placeholder="Enter 0 or 1 (Salary or Hourly)"></Form.Control>
                    <div className="Labels">Pay Rate (per Hour)</div>
                    <Form.Control onChange = {(e) => {PayRate.current=e.target.value}} placeholder="Enter employee's pay rate"></Form.Control>
                </div>
            </div>

            <button type="button" className = "SignInOptions" onClick={()=>{sendSignUp()}} >Create Account</button>
            {
                setRenderLogin && setRenderForgot?
                <>
                <br></br>
                <div>
                    <a onClick = {() => {setRenderForgot(true);setRenderCreate(false);}}>Go to forgot username or password?</a>
                </div>
                <div>
                    <a onClick = {() => {setRenderLogin(true);setRenderCreate(false);}}>Go back to login</a>
                </div>
                </>
                :null
            }

        </Form>
    );
  }
  
  export default CreateLogin;
  
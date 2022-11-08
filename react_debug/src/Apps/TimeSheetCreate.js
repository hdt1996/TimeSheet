import React, { useState, useEffect, useRef} from 'react';
import TextField from "@mui/material/TextField";
import PostForm from '../Components/PostForm';
import Endpoints from '../Utilities/Endpoints';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateRangeIcon from '@mui/icons-material/DateRange';
import {getParentIntAttrib, buildDateTimeStr} from '../Utilities/Utils';
import {getToken} from '../Utilities/Token'
function TimeSheetCreate({endpoint})
{
    let TimeSheet_columns = ['description','bill_rate','total_time','total_bill','employee'];
    let bill_line_columns = ['num_minutes','memo'];

    let PostFormConfig=
    {
        num_rows:1,
        col_titles:["Minutes Worked", "Memo"],
        db_columns:bill_line_columns
    };

    let today = new Date();
    let [CurrentDate,setCurrentDate] = useState(today.toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}));
    let [ActiveCalendar,setActiveCalendar] = useState(false);

    let TimeSheetData=useRef({'date':buildDateTimeStr(today)});
    let BillingLineData=useRef([{"id":null,"num_minutes":null,"memo":null}]);

    let [SubmissionTime,setSubmissionTime] = useState("Pending");
    let [TextDisabled,setTextDisabled] = useState(false);
    let [ModeLabel, setModeLabel] = useState("Create");
    useEffect(()=>
    {
    },[TimeSheetData,BillingLineData,CurrentDate,ActiveCalendar,SubmissionTime,TextDisabled,ModeLabel]);

    function handleTimeSheetInputs(e, calculate = false)
    {
        if(calculate)
        {
            let total_time_element = document.querySelector('input[placeholder="total_time"]');
            let total_bill_element = document.querySelector('input[placeholder="total_bill"]');
            let bill_rate_element = document.querySelector('input[placeholder="bill_rate"]');
            total_bill_element.value = parseFloat(total_time_element.value) *  parseFloat(bill_rate_element.value);
        }
        let key = e.target.getAttribute("placeholder");
        let currTimeSheetData = TimeSheetData.current;
        currTimeSheetData[key] = e.target.value;
    };
    function handleBillLineInputs(e, calculate = false)
    {
        let row_index = getParentIntAttrib(e,'placeholder',2)
        let currentBillLineData = BillingLineData.current;
        let db_field = e.target.getAttribute("db");
        if(!currentBillLineData[row_index])
        {
            currentBillLineData[row_index] = {};
        }

        if(calculate && db_field === 'num_minutes' && !isNaN(parseFloat(e.target.value)))
        {
            let total_time_element = document.querySelector('input[placeholder="total_time"]');
            let total_bill_element = document.querySelector('input[placeholder="total_bill"]');
            let bill_rate_element = document.querySelector('input[placeholder="bill_rate"]');
            let parsed_val = parseFloat(e.target.value);
            total_time_element.value = parseFloat(total_time_element.value)  - currentBillLineData[row_index][db_field] + parsed_val;
            total_bill_element.value = parseFloat(total_time_element.value) *  parseFloat(bill_rate_element.value);
        }
        currentBillLineData[row_index][db_field] = e.target.value;
    };

    function freezeTimeSheet(label, custom = null)
    {
        if(custom)
        {
            alert(`Successfully ${custom}`);
        }
        else
        {
            alert(`${label}`);
        }

        let all_inputs = document.querySelector("#TimeSheet #Form").querySelectorAll("input");
        for(let i = 0; i < all_inputs.length;i++)
        {
            all_inputs[i].classList.add("TimeSheet-Locked");
        };
        let add_button = document.querySelector(".Comp-PostForm-Add").querySelector("#button");
        add_button.classList.add("TimeSheet-Locked");
        let delete_buttons = document.querySelectorAll(".Comp-PostForm-Row #delete");
        for(let i = 0; i < delete_buttons.length; i++)
        {
            delete_buttons[i].classList.add("TimeSheet-Locked");
        };
        setTextDisabled(true);
        setSubmissionTime(`${label} ${new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})}`);
    }

    async function putData()
    {
        const requestOptions={
            method: 'PUT',
            headers:{'Content-Type': 'application/json', 'X-CSRFToken': getToken('csrftoken')},
            body:JSON.stringify({"TimeSheetData":TimeSheetData.current,"LineItemsData":BillingLineData.current})
        };
        let response = await fetch(`${Endpoints.domain}${endpoint}`,requestOptions);
        let data = await response.json();
        if(data["Error"])
        {
            setSubmissionTime("Failed");
        }
        else
        {

            let currBillingLineData = BillingLineData.current;
            for(let i = 0; i < data.LineItems.length; i++)
            {
                currBillingLineData[i]["id"] = data.LineItems[i].id;
            };
            let del_items = data['DeletedLineItems'];

            if(del_items.length === 0)
            {
                return freezeTimeSheet('Updated',`Updated: Timesheet Entry ${data['TimeSheet'].id}`);
            };
            let id_str=[];
            for(let i = 0; i < del_items.length; i++)
            {
                id_str.push(del_items[i].id);
            };
            id_str = id_str.join(', ');
            freezeTimeSheet('Updated',`Updated: Timesheet Entry ${data['TimeSheet'].id}\nDeleted: Timesheet Entries ${id_str}`);
        }
    }
    async function postData()
    {
        const requestOptions={
            method: 'POST',
            headers:{'Content-Type': 'application/json', 'X-CSRFToken': getToken('csrftoken')},
            body:JSON.stringify({"TimeSheetData":TimeSheetData.current,"LineItemsData":BillingLineData.current})
        };
        let response = await fetch(`${Endpoints.domain}${endpoint}`,requestOptions);
        let data = await response.json();
        if(data["Error"])
        {
            setSubmissionTime("Failed");
        }
        else{
            freezeTimeSheet("Created", `Created: Timesheet Entry ${data['TimeSheet'].id}`);
            let currTimeSheetData = TimeSheetData.current;
            let currBillingLineData = BillingLineData.current;
            currTimeSheetData['id'] = data.TimeSheet.id;
            for(let i = 0; i < data.LineItems.length; i++)
            {
                currBillingLineData[i]["id"] = data.LineItems[i].id;
            };
        }
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

        let currTimeSheetData = TimeSheetData.current;
        currTimeSheetData["date"] = buildDateTimeStr(date);
    };

    let handleUpdateCurrent = () =>
    {
        let all_inputs = document.querySelector("#TimeSheet #Form").querySelectorAll("input");
        for(let i = 0; i < all_inputs.length;i++)
        {
            all_inputs[i].classList.remove("TimeSheet-Locked");
        };
        let add_button = document.querySelector(".Comp-PostForm-Add").querySelector("#button");
        add_button.classList.remove("TimeSheet-Locked");
        let delete_buttons = document.querySelectorAll(".Comp-PostForm-Row #delete");
        for(let i = 0; i < delete_buttons.length; i++)
        {
            delete_buttons[i].classList.remove("TimeSheet-Locked");
        };
        setTextDisabled(false);
        setModeLabel("Update");
        setSubmissionTime(`Pending Update`);
    };
    useEffect(()=>
    {
        if(Object.keys(TimeSheetData).length === 0)
        {
            let emptyTimeSheetData = TimeSheetData.current;
            for(let i = 0; i < TimeSheet_columns.length; i++)
            {
                emptyTimeSheetData[TimeSheet_columns[i]]=null;
            };
        };
    },[]);



    return ( //First map is column titles; Second map is for data rows/columns
    <div id="TimeSheet">
        <div className="App-Home-Title">
            TimeSheet Entry
        </div>
        <div id= "row">
            <div id="TimeSheet-Totals" className="TimeSheet-Totals">
                <div id = "Date">
                    <TextField
                        id = "Value"
                        placeholder={CurrentDate}
                        margin="normal"
                        disabled = {true}
                        className={TextDisabled?"TimeSheet-Locked":"TextField"}
                    />
                    <DateRangeIcon id = "Icon" onClick ={() => {renderCalendar()}} ></DateRangeIcon>
                    <div className={TextDisabled?"TimeSheet-Locked":""}>
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
                <TextField
                    label="Employee_ID"
                    placeholder="employee"
                    margin="normal"
                    onChange={(e)=>{handleTimeSheetInputs(e)}}
                    disabled = {TextDisabled}
                    className={TextDisabled?"TimeSheet-Locked":"TextField"}
                />
                <TextField
                    label="Billing Rate"
                    placeholder="bill_rate"
                    margin="normal"
                    defaultValue={0}
                    onChange={(e)=>{handleTimeSheetInputs(e, true)}}
                    disabled = {TextDisabled}
                    className={TextDisabled?"TimeSheet-Locked Edited":"TextField Edited"}
                />
                <TextField
                    label="Total Time"
                    placeholder="total_time"
                    margin="normal"
                    defaultValue={0}
                    disabled = {true}
                    className={TextDisabled?"TimeSheet-Locked Edited":"TextField Edited"}
                />
                <TextField
                    label="Total Bill"
                    placeholder="total_bill"
                    margin="normal"
                    defaultValue={0}
                    disabled = {true}
                    className={TextDisabled?"TimeSheet-Locked Edited":"TextField Edited"}
                />
            </div>

            <div className='TimeSheet-Description'>
                <TextField
                    multiline
                    fullWidth
                    minRows={15}
                    margin="normal"
                    label="Description"
                    placeholder="description"
                    onChange={(e)=>{handleTimeSheetInputs(e)}}
                    disabled = {TextDisabled}
                    className={TextDisabled?"TimeSheet-Locked":"TextField"}
                />
            </div>
        </div>
        <div className="App-Home-Title">
            Billing Line Items
        </div>
        <div id="Form">
            <PostForm BillingLineData = {BillingLineData} inputChange = {handleBillLineInputs} config={PostFormConfig}></PostForm>
        </div>
        <div id="footer">
            <div id="submission-time">
                <div id = "Row">
                    <div>Status:</div> 
                    <div>{SubmissionTime}</div>
                </div>

            </div>
            <div id="submit-button">
                {
                    TextDisabled?
                    <button onClick={() => {window.location.reload()}}>New TimeSheet</button>
                    :
                    <button 
                        onClick=
                        {
                            ModeLabel==="Create"?
                            ()=>{postData()}
                            :
                            ModeLabel==="Update"?
                            ()=>{putData()}
                            :
                            null
                        }
                    >{
                        ModeLabel}
                    </button>
                }
                {
                    TextDisabled?
                    <button onClick = {() =>{handleUpdateCurrent()}}>Update Current</button>
                    :
                    null
                }

                
            </div>
        </div>

    </div>
    );
}
  
export default TimeSheetCreate;
  

import React, { useState, useEffect, useRef} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateRangeIcon from '@mui/icons-material/DateRange';
import TextField from "@mui/material/TextField";
import {fetcherModify} from '../Utilities/Endpoints';
import PostForm from '../Components/PostForm';
import {getParentIntAttrib, buildDateTimeStr} from '../Utilities/Utils';
import {alternativeBoolState, processDelData} from '../Utilities/Utils'

export default function TimeSheetCreate({endpoint, UserData = {}})
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

    let handleDateChange = (e) =>
    {
        let date = new Date(e)
        let date_format = date.toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"});
        setCurrentDate(date_format);
        let currTimeSheetData = TimeSheetData.current;
        currTimeSheetData["date"] = buildDateTimeStr(date);
    };

    function handleEmployeeIDValue()
    {
        if(UserData !== null && "Success" in UserData && "user" in UserData.Success && "employee" in UserData.Success)
        {
            if(!UserData.Success.user.is_superuser && UserData.Success.employee.id)
            {
                return UserData.Success.employee.id
            };
        };
    };

    function handleEmployeeIDInputStatus()
    {
        if(UserData !== null && "Success" in UserData && "user" in UserData.Success && "employee" in UserData.Success)
        {
            if(!UserData.Success.user.is_superuser && UserData.Success.employee.id)
            {
                return true
            };
        };
        return TextDisabled;
    };

    function handleTimeSheetInputs(e, calculate = false)
    {
        if(calculate)
        {
            let total_time_element = document.querySelector('input[placeholder="total_time"]');
            let total_bill_element = document.querySelector('input[placeholder="total_bill"]');
            let bill_rate_element = document.querySelector('input[placeholder="bill_rate"]');
            total_bill_element.value = (parseFloat(total_time_element.value) *  parseFloat(bill_rate_element.value)/ 60.0).toFixed(2);//Conversion rate for $/hr to $/minute;
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
        };

        if (!calculate)
        {
            currentBillLineData[row_index][db_field] = e.target.value;
            return;
        }
        if (db_field === 'num_minutes' && (e.target.value === '' || !/^(\d+)(\.\d*)?$/.test(e.target.value)))
        {
            let total_time_element = document.querySelector('input[placeholder="total_time"]');
            let total_bill_element = document.querySelector('input[placeholder="total_bill"]');
            let bill_rate_element = document.querySelector('input[placeholder="bill_rate"]');
            total_time_element.value = (parseFloat(total_time_element.value) - currentBillLineData[row_index][db_field]).toFixed(2);
            total_bill_element.value = (parseFloat(total_time_element.value) *  parseFloat(bill_rate_element.value)/ 60.0).toFixed(2);
            currentBillLineData[row_index][db_field] = 0.00;
            return;
        };
        if(db_field === 'num_minutes' && /^(\d+)(\.\d*)?$/.test(e.target.value))
        {
            let total_time_element = document.querySelector('input[placeholder="total_time"]');
            let total_bill_element = document.querySelector('input[placeholder="total_bill"]');
            let bill_rate_element = document.querySelector('input[placeholder="bill_rate"]');
            let parsed_val = parseFloat(e.target.value);
            total_time_element.value = (parseFloat(total_time_element.value)  - currentBillLineData[row_index][db_field] + parsed_val).toFixed(2);
            total_bill_element.value = (parseFloat(total_time_element.value) *  parseFloat(bill_rate_element.value)/ 60.0).toFixed(2);
            currentBillLineData[row_index][db_field] = parsed_val.toFixed(2);
            return;
        }
    };

    function freezeTimesheet(time_label = '', custom = null)
    {
        if(custom)
        {
            alert(`Successfully ${custom}`);
        };

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
        setSubmissionTime(`${time_label} ${new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})}`);
    };

    function unfreezeTimesheet()
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

    function processNewData(data)
    {
        TimeSheetData.current['id'] = data.TimeSheet.id;
        let currBillingLineData = BillingLineData.current;
        for(let i = 0; i < data.LineItems.length; i++)
        {
            currBillingLineData[i]["id"] = data.LineItems[i].id;
        };
    };

    async function putData()
    {
        let data = await fetcherModify("PUT",{"TimeSheetData":TimeSheetData.current,"LineItemsData":BillingLineData.current},endpoint);
        if(data["Error"])
        {
            alert(data["Error"])
            setSubmissionTime("Failed");
            return;
        };
        let del_str = processDelData(data.DeletedLineItems, '\nDeleted: Timesheet Entries ');
        TimeSheetData.current['id'] = data.TimeSheet.id;
        processNewData(data);
        freezeTimesheet('Updated',`Updated: Timesheet Entry ${data['TimeSheet'].id}${del_str}`);
    };

    async function postData()
    {
        let data = await fetcherModify("POST",{"TimeSheetData":TimeSheetData.current,"LineItemsData":BillingLineData.current},endpoint);
        if(data["Error"])
        {
            alert(data["Error"])
            setSubmissionTime("Failed");
            return;
        };
        processNewData(data);
        freezeTimesheet("Created", `Created: Timesheet Entry ${data['TimeSheet'].id}`);
    }


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


    return ( 
    <div id="TimeSheet">
        <div className="App-Title">
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
                    <DateRangeIcon id = "Icon" onClick ={() => {alternativeBoolState(ActiveCalendar,setActiveCalendar)}} ></DateRangeIcon>
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
                    value={handleEmployeeIDValue()}
                    onChange={(e)=>{handleTimeSheetInputs(e)}}
                    disabled = {handleEmployeeIDInputStatus()}
                    className={TextDisabled?"TimeSheet-Locked Edited":"TextField Edited"}
                />
                <TextField
                    label="Billing Rate (Hourly)"
                    placeholder="bill_rate"
                    margin="normal"
                    defaultValue={0}
                    onChange={(e)=>{handleTimeSheetInputs(e, true)}}
                    disabled = {TextDisabled}
                    className={TextDisabled?"TimeSheet-Locked Edited":"TextField Edited"}
                />
                <TextField
                    label="Total Time (Minutes)"
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
        <div className="App-Title">
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
                    <button onClick = {() =>{unfreezeTimesheet()}}>Update Current</button>
                    :
                    null
                }

                
            </div>
        </div>

    </div>
    );
};
  

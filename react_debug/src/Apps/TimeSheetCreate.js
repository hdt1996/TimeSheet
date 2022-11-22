import React, { useState, useEffect, useRef} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateRangeIcon from '@mui/icons-material/DateRange';
import TextField from "@mui/material/TextField";
import {fetcherModify} from '../Utilities/Endpoints';
import PostForm from '../Components/PostForm';
import {getParentIntAttrib, buildDateTimeStr, alternativeBoolState, processDelData, buildCalendarStr} from '../Utilities/Utils';

export default function TimeSheetCreate({endpoint, UserData = null, CurrentData = null})
{
    let PostFormConfig= //For line items
    {
        num_rows:1,
        col_map:
        {
            'num_minutes':'Minutes Worked',
            'memo':'Memo'
        },
    };

    let BillingLineData=useRef([{"id":null,"num_minutes":null,"memo":null}]);
    let TimeSheetData=useRef({'date':buildDateTimeStr(new Date())});

    let [CurrentDate,setCurrentDate] = useState(buildCalendarStr(new Date()));
    let [SubmissionTime,setSubmissionTime] = useState("Pending");
    let [ActiveCalendar,setActiveCalendar] = useState(false);
    let [ModeLabel, setModeLabel] = useState("Create");

    let [TextDisabled,setTextDisabled] = useState(false);

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
        if(CurrentData)
        {
            return CurrentData.employee.id;
        };
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
        if(CurrentData)
        {
            return TextDisabled
        };
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

    function handleBillLineDelete(row_index)
    {
        let currentBillLineData = BillingLineData.current;
        let db_field = 'num_minutes'
        let total_time_element = document.querySelector('input[placeholder="total_time"]');
        let total_bill_element = document.querySelector('input[placeholder="total_bill"]');
        let bill_rate_element = document.querySelector('input[placeholder="bill_rate"]');
        total_time_element.value = (parseFloat(total_time_element.value) - currentBillLineData[row_index][db_field]).toFixed(2);
        total_bill_element.value = (parseFloat(total_time_element.value) *  parseFloat(bill_rate_element.value)/ 60.0).toFixed(2);
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

        let total_time_element = document.querySelector('input[placeholder="total_time"]');
        let total_bill_element = document.querySelector('input[placeholder="total_bill"]');
        let bill_rate_element = document.querySelector('input[placeholder="bill_rate"]');

        if (db_field === 'num_minutes' && (e.target.value === '' || !/^(\d+)(\.\d*)?$/.test(e.target.value)))
        {

            total_time_element.value = (parseFloat(total_time_element.value) - currentBillLineData[row_index][db_field]).toFixed(2);
            total_bill_element.value = (parseFloat(total_time_element.value) *  parseFloat(bill_rate_element.value)/ 60.0).toFixed(2);
            currentBillLineData[row_index][db_field] = 0.00;
            return;
        };
        if(db_field === 'num_minutes' && /^(\d+)(\.\d*)?$/.test(e.target.value))
        {
            let parsed_val = parseFloat(e.target.value);
            total_time_element.value = (parseFloat(total_time_element.value)  - currentBillLineData[row_index][db_field] + parsed_val).toFixed(2);
            total_bill_element.value = (parseFloat(total_time_element.value) *  parseFloat(bill_rate_element.value)/ 60.0).toFixed(2);
            currentBillLineData[row_index][db_field] = parsed_val.toFixed(2);
            return;
        };
    };

    function freezeTimesheet(time_label = '', custom = null)
    {
        if(custom)
        {
            alert(`Successfully ${custom}`);
        };

        let all_inputs = document.querySelector(".App-Timesheet .Form").querySelectorAll("input");
        for(let i = 0; i < all_inputs.length;i++)
        {
            all_inputs[i].classList.add("TimeSheet-Locked");
        };
        let add_button = document.querySelector(".Comp-PostForm-Add").querySelector(".Button");
        add_button.classList.add("TimeSheet-Locked");
        let delete_buttons = document.querySelectorAll(".Comp-PostForm-Row .Delete");
        for(let i = 0; i < delete_buttons.length; i++)
        {
            delete_buttons[i].classList.add("TimeSheet-Locked");
        };
        setTextDisabled(true);
        setSubmissionTime(`${time_label} ${new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})}`);
    };

    function unfreezeTimesheet()
    {
        let all_inputs = document.querySelector(".App-Timesheet .Form").querySelectorAll("input");
        for(let i = 0; i < all_inputs.length;i++)
        {
            all_inputs[i].classList.remove("TimeSheet-Locked");
        };
        let add_button = document.querySelector(".Comp-PostForm-Add").querySelector(".Button");
        add_button.classList.remove("TimeSheet-Locked");
        let delete_buttons = document.querySelectorAll(".Comp-PostForm-Row .Delete");
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
        TimeSheetData.current['id'] = data['TimeSheetData'].id;
        let currBillingLineData = BillingLineData.current;
        for(let i = 0; i < data["LineItemsData"].length; i++)
        {
            currBillingLineData[i]["id"] = data["LineItemsData"][i].id;
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
        TimeSheetData.current['id'] = data['TimeSheetData'].id;
        processNewData(data);
        freezeTimesheet('Updated',`Updated: Timesheet Entry ${data['TimeSheetData'].id}${del_str}`);
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
        freezeTimesheet("Created", `Created: Timesheet Entry ${data['TimeSheetData'].id}`);
    }

    useEffect(()=>
    {
        if(CurrentData)
        {   
            setModeLabel("Update");
            let current_data = JSON.parse(JSON.stringify(CurrentData));
            let line_item_data = [...current_data['nestedData']];
            delete current_data['nestedData'];
            current_data['employee'] = current_data['employee'].id;
            BillingLineData.current = [];
            for(let i = 0; i < line_item_data.length; i++)
            {
                
                line_item_data[i]['timesheet'] = line_item_data[i]['timesheet'].id;
                for(let f of ['date_added','date_modified'])
                {
                    delete line_item_data[i][f];
                }
                BillingLineData.current.push(line_item_data[i]);
            };
            TimeSheetData.current = current_data;
        }
    },[CurrentData])

    return ( 
    <div className="App-Timesheet">
        <div className="App-Title">
            TimeSheet Entry
        </div>
        <div className="Row">
            <div id="Fields" className="Fields">
                <TextField
                    label="Timesheet ID"
                    placeholder="id"
                    value={CurrentData?"Exists":"New"}
                    disabled = {true}
                    className={"TimeSheet-Locked"}
                />
                <div className= "Date">
                    <TextField
                        id = "Value"
                        placeholder={CurrentDate}
                        disabled = {true}
                        className={TextDisabled?"TimeSheet-Locked":"Field-Text"}
                    />
                    <DateRangeIcon className = "Icon" onClick ={() => {alternativeBoolState(ActiveCalendar,setActiveCalendar)}} ></DateRangeIcon>
                    <div className={TextDisabled?"TimeSheet-Locked":""}>
                    {
                        ActiveCalendar?
                        <DatePicker     
                            value={CurrentDate} 
                            disabledKeyboardNavigation
                            placeholderText="mm/dd/yyyy" 
                            format = 'yyyy-MM-dd' 
                            onChange = {(e) =>handleDateChange((e))} 
                            className = "Field-Calendar Field-Text">

                        </DatePicker>:null
                    } 
                    </div>
                </div>
                <TextField
                    label="Employee ID"
                    placeholder="employee"
                    value={handleEmployeeIDValue()}
                    onChange={(e)=>{handleTimeSheetInputs(e)}}
                    disabled = {handleEmployeeIDInputStatus()}
                    className={TextDisabled?"TimeSheet-Locked Field-Edit":"Field-Text Field-Edit"}
                />
                <TextField
                    label="Billing Rate (Hourly)"
                    placeholder="bill_rate"
                    defaultValue={CurrentData?CurrentData.bill_rate:0}
                    onChange={(e)=>{handleTimeSheetInputs(e, true)}}
                    disabled = {TextDisabled}
                    className={TextDisabled?"TimeSheet-Locked Field-Edit":"Field-Text Field-Edit"}
                />
                <TextField
                    label="Total Time (Minutes)"
                    placeholder="total_time"
                    defaultValue={CurrentData?CurrentData.total_time:0}
                    disabled = {true}
                    className={TextDisabled?"TimeSheet-Locked Field-Edit":"Field-Text Field-Edit"}
                />
                <TextField
                    label="Total Bill"
                    placeholder="total_bill"
                    defaultValue={CurrentData?CurrentData.total_bill:0}
                    disabled = {true}
                    className={TextDisabled?"TimeSheet-Locked Field-Edit":"Field-Text Field-Edit"}
                />
            </div>

            <div className='Field-Description'>
                <TextField
                    multiline
                    fullWidth
                    minRows={15}
                    maxRows = {15}
                    margin="normal"
                    label="Description"
                    placeholder="description"
                    onChange={(e)=>{handleTimeSheetInputs(e)}}
                    disabled = {TextDisabled}
                    className={TextDisabled?"TimeSheet-Locked":"Field-Text"}
                />
            </div>
        </div>
        <div className="App-Title">
            Billing Line Items
        </div>
        <div className="Form">
            <PostForm BillingLineData = {BillingLineData} inputChange = {handleBillLineInputs} deleteChange = {handleBillLineDelete} config={PostFormConfig} CurrentData={CurrentData?CurrentData['nestedData']:null}></PostForm>
        </div>
        <div className="Footer">
            <div className="Submit-Time">
                <div className = "Footer-Row">
                    <div>Status:</div> 
                    <div>{SubmissionTime}</div>
                </div>

            </div>
            <div className="Submit-Button">
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
  

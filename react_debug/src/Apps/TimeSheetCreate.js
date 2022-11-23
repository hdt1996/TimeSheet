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

        let form_element = document.getElementById("Form")
        let all_inputs = form_element.querySelectorAll("input");
        
        for(let i = 0; i < all_inputs.length;i++)
        {
            all_inputs[i].classList.add("locked");
        };
        let add_button = form_element.querySelector("#add");
        add_button.classList.add("locked");
        let delete_buttons = document.querySelectorAll("#delete");
        for(let i = 0; i < delete_buttons.length; i++)
        {
            delete_buttons[i].classList.add("locked");
        };
        setTextDisabled(true);
        setSubmissionTime(`${time_label} ${new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})}`);
    };

    function unfreezeTimesheet()
    {
        let form_element = document.getElementById("Form")
        let all_inputs = form_element.querySelectorAll("input");

        for(let i = 0; i < all_inputs.length;i++)
        {
            all_inputs[i].classList.remove("locked");
        };
        let add_button = form_element.querySelector("#add");
        add_button.classList.remove("locked");
        let delete_buttons = document.querySelectorAll("#delete");
        for(let i = 0; i < delete_buttons.length; i++)
        {
            delete_buttons[i].classList.remove("locked");
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
    <div className="disflxcol flx30">
        <div className="mxht2p5e bktitleclr1 disflxrctr flx1 fntsz1p5e fntbld">
            Timesheet Entry
        </div>
        <div className="bkrowclr1 disflxrow mxht30e">
            <div className="disflxcol flxcoleven flx5 pdnt1e mnwd18e">
                <TextField
                    label="Timesheet ID"
                    placeholder="id"
                    value={CurrentData?"Exists":"New"}
                    disabled = {true}
                    className={"locked"}
                />
                <div className= "posrel disflxrow" >
                    <TextField
                        placeholder={CurrentDate}
                        disabled = {true}
                        className={`flx1 ${TextDisabled?"locked":"bkwhite"}`}
                    />
                    <DateRangeIcon className = "posabs ctr-right" onClick ={() => {alternativeBoolState(ActiveCalendar,setActiveCalendar)}} ></DateRangeIcon>
                    <div className={TextDisabled?"locked":""}>
                    {
                        ActiveCalendar?
                        <DatePicker     
                            value={CurrentDate} 
                            disabledKeyboardNavigation
                            placeholderText="mm/dd/yyyy" 
                            format = 'yyyy-MM-dd' 
                            onChange = {(e) =>handleDateChange((e))} 
                            className = "posabsz2 bkwhite ">

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
                    className={TextDisabled?"locked txtright":"bkwhite txtright"}
                />
                <TextField
                    label="Billing Rate (Hourly)"
                    placeholder="bill_rate"
                    defaultValue={CurrentData?CurrentData.bill_rate:0}
                    onChange={(e)=>{handleTimeSheetInputs(e, true)}}
                    disabled = {TextDisabled}
                    className={TextDisabled?"locked txtright":"bkwhite txtright"}
                />
                <TextField
                    label="Total Time (Minutes)"
                    placeholder="total_time"
                    defaultValue={CurrentData?CurrentData.total_time:0}
                    disabled = {true}
                    className={TextDisabled?"locked txtright":"bkwhite txtright"}
                />
                <TextField
                    label="Total Bill"
                    placeholder="total_bill"
                    defaultValue={CurrentData?CurrentData.total_bill:0}
                    disabled = {true}
                    className={TextDisabled?"locked txtright":"bkwhite txtright"}
                />
            </div>

            <div className='flx30 mnwd25e'>
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
                    className={TextDisabled?"locked":"bkwhite"}
                />
            </div>
        </div>
        <div className="mxht2p5e mnht2p5e bktitleclr2 disflxrctr flx1 fntsz1p5e fntbld">
            Billing Line Items
        </div>
        <div className="bkbodyclr1 flx1 disflxrow" id = "Form">
            <PostForm BillingLineData = {BillingLineData} inputChange = {handleBillLineInputs} deleteChange = {handleBillLineDelete} config={PostFormConfig} CurrentData={CurrentData?CurrentData['nestedData']:null}></PostForm>
        </div>
        <div className="flx1 mxht3e disflxrow">
            <div className="disflxcol flx1 mxwd25e bkrowclr2 brdblrp5e ">
                <div className = "flx1 Footer-Row disflxrctr posrel fntbld brdblkp125e brdradiusp5e bkbtnclr1">
                    <div className = "disflxrctr brdradiusp5e flx1">Status:</div> 
                    <div className = "disflxrctr brdradiusp5e flx4">{SubmissionTime}</div>
                </div>
            </div>
            <div className="ht100pct disflxrow flxrowend flx1 brdbrrp5e bkrowclr2">
                {
                    TextDisabled?
                    <button className="ht100pct bkbtnclr1 brdradiusp5e brdblkp125e fntsz1p25e hovcursor hovclr2 pdh1e" onClick={() => {window.location.reload()}}>New TimeSheet</button>
                    :
                    <button className="ht100pct bkbtnclr1 brdradiusp5e brdblkp125e fntsz1p25e hovcursor hovclr2 pdh1e pdh1e"
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
                    >
                        {ModeLabel}
                    </button>
                }
                {
                    TextDisabled?
                    <button className = "ht100pct bkbtnclr1 brdradiusp5e brdblkp125e fntsz1p25e hovcursor hovclr2 pdh1e mrgnlft1e" onClick = {() =>{unfreezeTimesheet()}}>Update Current</button>
                    :
                    null
                }
            </div>
        </div>
    </div>
    );
};
  

import {Component} from 'react';
import "react-datepicker/dist/react-datepicker.css";
import {fetcherModify} from '../Utilities/Endpoints';
import {getParentIntAttrib, buildDateTimeStr, processDelData} from '../Utilities/Utils';
import Extender from '../Utilities/Extender'

class Events  
{
    handleDateChange(e)
    {
        let date = new Date(e)
        let date_format = date.toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"});
        this.setState({"CurrentDate":date_format});
        this.TimeSheetData.current["date"] = buildDateTimeStr(date);
    };

    handleEmployeeIDValue()
    {
        if(this.props.CurrentData)
        {
            return this.props.CurrentData.employee.id;
        };
        if(this.props.UserData !== null && "Success" in this.props.UserData && "user" in this.props.UserData.Success && "employee" in this.props.UserData.Success)
        {
            if(!this.props.UserData.Success.user.is_superuser && this.props.UserData.Success.employee.id)
            {
                return this.props.UserData.Success.employee.id
            };
        };
    };

    handleEmployeeIDInputStatus()
    {
        if(this.props.CurrentData)
        {
            return this.state.TextDisabled
        };
        if(this.props.UserData !== null && "Success" in this.props.UserData && "user" in this.props.UserData.Success && "employee" in this.props.UserData.Success)
        {
            if(!this.props.UserData.Success.user.is_superuser && this.props.UserData.Success.employee.id)
            {
                return true
            };
        };
        return this.state.TextDisabled;
    };

    handleTimeSheetInputs(e, calculate = false)
    {
        if(calculate)
        {
            let total_time_element = document.querySelector('input[placeholder="total_time"]');
            let total_bill_element = document.querySelector('input[placeholder="total_bill"]');
            let bill_rate_element = document.querySelector('input[placeholder="bill_rate"]');
            total_bill_element.value = (parseFloat(total_time_element.value) *  parseFloat(bill_rate_element.value)/ 60.0).toFixed(2);//Conversion rate for $/hr to $/minute;
        }
        let key = e.target.getAttribute("placeholder");
        this.TimeSheetData.current[key] = e.target.value;
    };

    handleBillLineDelete(row_index)
    {
        let db_field = 'num_minutes'
        let total_time_element = document.querySelector('input[placeholder="total_time"]');
        let total_bill_element = document.querySelector('input[placeholder="total_bill"]');
        let bill_rate_element = document.querySelector('input[placeholder="bill_rate"]');
        total_time_element.value = (parseFloat(total_time_element.value) - this.BillingLineData.current[row_index][db_field]).toFixed(2);
        total_bill_element.value = (parseFloat(total_time_element.value) *  parseFloat(bill_rate_element.value)/ 60.0).toFixed(2);
    };

    handleBillLineInputs(e, calculate = false)
    {

        let row_index = getParentIntAttrib(e,'placeholder',2)
        let db_field = e.target.getAttribute("db");
        if(!this.BillingLineData.current[row_index])
        {
            this.BillingLineData.current[row_index] = {};
        };

        if (!calculate)
        {
            this.BillingLineData.current[row_index][db_field] = e.target.value;
            return;
        }

        let total_time_element = document.querySelector('input[placeholder="total_time"]');
        let total_bill_element = document.querySelector('input[placeholder="total_bill"]');
        let bill_rate_element = document.querySelector('input[placeholder="bill_rate"]');

        if (db_field === 'num_minutes' && (e.target.value === '' || !/^(\d+)(\.\d*)?$/.test(e.target.value)))
        {

            total_time_element.value = (parseFloat(total_time_element.value) - this.BillingLineData.current[row_index][db_field]).toFixed(2);
            total_bill_element.value = (parseFloat(total_time_element.value) *  parseFloat(bill_rate_element.value)/ 60.0).toFixed(2);
            this.BillingLineData.current[row_index][db_field] = 0.00;
            return;
        };
        if(db_field === 'num_minutes' && /^(\d+)(\.\d*)?$/.test(e.target.value))
        {
            let parsed_val = parseFloat(e.target.value);
            total_time_element.value = (parseFloat(total_time_element.value)  - this.BillingLineData.current[row_index][db_field] + parsed_val).toFixed(2);
            total_bill_element.value = (parseFloat(total_time_element.value) *  parseFloat(bill_rate_element.value)/ 60.0).toFixed(2);
            this.BillingLineData.current[row_index][db_field] = parsed_val.toFixed(2);
            return;
        };
    };
}

class Data
{
    processNewData(data)
    {
        this.TimeSheetData.current['id'] = data['TimeSheetData'].id;
        for(let i = 0; i < data["LineItemsData"].length; i++)
        {
            this.BillingLineData.current[i]["id"] = data["LineItemsData"][i].id;
        };
    };

    async putData()
    {
        let data = await fetcherModify("PUT",{"TimeSheetData":this.TimeSheetData.current,"LineItemsData":this.BillingLineData.current},this.props.endpoint);
        if(data['Error'])
        {
            alert(data['Error'])
            this.setState({"SubmissionTime":"Failed"});
            return;
        };
        if(data['detail'])
        {
            alert(data['detail'])
            this.setState({"SubmissionTime":"Failed"});
            return;
        };
        let del_str = processDelData(data.DeletedLineItems, '\nDeleted: Timesheet Entries ');
        this.TimeSheetData.current['id'] = data['TimeSheetData'].id;
        this.processNewData(data);
        this.freezeTimesheet('Updated',`Updated: Timesheet Entry ${data['TimeSheetData'].id}${del_str}`);
    };

    async postData()
    {
        let data = await fetcherModify("POST",{"TimeSheetData":this.TimeSheetData.current,"LineItemsData":this.BillingLineData.current},this.props.endpoint);
        if(data['Error'])
        {
            alert(data['Error'])
            this.setState({"SubmissionTime":"Failed"});
            return;
        };
        if(data['detail'])
        {
            alert(data['detail'])
            this.setState({"SubmissionTime":"Failed"});
            return;
        };
        this.processNewData(data);
        this.freezeTimesheet("Created", `Created: Timesheet Entry ${data['TimeSheetData'].id}`);
    }
}

class DOM
{
    freezeTimesheet(time_label = '', custom = null)
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
        this.setState({"TextDisabled":true});
        this.setState({"SubmissionTime":`${time_label} ${new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})}`});
    };

    unfreezeTimesheet()
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
        this.setState({"TextDisabled":false});
        this.setState({"ModeLabel":"Update"});
        this.setState({"SubmissionTime":"Pending Update"});
    };
}

export default class TimesheetCreateCore extends Component
{
    constructor(props)
    {
        super(props);
        this.__proto__ = Extender(this.__proto__, [DOM, Events, Data]);
    }
}

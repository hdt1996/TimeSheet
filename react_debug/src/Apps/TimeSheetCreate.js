import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateRangeIcon from '@mui/icons-material/DateRange';
import TextField from "@mui/material/TextField";
import PostForm from '../Components/PostForm';
import {buildDateTimeStr, alternativeBoolState, buildCalendarStr} from '../Utilities/Utils';
import TimesheetCreateCore from '../Core/TimeSheetCreate';

export default class TimeSheetCreate extends TimesheetCreateCore
{
    constructor(props)
    {
        super(props);
        this.PostFormConfig= //For line items
        {
            num_rows:1,
            col_map:
            {
                'num_minutes':'Minutes Worked',
                'memo':'Memo'
            },
        };
    
        this.BillingLineData=React.createRef();
        this.TimeSheetData=React.createRef();
        this.BillingLineData.current = [{"id":null,"num_minutes":null,"memo":null}];
        this.TimeSheetData.current = {'date':buildDateTimeStr(new Date())};
        this.state = 
        {
            CurrentDate: buildCalendarStr(new Date()),
            SubmissionTime: "Pending",
            ActiveCalendar: false,
            ModeLabel:"Create",
            TextDisabled: false
        }
    };

    componentDidMount()
    {
        if(this.props.CurrentData)
        {   
            this.setState({"ModeLabel":"Update"});
            let current_data = JSON.parse(JSON.stringify(this.props.CurrentData));
            let line_item_data = [...current_data['nestedData']];
            delete current_data['nestedData'];
            current_data['employee'] = current_data['employee'].id;
            this.BillingLineData.current = [];
            for(let i = 0; i < line_item_data.length; i++)
            {
                line_item_data[i]['timesheet'] = line_item_data[i]['timesheet'].id;
                for(let f of ['date_added','date_modified'])
                {
                    delete line_item_data[i][f];
                }
                this.BillingLineData.current.push(line_item_data[i]);
            };
            this.TimeSheetData.current = current_data;
        }
        else if (this.props.UserData  && this.props.UserData.Success) // Non existent timesheet but logged in
        {
            console.log(this.props.UserData)
            this.TimeSheetData.current['employee'] = this.props.UserData.Success.employee.id;
        };
    }

    render()
    {
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
                        value={this.props.CurrentData?"Exists":"New"}
                        disabled = {true}
                        className={"locked"}
                    />
                    <div className= "posrel disflxrow" >
                        <TextField
                            placeholder={this.state.CurrentDate}
                            disabled = {true}
                            className={`flx1 ${this.state.TextDisabled?"locked":"bkwhite plchldopac1"}`}
                        />
                        <DateRangeIcon className = "posabs ctr-right" onClick ={() => {alternativeBoolState(this.state.ActiveCalendar,(value) => this.setState({"ActiveCalendar":value}))}} ></DateRangeIcon>
                        <div className={this.state.TextDisabled?"locked":""}>
                        {
                            this.state.ActiveCalendar?
                            <DatePicker     
                                value={this.state.CurrentDate} 
                                disabledKeyboardNavigation
                                placeholderText="mm/dd/yyyy" 
                                format = 'yyyy-MM-dd' 
                                onChange = {(e) => this.handleDateChange((e))} 
                                className = "posabsz2 bkwhite ">

                            </DatePicker>:null
                        } 
                        </div>
                    </div>
                    <TextField
                        label="Employee ID"
                        placeholder="employee"
                        value={this.handleEmployeeIDValue()}
                        onChange={(e)=>{this.handleTimeSheetInputs(e)}}
                        disabled = {this.handleEmployeeIDInputStatus()}
                        className={this.state.TextDisabled?"locked txtright":"bkwhite txtright"}
                    />
                    <TextField
                        label="Billing Rate (Hourly)"
                        placeholder="bill_rate"
                        defaultValue={this.props.CurrentData?this.props.CurrentData.bill_rate:0}
                        onChange={(e)=>{this.handleTimeSheetInputs(e, true)}}
                        disabled = {this.state.TextDisabled}
                        className={this.state.TextDisabled?"locked txtright":"bkwhite txtright"}
                    />
                    <TextField
                        label="Total Time (Minutes)"
                        placeholder="total_time"
                        defaultValue={this.props.CurrentData?this.props.CurrentData.total_time:0}
                        disabled = {true}
                        className={this.state.TextDisabled?"locked txtright":"bkwhite txtright"}
                    />
                    <TextField
                        label="Total Bill"
                        placeholder="total_bill"
                        defaultValue={this.props.CurrentData?this.props.CurrentData.total_bill:0}
                        disabled = {true}
                        className={this.state.TextDisabled?"locked txtright":"bkwhite txtright"}
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
                        onChange={(e)=> {this.handleTimeSheetInputs(e)}}
                        disabled = {this.state.TextDisabled}
                        className={this.state.TextDisabled?"locked":"bkwhite"}
                    />
                </div>
            </div>
            <div className="mxht2p5e mnht2p5e bktitleclr2 disflxrctr flx1 fntsz1p5e fntbld">
                Billing Line Items
            </div>
            <div className="bkbodyclr1 flx1 disflxrow" id = "Form">
                <PostForm BillingLineData = {this.BillingLineData} inputChange = {(e, calc) => this.handleBillLineInputs(e,calc)} deleteChange = {(e) => this.handleBillLineDelete} config={this.PostFormConfig} CurrentData={this.props.CurrentData?this.props.CurrentData['nestedData']:null}></PostForm>
            </div>
            <div className="flx1 mxht3e disflxrow">
                <div className="disflxcol flx1 mxwd25e bkrowclr2 brdblrp5e ">
                    <div className = "flx1 Footer-Row disflxrctr posrel fntbld brdblkp125e brdradiusp5e bkbtnclr1">
                        <div className = "disflxrctr brdradiusp5e flx1">Status:</div> 
                        <div className = "disflxrctr brdradiusp5e flx4">{this.state.SubmissionTime}</div>
                    </div>
                </div>
                <div className="ht100pct disflxrow flxrowend flx1 brdbrrp5e bkrowclr2">
                    {
                        this.state.TextDisabled?
                        <button className="ht100pct bkbtnclr1 brdradiusp5e brdblkp125e fntsz1p25e hovcursor hovclr2 pdh1e" onClick={() => {window.location.reload()}}>Add New</button>
                        :
                        <button className="ht100pct bkbtnclr1 brdradiusp5e brdblkp125e fntsz1p25e hovcursor hovclr2 pdh1e pdh1e"
                            onClick=
                            {
                                this.state.ModeLabel==="Create"?
                                ()=> {this.postData()}
                                :
                                this.state.ModeLabel==="Update"?
                                ()=> {this.putData()}
                                :
                                null
                            }
                        >
                            {this.state.ModeLabel}
                        </button>
                    }
                    {
                        this.state.TextDisabled?
                        <button className = "ht100pct bkbtnclr1 brdradiusp5e brdblkp125e fntsz1p25e hovcursor hovclr2 pdh1e mrgnlft1e" onClick = {() => {this.unfreezeTimesheet()}}>Update Current</button>
                        :
                        null
                    }
                </div>
            </div>
        </div>
    )}
}

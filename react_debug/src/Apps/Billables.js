import React, { useState, useEffect} from 'react';
import Table from '../Components/Table';
import Query from '../Components/Query';
import TextField from "@mui/material/TextField";
function Billables()
{
    let [TblConfig,setTblConfig]=useState(
    {
        num_rows:2,
        num_cols:8,
        col_titles:['id','description','bill_rate','total_time','total_bill','employee_id'], 
        db_columns:['id','description','bill_rate','total_time','total_bill','employee_id'],
        values:[],
        col_width:120
    });

    useEffect(()=>
    {
        console.log(TblConfig["values"]);
    },[TblConfig]);

    return ( //First map is column titles; Second map is for data rows/columns
    <div id="Billables">
        <div className="App-Home-Title">
            Billable Timesheet
        </div>
        <div id= "row">
            <div className="Billables-Column">
                <TextField
                    label="Employee_ID"
                    placeholder="Enter your employee ID"
                    margin="normal"
                />
                <TextField
                    label="Billing Rate"
                    placeholder="Enter billing rate per hour..."
                    margin="normal"
                />
                <TextField
                    label="Total Time"
                    placeholder="Total time to be calculated..."
                    margin="normal"
                />
                <TextField
                    label="Total Bill"
                    placeholder="Total bill to be calculated..."
                    margin="normal"
                />
            </div>

            <div className='Billables-Description'>
                <TextField
                    multiline
                    fullWidth
                    minRows={12}
                    margin="normal"
                    label="Description"
                    placeholder="Enter description of what you have worked on..."
                />
            </div>
        </div>

        <Query config={TblConfig} setConfig={setTblConfig}></Query>
        <div className="Comp-Table">
            <Table config={TblConfig}></Table>
        </div>
    </div>
    );
}
  
export default Billables;
  
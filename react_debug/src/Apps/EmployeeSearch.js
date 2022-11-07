import React, { useState, useEffect} from 'react';
import Table from '../Components/Table';
import Query from '../Components/Query';
function EmployeeSearch({endpoint})
{
    let [TblConfig,setTblConfig]=useState(
    {
        num_rows:2,
        num_cols:8,
        col_titles:['Emp_ID','Name','Department','Hourly?','Pay Rate','Photo','Onboard Docs','User_ID'], 
        db_columns:['id','name','department','hourly','pay_rate','photo','onboard_docs','user_id'],
        values:[],
        col_width:150,
        start_query:{"id":{"operator":null,"value":null}},
        endpoint:endpoint,
        extract_config:{},
        DetailTblConfig:{},
    });

    useEffect(()=>
    {

    },[TblConfig]);

    return ( //First map is column titles; Second map is for data rows/columns
    <div id="EmpMgmt">
        <div className="App-Home-Title">
        Admin Employee Management
        </div>
        <div className="Comp-Table">
            <Table config={TblConfig} setConfig={setTblConfig} nestedTblIndex = {0}></Table>
        </div>
    </div>
    );
}
  
export default EmployeeSearch;
  
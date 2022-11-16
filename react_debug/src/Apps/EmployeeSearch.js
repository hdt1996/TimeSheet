import React, { useState} from 'react';
import Table from '../Components/Table';
import CreateLogin from '../Components/CreateLogin'
import Extractors from '../Utilities/Data';

export default function EmployeeSearch({endpoint, UserData=null})
{
    let [TblConfig,setTblConfig]=useState(
    {
        col_titles:['Emp_ID','Name','Department','Hourly?','Pay Rate','Photo','Onboard Docs','User'], 
        db_columns:['id','name','department','hourly','pay_rate','photo','onboard_docs','user'],
        values:[],
        col_width:150,
        start_query:{"id":{"operator":null,"value":null}},
        endpoint:endpoint,
        extract_config:
        {
            methods:
            {
                'id':Extractors.standard,
                'name':Extractors.standard,
                'department':Extractors.standard,
                'hourly':Extractors.standard,
                'pay_rate':Extractors.numerical_2dp,
                'photo':Extractors.standard,
                'onboard_docs':Extractors.standard,
                'user':Extractors.foreignKey,
                'username':Extractors.standard
            },
            keys:
            {
                'id':null,
                'name':null,
                'department':null,
                'hourly':null,
                'pay_rate':null,
                'photo':null,
                'onboard_docs':null,
                'user':['id','username','first_name','last_name'],
                'username':null
            }
        },
        AddComponent:<CreateLogin endpoint = {endpoint}/>,
        EditComponent:null,
        DetailTblConfig:{},
    });

    return ( //First map is column titles; Second map is for data rows/columns
    <div className="App-Table">
        <div className="App-Title">
        Admin Employee Management
        </div>
        <div className="Comp-Table">
            <Table config={TblConfig} nestedTblIndex = {0}></Table>
        </div>
    </div>
    );
};
  
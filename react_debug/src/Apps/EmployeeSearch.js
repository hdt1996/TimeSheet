import React, { useState} from 'react';
import Table from '../Components/Table';
import CreateLogin from '../Components/CreateLogin'
import Extractors from '../Utilities/Data';

export default function EmployeeSearch({endpoint, UserData=null})
{
    let [TblConfig,setTblConfig]=useState(
    {
        col_map:
        {
            'id':'Emp_ID',
            'name':'Name',
            'department':'Department',
            'hourly':'Hourly',
            'pay_rate':'Pay Rate',
            'photo':'Photo',
            'onboard_docs':'Onboard Docs',
            'user':'User'
        },
        uneditable:
        {
            'id':true
        },
        edit_config:null,
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
            }
        },
        AddComponent:CreateLogin,
        EditComponent:null,
        add_endpoint:null,
        DetailTblConfig:{},
    });

    return (
    <div className="App-Table">
        <div className="App-Title">
        Admin Employee Management
        </div>
        <div className="Comp-Table">
            <Table config={TblConfig} nestedTblIndex = {0} UserData = {UserData}></Table>
        </div>
    </div>
    );
};
  
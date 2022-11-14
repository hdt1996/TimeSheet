import React, { useState, useEffect} from 'react';
import Table from '../Components/Table';
import CreateLogin from '../Components/CreateLogin'

class Extractors
{
    static foreignKey(keys,source)
    {
        let extracted = [];
        for(let i = 0; i < keys.length; i++)
        {
            extracted.push(source[keys[i]]);
        };
        extracted = extracted.join(' - ');
        return extracted;
    };

    static standard(keys,source) //keys is only one
    {
        return source;
    };
    static numerical_2dp(keys,source) //keys is only one
    {
        return source.toFixed(2);
    };
    static strfDate(keys,source)
    {
        return source.replace(/(T.*)/,'')
    };
};


function EmployeeSearch({endpoint, UserData=null})
{
    let [TblConfig,setTblConfig]=useState(
    {
        num_rows:2,
        num_cols:8,
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
                'pay_rate':Extractors.standard,
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

    useEffect(() =>
    {
        let currentTblConfig = {...TblConfig};
        setTblConfig(currentTblConfig);
    },[UserData])

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
  
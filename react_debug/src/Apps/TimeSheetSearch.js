import React, { useState, useEffect,useRef} from 'react';
import Table from '../Components/Table';
import TimeSheetCreate from './TimeSheetCreate';


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

function TimeSheetSearch({endpoint, UserData = null})
{
    let [TblConfig,setTblConfig]=useState(
    {
        num_rows:5,
        num_cols:6,
        col_titles:['Timesheet ID','Date Worked','Description','Billing Rate','Total Time','Total Bill','Employee'], 
        db_columns:['id','date','description','bill_rate','total_time','total_bill','employee'],
        values:[],
        col_width:150,
        endpoint:endpoint, //First level table does
        start_query:{"id":{"operator":null,"value":null}},
        extract_config:
        {
            methods:
            {
                'id':Extractors.standard,
                'date':Extractors.strfDate,
                'description':Extractors.standard,
                'bill_rate':Extractors.numerical_2dp,
                'total_time':Extractors.numerical_2dp,
                'total_bill':Extractors.numerical_2dp,
                'employee':Extractors.foreignKey
            },
            keys:
            {
                'id':null,
                'date':null,
                'description':null,
                'bill_rate':null,
                'total_time':null,
                'total_bill':null,
                'employee':['id','name']
            }
        },
        AddComponent:<TimeSheetCreate endpoint = {endpoint} UserData={UserData}/>,
        EditComponent:null,
        DetailTblConfig:
        {
            num_rows:5,
            num_cols:6,
            col_titles:['id','num_minutes','memo','date_added','date_modified','timesheet'], 
            db_columns:['id','num_minutes','memo','date_added','date_modified','timesheet'],
            values:[],
            col_width:150,
            endpoint:"/api/payroll/timesheet/lineitems/",
            start_query:{"id":{"operator":null,"value":null}},
            extract_config:
            {
                methods:
                {
                    'id':Extractors.standard,
                    'num_minutes':Extractors.standard,
                    'memo':Extractors.standard,
                    'date_added':Extractors.strfDate,
                    'date_modified':Extractors.strfDate,
                    'timesheet':Extractors.foreignKey
                },
                keys:
                {
                    'id':null,
                    'num_minutes':null,
                    'memo':null,
                    'date_added':null,
                    'date_modified':null,
                    'timesheet':['id']
                }
            },
            AddComponent:null,
            EditComponent:null,
            DetailTblConfig:{},
        }
    });

    useEffect(() =>
    {
        let currentTblConfig = {...TblConfig};
        currentTblConfig.AddComponent = <TimeSheetCreate endpoint = {endpoint} UserData={UserData}/>
        setTblConfig(currentTblConfig);
    },[UserData])

    return ( //First map is column titles; Second map is for data rows/columns
    <div id="EmpMgmt">
        <div className="App-Home-Title">
            Timesheets Reporting
        </div>
        <Table config={TblConfig} setConfig={setTblConfig} nestedTblIndex = {0}></Table>
    </div>
    );
}
  
export default TimeSheetSearch;
  
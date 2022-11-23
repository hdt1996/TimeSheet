import React, { useState, useEffect} from 'react';
import Extractors from '../Utilities/Data';
import Table from '../Components/Table';
import TimeSheetCreate from './TimeSheetCreate';

export default function TimeSheetSearch({endpoint, UserData = null})
{
    let [TblConfig,setTblConfig]=useState(
    {
        col_map:
        {
            'id':'Timesheet',
            'date':'Date Worked',
            'description':'Description',
            'bill_rate':'Billing Rate',
            'total_time':'Total Time',
            'total_bill':'Total Bill',
            'employee':'Employee'
        },
        uneditable:
        {
            'id':true,
            'total_time':true,
            'total_bill':true,
            'employee':true
        },
        edit_config:
        {
            "active":"TimeSheetData",
            "data":
            {
                "TimeSheetData":{},
                "LineItemsData":[]
            }
        },
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
        add_endpoint:endpoint,
        AddComponent:TimeSheetCreate,
        DetailTblConfig:
        {
            col_map:
            {
                'id':'id',
                'num_minutes':'num_minutes',
                'memo':'memo',
                'date_added':'date_added',
                'date_modified':'date_modified',
                'timesheet':'timesheet'
            },
            uneditable:
            {
                'id':true,
                'date_added':true,
                'date_modified':true
            },
            edit_config:
            {
                "active":"LineItemsData",
                "data":
                {
                    "LineItemsData":{}
                }
            },
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
            AddComponent:TimeSheetCreate,
            add_endpoint:endpoint,
            DetailTblConfig:{},
        }
    });

    return (
    <div className="App-Table">
        <div className="mxht2p5e bktitleclr1 disflxrctr flx1 fntsz1p5e fntbld">
            Timesheets Reporting
        </div>
        <Table config={TblConfig} nestedTblIndex = {0} UserData = {UserData}></Table>
    </div>
    );
}
  
  
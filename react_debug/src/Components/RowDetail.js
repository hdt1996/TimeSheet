import { Form } from 'react-bootstrap'
import React, { useState, useEffect} from "react";
import Endpoints from '../Utilities/Endpoints';
function RowDetail({RowEntryID, detail_endpoint}) {
    let [RowData, setRowData] = useState([]);
    async function getRowDetail()
    {
        const requestOptions={
            method: 'GET',
            headers:{'Content-Type': 'application/json','X-CSRFToken': getToken('csrftoken'), 'selectors':JSON.stringify({id:RowEntryID})}
        };
        let response = await fetch(`${Endpoints.domain}${detail_endpoint}`, requestOptions);
        let data = await response.json();
        setRowData(data);
    }

    useEffect(()=>
    {
        getRowDetail();
    },[])

    return (
        <div className = "Comp-RowDetail">
            <div className ="Label"> My Detail</div>
            {
                RowData.map((line_item, lindex)=>
                {
                    let fields = Object.keys(line_item);
                    return(
                        <div key = {lindex} className="RowItem">
                            {
                                fields.map((field, findex)=>
                                {
                                    return (
                                        <div key={findex}>
                                            <span>{field}</span>
                                            <li>{line_item[field]}</li>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
                })
            }
        </div>
    );
  }
  
  export default RowDetail;
  
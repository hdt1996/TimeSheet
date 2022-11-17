import React, { useState, useEffect} from "react";
import {fetcherSelect} from '../Utilities/Endpoints';

function RowDetail({RowEntryID, detail_endpoint}) {
    let [RowData, setRowData] = useState([]);
    async function getRowDetail()
    {
        let data = await fetcherSelect('GET',{id:RowEntryID}, detail_endpoint);
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
  
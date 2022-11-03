import React, { useState, useEffect} from 'react';
import Fetcher from '../Utilities/Fetcher';
function Query({
    config=
    {
        num_rows:2,
        num_cols:3,
        col_titles:['Column1','Column2','Column3'], 
        db_columns:['DBColumn1','DBColumn2','DBColumn3'],
        values:[{Column1:0,Column2:1,Column3:2},{Column1:0,Column2:1,Column3:2}],
        col_width:150
    },
    setConfig
    })
    {

    let num_cols = config['num_cols'];
    let col_titles = config['col_titles'];
    let db_columns = config['db_columns'];
    if(col_titles){num_cols = col_titles.length};
    let col_width = config['col_width'];
    let columns=[];
    for(let i = 0; i < num_cols; i++)
    {
        columns.push(i);
    };

    let [QueryOptions,setQueryOptions] = useState({});  // Will be updated when input boxes are updated onChange

    const operator_map = // I could have used Django's direct ORM statements as value, but I think it is better to abstract/hide the back-end arguments
    {
        '=':'equal',
        '>':'greater',
        '>=':'greater-equal',
        '<':'lesser',
        '<=':'lesser-equal',
        '^':'startswith',
        'ctn':'contains',
        'in':'in'
    };

    function handleQueryChange(e, field, key)
    {   
        let dict = JSON.parse(JSON.stringify(QueryOptions)); //Deep Copy so useEffect triggers for debugging
        if(e.target.value in operator_map)
        {
            dict[field][key]=operator_map[e.target.value]
        }
        else
        {
            dict[field][key]=e.target.value;
        }
        setQueryOptions(dict);
    };

    async function getQuery()
    {
        const requestOptions={
            method: 'GET',
            headers:{'Content-Type': 'application/json','selectors':JSON.stringify(QueryOptions)}
        };

        let response = await fetch(`${Fetcher.domain}/payroll/api/emp_mgmt`, requestOptions);
        let data = await response.json();
        let curr_config = JSON.parse(JSON.stringify(config));
        curr_config["values"]=data;
        setConfig(curr_config);
    };


    useEffect(()=>
    {
        //console.log(QueryOptions);
    },[QueryOptions]);

    useEffect(()=>
    {
        if(Object.keys(QueryOptions).length === 0)
        {
            let emptyQueryOptions = {};
            for(let i = 0; i < num_cols; i++)
            {
                columns.push(i);
                emptyQueryOptions[db_columns[i]]={operator:null,value:null};
            };
            setQueryOptions(JSON.parse(JSON.stringify(emptyQueryOptions)));
        };
    },[]);


    return ( //First map is column titles; Second map is for data rows/columns
        <div className="Comp-Query">
            <button id="Filter" onClick = {() =>getQuery()}>FLTR</button>
            {
                columns.map((col, index)=>
                {
                    let db_col = db_columns[index];
                    return (
                    <div style={{width:`${col_width}px`}} key={index}>
                        <input placeholder = "Enter filter" onChange={(e) => {handleQueryChange(e,db_col,'value')}}></input>
                        <input placeholder = "=" onChange={(e) => {handleQueryChange(e,db_col,'operator')}}></input>
                    </div>
                    )
                })
            }
        </div>
    );
  }
  
  export default Query;
  
import React, { useState, useEffect, useRef} from 'react';
import Endpoints from '../Utilities/Endpoints';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import {getToken} from '../Utilities/Token'
function Query(
    {
        config=
        {
            num_rows:2,
            num_cols:3,
            col_titles:['Column1','Column2','Column3'], 
            db_columns:['DBColumn1','DBColumn2','DBColumn3'],
            values:[{Column1:0,Column2:1,Column3:2},{Column1:0,Column2:1,Column3:2}],
            col_width:150,
            start_query:{},
            endpoint:''
        },
        setConfig,
        nestedTblIndex={"current":0}
    },
){
    let num_cols = config['num_cols'];
    let col_titles = config['col_titles'];
    let db_columns = config['db_columns'];
    if(col_titles){num_cols = col_titles.length};
    let col_width = config['col_width'];
    let start_query = config['start_query'];
    let columns=[];

    for(let i = 0; i < num_cols; i++)
    {
        columns.push(i);
    };

    let QueryOptions = useRef({});  // Will be updated when input boxes are updated onChange

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

    function handleQueryClear(e)
    {
        let currentQueryOptions = QueryOptions.current;
        for(let i = 0; i < num_cols; i++)
        {
            currentQueryOptions[db_columns[i]]={operator:null,value:null};
        };
        let comp_element = e.target.parentNode.parentNode;
        let input_elements = comp_element.querySelectorAll('input');
        for(let inp = 0; inp < input_elements.length; inp++)
        {
            input_elements[inp].value = null;
        };
    };

    function handleOperatorChange(e, field)
    {   
        let dict = QueryOptions.current;
        let operator = e.target.value;
        if(!operator_map[operator])
        {
            return dict[field]['operator']=null;
        };

        let parent = e.target.parentNode;
        let value_element = parent.children[0];

        if(operator in operator_map)
        {
            dict[field]['operator']=operator_map[operator];
        };
        if(operator == 'in')
        {
            try
            {
                JSON.parse(value_element.value);
                value_element.style.backgroundColor = "white";
            }
            catch
            {
                value_element.style.backgroundColor = "red";
            };
            if(value_element.value === '')
            {
                value_element.style.backgroundColor = "white";
            };
            return;
        };
    };

    function handleValueChange(e, field)
    {   
        let value = e.target.value;
        let dict = QueryOptions.current;
        let parent = e.target.parentNode;
        let operator_element = parent.children[1];
        if(operator_element.value !== 'in')
        {
            dict[field]['value']=value;
            return;
        }
        if(operator_element.value === 'in')
        {
            try
            {
                let parsed_val = JSON.parse(value);
                dict[field]['value']=parsed_val;
                e.target.style.backgroundColor = "white";
            }
            catch
            {
                dict[field]['value']=[];
                e.target.style.backgroundColor = "red";
            };
            if(value === '')
            {
                e.target.style.backgroundColor = "white";
            };
        };
    };

    async function getQuery()
    {
        const requestOptions={
            method: 'GET',
            headers:{'Content-Type': 'application/json','X-CSRFToken': getToken('csrftoken'), 'selectors':JSON.stringify(QueryOptions.current)}
        };
        let response = await fetch(`${Endpoints.domain}${config.endpoint}`, requestOptions);
        let data = await response.json();
        if(data['Error'])
        {
            alert(data['Error'])
        }
        else
        {
            let curr_config = {...config};
            curr_config["values"]=data;
            setConfig(curr_config);
        };
    };


    useEffect(()=>
    {
        if(Object.keys(QueryOptions.current).length === 0)
        {
            let emptyQueryOptions = QueryOptions.current;
            for(let i = 0; i < num_cols; i++)
            {
                columns.push(i);
                emptyQueryOptions[db_columns[i]]={operator:null,value:null};
            };
        };
        let start_query_keys = Object.keys(start_query)
        if(start_query_keys.length !== 0)
        {
            let currentQueryOptions = QueryOptions.current;
            let key;
            for(let i = 0; i < start_query_keys.length; i++)
            {
                key = start_query_keys[i];
                currentQueryOptions[key]=start_query[key];
            };
            let activeTable = document.getElementById(`Table-N${nestedTblIndex}`);
            let filter_element = activeTable.querySelector(".Comp-Query #Filter #Button");
            filter_element.click();
        };
    },[]);


    return ( //First map is column titles; Second map is for data rows/columns
        <div className="Comp-Query">
            <div id="Filter">
                <ClearAllIcon onClick={(e) => {handleQueryClear(e)}}></ClearAllIcon>
                <button id="Button" onClick = {() =>getQuery()}>Search</button>
            </div>
            
            {
                columns.map((col, index)=>
                {
                    let db_col = db_columns[index];
                    return (
                    <div style={{width:`${col_width}px`}} key={index}>
                        <input placeholder = "Enter filter" onChange={(e) => {handleValueChange(e,db_col)}}></input>
                        <input placeholder = "____" onChange={(e) => {handleOperatorChange(e,db_col)}}></input>
                    </div>
                    )
                })
            }
        </div>
    );
  }
  
  export default Query;
  

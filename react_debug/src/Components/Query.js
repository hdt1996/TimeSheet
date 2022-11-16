import React, {useEffect, useRef} from 'react';
import {fetcherSelect} from '../Utilities/Endpoints';
import ClearAllIcon from '@mui/icons-material/ClearAll';
function Query(
    {
        config=
        {
            col_titles:['Column1','Column2','Column3'], 
            db_columns:['DBColumn1','DBColumn2','DBColumn3'],
            col_width:150,
            start_query:{},
            endpoint:''
        },
        setTableValues,
        nestedTblIndex={"current":0}
    },
){
    let columns=[];
    for(let i = 0; i < config['col_titles'].length; i++)
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

    function validateQueryValue(operator, field, value_element)
    {
        if(!(operator in operator_map))
        {
            QueryOptions.current[field]['operator']=null;
            QueryOptions.current[field]['value']=null;
            return;
        };

        QueryOptions.current[field]['operator']=operator_map[operator];
        if(operator === 'in')
        {
            try
            {
                let parsed_val = JSON.parse(`[${value_element.value}]`);
                QueryOptions.current[field]['value']=parsed_val;
                value_element.style.backgroundColor = "white";
            }
            catch
            {
                QueryOptions.current[field]['value']=[];
                value_element.style.backgroundColor = "red";
            };
            return;
        };
        value_element.style.backgroundColor = "white";
        QueryOptions.current[field]['value']=value_element.value;
    };

    function handleQueryClear(e)
    {
        let currentQueryOptions = QueryOptions.current;
        for(let i = 0; i < config['col_titles'].length; i++)
        {
            currentQueryOptions[config['db_columns'][i]]={operator:null,value:null};
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
        let operator = e.target.value;
        let value_element = e.target.parentNode.children[0];
        validateQueryValue(operator, field, value_element);
    };

    function handleValueChange(e, field)
    {   
        let operator_element = e.target.parentNode.children[1];
        validateQueryValue(operator_element.value,field, e.target);
    };

    async function getQuery()
    {
        let data = await fetcherSelect('GET',QueryOptions.current, config.endpoint);
        if(data['Error'])
        {
            alert(data['Error']);
            return;
        }
        setTableValues(data);
    };

    let firstQuery = useRef(false);

    useEffect(()=>
    {
        if(Object.keys(QueryOptions.current).length === 0)
        {
            let emptyQueryOptions = QueryOptions.current;
            for(let i = 0; i < config['col_titles'].length; i++)
            {
                emptyQueryOptions[config['db_columns'][i]]={operator:null,value:null};
            };
        };
        let start_query_keys = Object.keys(config['start_query'])
        if(start_query_keys.length !== 0 && !firstQuery.current)
        {
            let currentQueryOptions = QueryOptions.current;
            let key;
            for(let i = 0; i < start_query_keys.length; i++)
            {
                key = start_query_keys[i];
                currentQueryOptions[key]=config['start_query'][key];
            };
            let activeTable = document.getElementById(`Table-N${nestedTblIndex}`);
            let filter_element = activeTable.querySelector(".Comp-Query .Filter #Button");
            filter_element.click();
            firstQuery.current = true;
        };
    },[config, nestedTblIndex]);


    return ( //First map is column titles; Second map is for data rows/columns
        <div className="Comp-Query">
            <div className="Filter">
                <ClearAllIcon className="Clear" onClick={(e) => {handleQueryClear(e)}}></ClearAllIcon>
                <button id="Button" onClick = {() =>getQuery()}>Search</button>
            </div>
            
            {
                columns.map((col, index)=>
                {
                    let db_col = config['db_columns'][index];
                    return (
                    <div style={{width:`${config['col_width']}px`}} key={index}>
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
  

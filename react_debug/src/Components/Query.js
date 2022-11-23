import React, {useEffect, useState, useRef} from 'react';
import {fetcherSelect} from '../Utilities/Endpoints';
import InfoIcon from '@mui/icons-material/Info';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import {alternativeBoolState} from '../Utilities/Utils'
import HelpIcon from '@mui/icons-material/Help';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
function Query(
    {
        config=
        {
            col_map:{},
            col_width:150,
            start_query:{},
            endpoint:''
        },
        setTableValues,
        nestedTblIndex={"current":0}
    },
){
    let columns=[];
    let col_keys = Object.keys(config['col_map']);
    let [ShowInfo,setShowInfo]= useState(false);
    let [ShowHelp,setShowHelp]= useState(false);

    for(let i = 0; i < col_keys.length; i++)
    {
        columns.push(i);
    };

    let firstQuery = useRef(false);
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
        for(let i = 0; i < col_keys.length; i++)
        {
            currentQueryOptions[col_keys[i]]={operator:null,value:null};
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

    useEffect(()=>
    {
        if(Object.keys(QueryOptions.current).length === 0)
        {
            let emptyQueryOptions = QueryOptions.current;
            for(let i = 0; i < col_keys.length; i++)
            {
                emptyQueryOptions[col_keys[i]]={operator:null,value:null};
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
    },[config, nestedTblIndex, col_keys]);

    let OpKeys = Object.keys(operator_map)
    return (
        <div className="Comp-Query">
            <div className="Filter">
                <div className="Clear" onClick={(e) => {handleQueryClear(e)}}>CLR</div>
                <button id="Button" onClick = {() =>getQuery()}>Query</button>
            </div>
            {
                columns.map((col, index)=>
                {
                    let db_col = col_keys[index];
                    return (
                    <div style={{width:`${config['col_width']}px`}} key={index}>
                        <input placeholder = "Query Value" onChange={(e) => {handleValueChange(e,db_col)}}></input>
                        <input placeholder = "FLTR" onChange={(e) => {handleOperatorChange(e,db_col)}}></input>
                    </div>
                    )
                })
            }
            <div className = "HelpInfo" style = {{width:`${config['col_width']}px`}}>
                <div className = "Wrapper">
                    <InfoIcon className="z2 hovcursor" onClick = {() => alternativeBoolState(ShowInfo,setShowInfo)}/>
                    <HelpIcon className="z2 hovcursor" onClick = {() => alternativeBoolState(ShowHelp,setShowHelp)}/>
                    {
                        ShowInfo?
                        <>
                        <div className = "disflxcctr HelpText">
                            <div>FLTR Options</div>
                            {
                                OpKeys.map((op, index)=>
                                <Row key = {index} className = "HelpLine">
                                    <Col>{op}</Col>
                                    <Col>{operator_map[op]}</Col>
                                </Row>
                            )}
                            <br></br>
                            <Row>Note: ( in ) option simply needs comma separated values (i.e. 1,2,3...)</Row>
                        </div>
                        <ChatBubbleIcon className = "HelpIcon"></ChatBubbleIcon>
                        </>
                        :null
                    }

                    {
                        ShowHelp?
                        <>
                        <div className = "disflxcol HelpText">
                            <Row className = "HelpLabel">Query Tool (Top-most Row) Information</Row>
                            <li>Click CLR to reset query (Default: SELECT * FROM)</li>
                            <li>Use ( + ) for new entry. Re-query to see update</li>
                            <li>Query Value takes numerical, string, or list</li>
                            <li>FLTR query parameters can be found in ( i )</li>

                            <Row className = "HelpLabel">Edit Button Options (Pencil Icon)</Row>
                            <li>Reset restores row to original values from query</li>
                            <li>Save commits changes (for updating or reverting)</li>
                           
                            <Row className = "HelpLabel">General</Row>
                            <li>Double-click row to expand (Opens subtable)</li>
                            <li>Tick checkboxes next to rows to mark for deletion</li>
                            <li>Cursor over column names for sorting/filtering</li>
                          
                        </div>
                        <ChatBubbleIcon className = "HelpIcon"></ChatBubbleIcon>
                        </>
                        :null
                    }
                </div>
            </div>
        </div>
    );
  }
  
  export default Query;
  

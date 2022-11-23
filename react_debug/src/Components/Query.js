import React, {useEffect, useState, useRef} from 'react';
import {fetcherSelect} from '../Utilities/Endpoints';
import ClearAllIcon from '@mui/icons-material/ClearAll';
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
            <div className = "Help-Me" style = {{width:`${config['col_width']}px`}}>
                <div className = "Wrapper">
                    <InfoIcon onClick = {() => alternativeBoolState(ShowInfo,setShowInfo)}/>
                    <HelpIcon onClick = {() => alternativeBoolState(ShowHelp,setShowHelp)}/>
                    {
                        ShowInfo?
                        <>
                        <div className = "Text">
                            <div>FLTR Options</div>
                            <br></br>
                            {
                                OpKeys.map((op, index)=>
                                <Row key = {index} className = "Col">
                                    <Col>{op}</Col>
                                    <Col>{operator_map[op]}</Col>
                                </Row>
                            )}

                        </div>
                        <ChatBubbleIcon className = "Icon"></ChatBubbleIcon>
                        </>
                        :null
                    }

                    {
                        ShowHelp?
                        <>
                        <div className = "Text">

                            <Row>
                                Query Tool
                            </Row>
                            <Row>
                                <li>
                                    Click CLR to reset query
                                </li>
                            </Row>
                            <Row>
                                <li>
                                    Click + to add new entry
                                </li>
                            </Row>
                            <Row>
                                Table Editing
                            </Row>
                            <Row>
                                <li>
                                    Reset undoes changes
                                </li>
                            </Row>
                            <Row>
                                <li>
                                    Save commits changes
                                </li>
                            </Row>
                            <Row>
                                General
                            </Row>
                            <Row>
                                <li>
                                    Double-click row to expand
                                </li>
                            </Row>
                            <Row>
                                <li>
                                    Tick row(s) to mark deletion
                                </li>
                            </Row>
                            <Row>----------------------------</Row>
                            <Row>
                                <p>
                                    Hover over column labels
                                    for more options
                                </p>
                            </Row>
                        </div>
                        <ChatBubbleIcon className = "Icon"></ChatBubbleIcon>
                        </>
                        
                        :null
                    }

                </div>
            </div>

            <div className = "Help-Me" style = {{width:`${config['col_width']}px`}}>
                <div className = "Wrapper" >

                </div>
            </div>
        </div>
    );
  }
  
  export default Query;
  

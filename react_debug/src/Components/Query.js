import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import {alternativeBoolState} from '../Utilities/Utils'
import HelpIcon from '@mui/icons-material/Help';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {Query as QueryCore} from '../Core/Query';

export default class Query extends QueryCore
{
    constructor(props)
    {
        super(props);
        this.config=props.config;
        /*{
            col_map:{},
            col_width:150,
            start_query:{},
            endpoint:''
        }*/
        this.operator_map = //I could have used Django's direct ORM statements as value, but I think it is better to abstract/hide the back-end arguments
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
        this.setTableValues=props.setTableValues;
        this.nestedTblIndex=props.nestedTblIndex;
        this.firstQuery = React.createRef();
        this.firstQuery.current = false;
        this.QueryOptions = React.createRef();
        this.QueryOptions.current = {}; // Will be updated when input boxes are updated onChange

        this.columns = [];
        this.col_keys = Object.keys(props.config['col_map']);
        this.OpKeys = Object.keys(this.operator_map)
        this.state = 
        {
            ShowInfo:false,
            ShowHelp:false
        };

        for(let i = 0; i < this.col_keys.length; i++)
        {
            this.columns.push(i);
        };
    }

    componentDidMount()
    {
        let currentQueryOptions = this.QueryOptions.current;
        if(Object.keys(currentQueryOptions).length === 0)
        {
            for(let i = 0; i < this.col_keys.length; i++)
            {
                currentQueryOptions[this.col_keys[i]]={operator:null,value:null};
            };
        };
        let start_query_keys = Object.keys(this.config['start_query']);
        if(start_query_keys.length !== 0 && !this.firstQuery.current)
        {
            let key;
            for(let i = 0; i < start_query_keys.length; i++)
            {
                key = start_query_keys[i];
                currentQueryOptions[key]=this.config['start_query'][key];
            };
            let activeTable = document.getElementById(`Table-N${this.nestedTblIndex}`);
            let filter_element = activeTable.querySelector("#query");
            filter_element.click();
            this.firstQuery.current = true;
        };
    };
   
    render()
    {
        return(
            <div className="Comp-Query">
            <div className="Filter">
                <div className="Clear" onClick={(e) => {this.handleQueryClear(e)}}>CLR</div>
                <button id="query" onClick = {() =>this.getQuery()}>Query</button>
            </div>
            {
                this.columns.map((col, index)=>
                {
                    let db_col = this.col_keys[index];
                    return (
                    <div style={{width:`${this.config['col_width']}px`}} key={index}>
                        <input placeholder = "Query Value" onChange={(e) => {this.handleValueChange(e,db_col)}}></input>
                        <input placeholder = "FLTR" onChange={(e) => {this.handleOperatorChange(e,db_col)}}></input>
                    </div>
                    )
                })
            }
            <div className = "HelpInfo" style = {{width:`${this.config['col_width']}px`}}>
                <div className = "Wrapper">
                    <InfoIcon className="z2 hovcursor" onClick = {() => alternativeBoolState(this.state.ShowInfo,(value) => {this.setState({'ShowInfo':value})})}/>
                    <HelpIcon className="z2 hovcursor" onClick = {() => alternativeBoolState(this.state.ShowHelp,(value) => {this.setState({'ShowHelp':value})})}/>
                    {
                        this.state.ShowInfo?
                        <>
                        <div className = "disflxcctr HelpText">
                            <div>FLTR Options</div>
                            {
                                this.OpKeys.map((op, index)=>
                                <Row key = {index} className = "HelpLine">
                                    <Col>{op}</Col>
                                    <Col>{this.operator_map[op]}</Col>
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
                        this.state.ShowHelp?
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
        )
    }
}
  
  

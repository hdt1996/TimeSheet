
import React from 'react';
import {DataGrid} from '@mui/x-data-grid/DataGrid/DataGrid'
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import Query from './Query';
import {Table as TableCore} from '../Core/Table'

export default class Table extends TableCore
{
    constructor(props)
    {
        super(props);
        this.config=props.config;
        this.state = 
        {
            TableGrid:[[],[]],
            ShowRowDetail:false,
            ShowDeleteConfirm:false,
            ShowAddComp:false,
            Selected_IDs:[],
            Editing:{}
        };
        this.DeleteSuccess = React.createRef();
        this.CurrentDetailID = React.createRef();
        this.CurrentEditDetails = React.createRef();
        this.ParentData = React.createRef();
        this.TableValues = React.createRef();
        this.DetailTblConfig = React.createRef();

        this.DetailTblConfig.current = props.config["DetailTblConfig"];
        this.DeleteSuccess.current = false;
        this.CurrentDetailID.current = null;
        this.CurrentEditDetails.current = {};
        this.ParentData.current = null;
        this.TableValues.current = [];
        this.col_keys = Object.keys(props.config['col_map']);
        
        if(!this.config.DetailTblConfig)
        {
            this.handleRowClicked = function(){};
        };
    };

    componentDidUpdate(prevProps, prevState)
    {
        if(this.props.parentData && this.TableValues.current.length > 0) //will become null after next remount
        {
            this.ParentData.current = this.props.parentData;
            this.ParentData.current['nestedData'] = this.TableValues.current;
        };
        if(this.CurrentDetailID.current && !this.state.ShowRowDetail)
        {
            this.setState({"ShowRowDetail":true});
        };
        if(this.DeleteSuccess.current)
        {
            let activeTable = document.getElementById(`Table-N${this.props.nestedTblIndex}`);
            let SelectAllBox = activeTable.querySelector('input[aria-label="Unselect all rows"]');
            let filter_element = activeTable.querySelector("#query");
            filter_element.click();
            this.DeleteSuccess.current = false;
            SelectAllBox.click();
            this.setState({"ShowRowDetail":false})
        };

    };
    shouldComponentUpdate(nextProps, nextState)
    {
        return true;
    };

    render()
    {
        return ( //First map is column titles; Second map is for data rows/columns
        <div id={`Table-N${this.props.nestedTblIndex}`} className={`Comp-Table ${this.props.className}`}>
            <div className="Buttons">
                {
                    this.config.AddComponent !== null?
                    <Add className = "Row-Options" onClick={() => this.handleShowAddComp()} ></Add>
                    :null
                }
                <Delete className = "Row-Options" onClick={() => this.handleConfirmDelete()}></Delete>
                {
                    this.state.ShowDeleteConfirm?
                    <div className="Confirm">
                        <span><strong>Confirm Deletion?</strong></span>
                        <div>
                            <button onClick = {() => this.handleSelectedDelete()}>Yes</button>
                            <button onClick={()=>this.setState({"ShowDeleteConfirm":false})} >No</button>
                        </div>
                    </div>:
                    null
                }
                {
                    this.state.ShowAddComp?
                    <div className="AddComponent">
                        <CloseIcon className="Close" onClick={() =>this.setState({"ShowAddComp":false})}/>
                        <this.config.AddComponent endpoint = {this.config.add_endpoint?this.config.add_endpoint:this.config.endpoint} UserData={this.props.UserData} CurrentData={this.ParentData.current}/>
                    </div>:
                    null
                }
            </div>

            <Query config={this.config} setTableValues={(value) => {this.buildGrid(value)}} nestedTblIndex={this.props.nestedTblIndex}></Query>
            <DataGrid
                rows={this.state.TableGrid[0]}
                columns={this.state.TableGrid[1]}
                checkboxSelection
                onCellKeyDown={(params, events) => events.stopPropagation()}
                editMode='row'
                rowBuffer={100}
                pageSize={100}
                onRowDoubleClick={(e) => {this.handleRowClicked(e)}}
                onSelectionModelChange={(id) => this.setState({"Selected_IDs":id})}
                sx={{
                    "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                       outline: "none !important",
                    },
                 }}
                disableSelectionOnClick
            />
            {
                this.state.ShowRowDetail && this.DetailTblConfig.current?
                <Table className="Nested-Table" config={this.DetailTblConfig.current} nestedTblIndex={this.props.nestedTblIndex+1} parentData = {this.CurrentEditDetails.current}></Table>
                :null
            }
        </div>
        )
    };
};


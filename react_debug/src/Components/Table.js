
import React, {useState,useEffect, useRef} from 'react';
import {DataGrid} from '@mui/x-data-grid/DataGrid/DataGrid'
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import {fetcherSelect, fetcherModify} from '../Utilities/Endpoints';
import {processDelData} from '../Utilities/Utils';
import Query from './Query';

function Table(
    {
        config=
        {
            col_map: {},
            uneditable:{},
            col_width:150,
            endpoint:"", 
            extract_config:{},
            DetailTblConfig:{},
            start_query:{}
        },
        className="",
        nestedTblIndex = 0
    }
){
    let [ShowRowDetail,setShowRowDetail] = useState(false);
    let [DetailTblConfig,setDetailTblConfig]=useState(config.DetailTblConfig);
    let [ShowDeleteConfirm, setShowDeleteConfirm] = useState(false);
    let [ShowAddComp, setShowAddComp] = useState(false);
    let [Selected_IDs,setSelected_IDs] = useState([]);
    let SelectedRows = useRef([]);
    let DeleteSuccess = useRef(false);
    let CurrentDetailID = useRef(null);
    let CurrentEditDetails = useRef({});
    let [Editing,setEditing] = useState({});
    let [TableValues, setTableValues] = useState([]);
    let rows=[];
    let columns=[];
    let col_keys = Object.keys(config['col_map']);

    let handleRowClicked = null;
    if(Object.keys(config.DetailTblConfig).length !== 0)
    {
        handleRowClicked = (e) =>
        {
            setShowRowDetail(false);
            if(ShowRowDetail && CurrentDetailID.current === e.row['col1'])
            {
                CurrentDetailID.current = null;
                CurrentEditDetails.current = {};
                return;
            };
            
            let currentDetailTblConfig = {...DetailTblConfig};
            currentDetailTblConfig.start_query={"timesheet":{"operator":"equal","value":e.row['col1'] }};
            setDetailTblConfig(currentDetailTblConfig);
            CurrentDetailID.current = e.row['col1'];
            for(let  i = 0; i < col_keys.length; i++)
            {
                CurrentEditDetails.current[col_keys[i]] = e.row[`col${i+1}`]
            };
        };
    };

    function handleConfirmDelete(){
        if(Selected_IDs.length > 0 && !ShowAddComp)
        {
            setShowDeleteConfirm(true);
        };
    };


    function handleShowAddComp(){
        if(!ShowDeleteConfirm)
        {
            setShowAddComp(true);
        };
    };

    async function handleSelectedDelete(ids)
    {
        let data = await fetcherSelect('DELETE',{'id':{'value':Selected_IDs}}, config.endpoint);
        if(data['Error'])
        {
            alert(data['Error']);
            return;
        };
        alert(processDelData(data, 'Deleted Entries: '));
        DeleteSuccess.current=true;
        setShowDeleteConfirm(false);
    };

    function handleEditCell(e)
    {
        let row_element = e.target.parentNode.parentNode.parentNode;
        let currEditing = {...Editing}
        currEditing[row_element.getAttribute('data-id')] = true;
        let inputs = row_element.querySelectorAll('input');
        for(let i = 0; i < inputs.length; i++)
        {
            inputs[i].removeAttribute('disabled');
        };
        setEditing(currEditing);
    };

    function handleEditReset(e)
    {
        let row_element = e.target.parentNode.parentNode.parentNode.parentNode;
        let currEditing = {...Editing}
        delete currEditing[row_element.getAttribute('data-id')];
        let inputs = row_element.querySelectorAll('input');
        for(let i = 0; i < inputs.length; i++)
        {
            inputs[i].value = inputs[i].getAttribute('orig-val');
            inputs[i].setAttribute('disabled',true);
        };
        setEditing(currEditing);
    };

    async function handleEditSave(e)
    {
        let row_element = e.target.parentNode.parentNode.parentNode.parentNode;
        let id = row_element.getAttribute('data-id');
        let inputs = row_element.querySelectorAll('input[db_col]');
        let put_data = {...config['edit_config']['data']};
        let active = config['edit_config']['active'];
        put_data[active]['id'] = id;
        for(let i = 0; i < inputs.length; i++)
        {
            let default_value = inputs[i].getAttribute('orig-val');
            let curr_value = inputs[i].value;
            let db_col = inputs[i].getAttribute('db_col');

            if(curr_value !== '' && curr_value !== default_value)
            {
                put_data[active][db_col] = curr_value;
            }
            else if(config['extract_config']['keys'][db_col] !== null)
            {
                put_data[active][db_col] = default_value.split(" - ")[0];
            }
        };

        let data = await fetcherModify("PUT",put_data,config.endpoint);
        if(data['Error'])
        {
            alert(data['Error']);
            return
        };

        let currEditing = {...Editing};
        delete currEditing[row_element.getAttribute('data-id')];
        for(let i = 0; i < inputs.length; i++)
        {
            let db_col = inputs[i].getAttribute('db_col');
            let key = config['extract_config'].keys[db_col];
            let source = data[active][db_col];
            inputs[i].value = config['extract_config'].methods[db_col](key,source);
            inputs[i].setAttribute('orig-val',inputs[i].value);
            inputs[i].setAttribute('disabled',true);
        };
        let uneditables = row_element.querySelectorAll('div[db_col]');
        for(let i = 0; i < uneditables.length; i++)
        {
            let db_col = uneditables[i].getAttribute('db_col');
            let key = config['extract_config'].keys[db_col];
            let source = data[active][db_col];
            uneditables[i].innerHTML = config['extract_config'].methods[db_col](key,source); 
        };
        setEditing(currEditing);

    };
    function addEditCell()
    {
        let data = {};
        data['field'] = `col${col_keys.length + 1}`;
        data['headerName'] = ''
        data['width']=config['col_width'];
        data['renderCell'] = (params) => 
            <div className="Comp-Table-Edit">
            {
                Editing[params.id]?
                <div className = "Options">
                    <button onClick = {(e) => {handleEditSave(e)}}>Save</button>
                    <button onClick = {(e) => {handleEditReset(e)}}>Reset</button>
                </div>:
                <EditIcon onClick = {(e) => handleEditCell(e)}/>
            }
            </div>;
        columns[col_keys.length + 1] = data;
    };

    function buildColumns()
    {
        for(let c = 0; c < col_keys.length; c++)
        {
            let data = {};
            data['field'] = `col${c+1}`;
            data['headerName'] = config['col_map'][col_keys[c]];
            data['width']=config['col_width'];
            if(!(col_keys[c] in config['uneditable']))
            {
                data['renderCell'] = (params) => 
                {
                    return(
                    <input db_col = {col_keys[c]} orig-val = {JSON.stringify(params.value).replace(/"/g,'')} disabled className = "Comp-Table-Input" defaultValue={params.value}></input>
                    )
                };
            }
            else
            {
                data['renderCell'] = (params) => 
                {
                    return(
                    <div db_col = {col_keys[c]}>{params.value}</div>
                    )
                };
            }
            columns[c] = data;
        };
        if(config.edit_config)
        {
            addEditCell();
        };

    };
    if(TableValues.length > 0)
    {
        buildColumns();
    }

    if(Object.keys(config['extract_config']).length !== 0)
    {
        for(let i = 0; i < TableValues.length; i++) //set rows and data
        {
            let data = {};
            let source;
            let field;
            let key;
            data['id']=TableValues[i].id;
            for(let c = 0; c < col_keys.length; c++)
            {
                field=col_keys[c];
                source=TableValues[i][field];
                key = config['extract_config'].keys[field];
                data[`col${c+1}`]=config['extract_config'].methods[field](key,source);
            };
            rows[i]=data;
        };
    };

    useEffect(()=>
    {
        let activeTable = document.getElementById(`Table-N${nestedTblIndex}`);
        SelectedRows.current = activeTable.querySelectorAll('div[aria-selected="true"]')
        if(DeleteSuccess.current && SelectedRows.current.length > 0)
        {
            let SelectAllBox = activeTable.querySelector('input[aria-label="Unselect all rows"]');
            let filter_element = activeTable.querySelector(".Comp-Query .Filter #Button");
            filter_element.click();
            DeleteSuccess.current = false;
            SelectAllBox.click();
            setShowRowDetail(false);
        };
    },[ShowDeleteConfirm, nestedTblIndex]);

    useEffect(() =>
    {
        if(CurrentDetailID.current)
        {
            setShowRowDetail(true);
        };
    },[DetailTblConfig]);

    useEffect(()=>
    {
    },[Editing])

    return ( //First map is column titles; Second map is for data rows/columns
        <div id={`Table-N${nestedTblIndex}`} className={`Comp-Table ${className}`}>
            <div className="Buttons">
                {
                    config.AddComponent !== null?
                    <Add onClick={() => handleShowAddComp()} ></Add>
                    :null
                }
                <Delete onClick={() => handleConfirmDelete()}></Delete>
                {
                    ShowDeleteConfirm?
                    <div className="Confirm">
                        <span><strong>Confirm Deletion?</strong></span>
                        <div>
                            <button onClick = {() => handleSelectedDelete()}>Yes</button>
                            <button onClick={()=>setShowDeleteConfirm(false)} >No</button>
                        </div>
                    </div>:
                    null
                }
                {
                    ShowAddComp?
                    <div className="AddComponent">
                        <CloseIcon className="Close" onClick={() =>{setShowAddComp(false)}}/>
                        {config.AddComponent}
                    </div>:
                    null
                }

            </div>

            <Query config={config} setTableValues={setTableValues} nestedTblIndex={nestedTblIndex}></Query>
            <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
                onCellKeyDown={(params, events) => events.stopPropagation()}
                editMode='row'
                rowBuffer={100}
                pageSize={100}
                onRowDoubleClick={handleRowClicked}
                onSelectionModelChange={(id) =>setSelected_IDs(id)}
                sx={{
                    "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                       outline: "none !important",
                    },
                 }}
                disableSelectionOnClick
            />
            {
                ShowRowDetail && Object.keys(DetailTblConfig).length !== 0?
                <Table className="Nested-Table" config={DetailTblConfig} nestedTblIndex={nestedTblIndex+1} AddComponent={null}></Table>
                :null
            }
        </div>
    );
}

export default Table;

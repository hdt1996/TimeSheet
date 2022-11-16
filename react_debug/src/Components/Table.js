
import React, {useState,useEffect, useRef} from 'react';
import {DataGrid} from '@mui/x-data-grid/DataGrid/DataGrid'
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import {fetcherSelect} from '../Utilities/Endpoints';
import {processDelData} from '../Utilities/Utils';
import Query from './Query';

function Table(
    {
        config=
        {
            col_titles:['Column1','Column2','Column3'], 
            db_columns:['DBColumn1','DBColumn2','DBColumn3'],
            values:[{Column1:0,Column2:1,Column3:2},{Column1:0,Column2:1,Column3:2}],
            col_width:150,
            endpoint:"", 
            extract_config:{},
            DetailTblConfig:{},
            start_query:{}
        },
        className="",
        nestedTblIndex = 0,
        values = [] //useRef instance created from app
    }
){
    let [ShowRowDetail,setShowRowDetail] = useState(false);
    let [DetailTblConfig,setDetailTblConfig]=useState(config.DetailTblConfig);
    let [ShowDeleteConfirm, setShowDeleteConfirm] = useState(false);
    let [ShowAddComp, setShowAddComp] = useState(false);
    let [ShowEditComp, setShowEditComp] = useState(false);
    let [Selected_IDs,setSelected_IDs] = useState([]);
    let SelectedRows = useRef([]);
    let DeleteSuccess = useRef(false);
    let CurrentDetailID = useRef(null);
    let CurrentEditDetails = useRef({});
    let [TableValues, setTableValues] = useState(values);

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
            for(let  i = 0; i < config['db_columns'].length; i++)
            {
                CurrentEditDetails.current[config['db_columns'][i]] = e.row[`col${i+1}`]
            };
        };
    };

    function handleConfirmDelete(){
        if(Selected_IDs.length > 0 && !ShowAddComp && !ShowEditComp)
        {
            setShowDeleteConfirm(true);
        };
    };


    function handleShowAddComp(){
        if(!ShowDeleteConfirm && !ShowEditComp)
        {
            setShowAddComp(true);
        };
    };

    function handleShowEditComp(){
        if(!ShowAddComp && !ShowDeleteConfirm)
        {
            setShowEditComp(true);
        };
    }

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

    let rows=[]; 
    let columns=[];

    for(let c = 0; c < config['col_titles'].length; c++)
    {
        let data = {};
        data['field'] = `col${c+1}`;
        data['headerName'] = config['col_titles'][c];
        data['width']=config['col_width'];
        //data['editable']=true
        //data['renderCell'] = renderDetailsButton
        columns[c] = data;
    };

    if(Object.keys(config['extract_config']).length !== 0)
    {
        for(let i = 0; i < TableValues.length; i++) //set rows and data
        {
            let data = {};
            let source;
            let field;
            data['id']=TableValues[i].id;
            for(let c = 0; c < config['col_titles'].length; c++)
            {
                field=config['db_columns'][c];
                source=TableValues[i][field];
                data[`col${c+1}`]=config['extract_config'].methods[field](config['extract_config'].keys[field],source);
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
        if(ShowEditComp &&  Object.keys(CurrentEditDetails.current).length> 0)
        {
            //TODO
        };

    },[DetailTblConfig, ShowRowDetail, ShowEditComp])

    return ( //First map is column titles; Second map is for data rows/columns
        <div id={`Table-N${nestedTblIndex}`} className={`Comp-Table ${className}`}>
            <div className="Buttons">
                {
                    config.AddComponent !== null?
                    <Add onClick={() => handleShowAddComp()} ></Add>
                    :null
                }
                {
                    config.EditComponent !== null?
                    <EditIcon onClick={() => handleShowEditComp()}></EditIcon>
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
                {
                    ShowEditComp?
                    <div className="AddComponent">
                        <CloseIcon className="Close" onClick={() =>{setShowEditComp(false)}}/>
                        {config.EditComponent}
                    </div>:
                    null
                }

            </div>

            <Query config={config} setTableValues={setTableValues} nestedTblIndex={nestedTblIndex}></Query>
            <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
                editMode='row'
                onRowClick = {handleRowClicked}
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
                <Table className="Nested-Table" config={DetailTblConfig} nestedTblIndex={nestedTblIndex+1} AddComponent={null} EditComponent={EditIcon}></Table>
                :null
            }
        </div>
    );
}

export default Table;

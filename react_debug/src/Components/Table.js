import {DataGrid} from '@mui/x-data-grid'
import React, {useState,useEffect, useRef} from 'react';
import Query from './Query';
import { Delete,Add, ConstructionOutlined, CurrencyYenOutlined } from '@mui/icons-material';
import Fetcher from '../Utilities/Fetcher';
import CloseIcon from '@mui/icons-material/Close';

function Table(
    {
        config=
        {
            num_rows:2,
            num_cols:3,
            col_titles:['Column1','Column2','Column3'], 
            db_columns:['DBColumn1','DBColumn2','DBColumn3'],
            values:[{Column1:0,Column2:1,Column3:2},{Column1:0,Column2:1,Column3:2}],
            col_width:150,
            endpoint:"", 
            extract_config:{},
            DetailTblConfig:{},
            start_query:{}
        },
        setConfig,
        className="",
        nestedTblIndex = 0, //useRef instance created from app
        AddComponent= null
    }
){
    let [ShowRowDetail,setShowRowDetail] = useState(false);
    let [DetailTblConfig,setDetailTblConfig]=useState(config.DetailTblConfig);
    let [ShowConfirmDel, setShowConfirmDel] = useState(false);
    let [ShowAdd, setShowAdd] = useState(false);
    let [Selected_IDs,setSelected_IDs] = useState([]);
    let SelectedRows = useRef([]);
    let DeleteSuccess = useRef(false);
    let CurrentDetailID = useRef(null);

    let handleRowClicked = null;
    if(Object.keys(config.DetailTblConfig).length !== 0)
    {
        handleRowClicked = (e) =>
        {
            setShowRowDetail(false);
            if(ShowRowDetail && CurrentDetailID.current === e.row['col1'])
            {
                CurrentDetailID.current = null;
            }
            else
            {
                let currentDetailTblConfig = {...DetailTblConfig};
                currentDetailTblConfig.start_query={"timesheet":{"operator":"equal","value":e.row['col1'] }};
                setDetailTblConfig(currentDetailTblConfig);
                CurrentDetailID.current = e.row['col1'];
            };
        };
    };

    function handleSelectionModel(ids)
    {
        setSelected_IDs(ids)//e is row id, we can use to parse through original rows object to get information
    };


    function handleShowDel(){
        if(Selected_IDs.length > 0)
        {
            setShowConfirmDel(true);
        }
    }
    async function handleSelectedDelete(ids)
    {
        const requestOptions={
            method: 'DELETE',
            headers:{'Content-Type': 'application/json','selectors':JSON.stringify({'id':Selected_IDs})}
        };
        let response = await fetch(`${Fetcher.domain}${config.endpoint}`, requestOptions);
        let data = await response.json();
        if(data['Error'])
        {
            alert(data['Error'])
        }
        else
        {
            let str_ids = [];
            for(let i = 0; i < data.length; i++)
            {
                str_ids.push(data[i].id);
            };
            str_ids = str_ids.join(', ');
            alert(`Success: Entry ${str_ids} Deleted`);
            DeleteSuccess.current=true;
            setShowConfirmDel(false);
        };
    };

    let num_rows = config['num_rows'];
    let num_cols = config['num_cols'];
    let col_titles = config['col_titles'];
    let db_columns = config['db_columns'];
    let values = config['values'];
    let col_width = config['col_width'];
    let extract_config = config['extract_config'];
    if(col_titles){num_cols = col_titles.length};
    if(values){num_rows=values.length};

    let rows=[]; 
    let columns=[];

    for(let c = 0; c < num_cols; c++)
    {
        let data = {};
        data['field'] = `col${c+1}`;
        data['headerName'] = col_titles[c];
        data['width']=col_width;
        //data['editable']=true
        //data['renderCell'] = renderDetailsButton
        columns[c] = data;
    };

    if(Object.keys(extract_config).length !== 0)
    {
        for(let i = 0; i < num_rows; i++) //set rows and data
        {
            let data = {};
            let source;
            let field;
            data['id']=values[i].id;
            for(let c = 0; c < num_cols; c++)
            {
                field=db_columns[c];
                source=values[i][field];
                data[`col${c+1}`]=extract_config.methods[field](extract_config.keys[field],source);
            };
            rows[i]=data;
        };
    }
    else
    {
        for(let i = 0; i < num_rows; i++) //set rows and data
        {
            let data = {};
            let source;
            let field;
            data['id']=values[i].id;
     
            for(let c = 0; c < num_cols; c++)
            {
                field=db_columns[c];
                source=values[i][field];
                data[`col${c+1}`]=source;
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
            let filter_element = activeTable.querySelector(".Comp-Query #Filter #Button");
            filter_element.click();
            DeleteSuccess.current = false;
            SelectAllBox.click();
            setShowRowDetail(false);
        };
    },[Selected_IDs,ShowConfirmDel]);

    useEffect(() =>
    {
        if(CurrentDetailID.current)
        {
            setShowRowDetail(true);
        };

    },[DetailTblConfig])

    return ( //First map is column titles; Second map is for data rows/columns
        <div id={`Table-N${nestedTblIndex}`} className={`Comp-Table ${className}`}>
            <div className="Buttons">
                <Add onClick={() => setShowAdd(true)} ></Add>
                <Delete onClick={() => handleShowDel()}></Delete>
                {
                    ShowConfirmDel?
                    <div id="Confirm">
                        <span><strong>Confirm?</strong></span>
                        <div>
                            <button onClick = {() => handleSelectedDelete()}>Yes</button>
                            <button onClick={()=>setShowConfirmDel(false)} >No</button>
                        </div>
                    </div>:
                    null
                }
                {
                    ShowAdd?
                    <div id="AddComponent">
                        <CloseIcon id="Close" onClick={() =>{setShowAdd(false)}}/>
                        <AddComponent endpoint={config.endpoint}/>
                    </div>:
                    null
                }

            </div>

            <Query config={config} setConfig={setConfig} nestedTblIndex={nestedTblIndex}></Query>
            <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
                editMode='row'
                onRowClick = {handleRowClicked}
                onSelectionModelChange={(id) =>handleSelectionModel(id)}
                sx={{
                    "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                       outline: "none !important",
                    },
                 }}
                disableSelectionOnClick
            />
            {
                ShowRowDetail && Object.keys(DetailTblConfig).length !== 0?
                <Table className="Nested-Table" config={DetailTblConfig} setConfig={setDetailTblConfig} nestedTblIndex={nestedTblIndex+1}></Table>
                :null
            }
        </div>
    );
}

export default Table;


/*
    const renderEditable = (params) => {
        return (
            <Form.Control></Form.Control>
        )
    }
*/
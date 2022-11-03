import {DataGrid} from '@mui/x-data-grid'
function Table({config={
    num_rows:2,
    num_cols:3,
    col_titles:['Column1','Column2','Column3'], 
    values:[{Column1:0,Column2:1,Column3:2},{Column1:0,Column2:1,Column3:2}],
    col_width:150}
    })
    {
    
    let num_rows = config['num_rows'];
    let num_cols = config['num_cols'];
    let col_titles = config['col_titles'];
    let values = config['values'];
    if(col_titles){num_cols = col_titles.length};
    if(values){num_rows=values.length};

    let col_width = config['col_width'];
    
    let rows=[]; 
    let columns=[];
    

    for(let c = 0; c < num_cols; c++)
    {
        let data = {};
        data['field'] = `col${c+1}`;
        data['headerName'] = col_titles[c];
        data['width']=col_width;
        columns[c] = data;
    };

    for(let i = 0; i < num_rows; i++) //set rows and data
    {
        let data = {};
        data['id']=i+1;
        for(let c = 0; c < num_cols; c++)
        {
            data[`col${c+1}`] = values[i][col_titles[c]];
        };

        rows[i]=data;
    };


    return ( //First map is column titles; Second map is for data rows/columns
        <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
        />
    );
  }
  
  export default Table;
  
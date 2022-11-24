import {fetcherSelect,fetcherModify} from '../Utilities/Endpoints';
import { processDelData } from '../Utilities/Utils';
import {Component} from 'react';
import EditIcon from '@mui/icons-material/Edit';
import Extender from '../Utilities/Extender'

class TableEvents{
    handleConfirmDelete()
    {
        if(this.state.Selected_IDs.length > 0 && !this.state.ShowAddComp)
        {
            this.setState({"ShowDeleteConfirm":true})
        };
    };


    handleShowAddComp()
    {
        if(!this.state.ShowDeleteConfirm)
        {
            this.setState({"ShowAddComp":true})
        };
    };

    async handleSelectedDelete(ids)
    {
        let data = await fetcherSelect('DELETE',{'id':{'value':this.state.Selected_IDs}}, this.config.endpoint);
        if(data['Error'])
        {
            alert(data['Error']);
            return;
        };
        if(data['detail'])
        {
            alert(data['detail']);
            return;
        };
        alert(processDelData(data, 'Deleted Entries: '));
        this.DeleteSuccess.current=true;
        this.setState({"ShowDeleteConfirm":false});
    };

    handleEditCell(e)
    {
        let row_element = e.target.parentNode.parentNode.parentNode;
        let currEditing = {...this.state.Editing}
        currEditing[row_element.getAttribute('data-id')] = true;
        let inputs = row_element.querySelectorAll('input');
        for(let i = 0; i < inputs.length; i++)
        {
            inputs[i].removeAttribute('disabled');
        };
        this.setState({"Editing":currEditing});
    };

    handleEditReset(e)
    {
        let row_element = e.target.parentNode.parentNode.parentNode.parentNode;
        let currEditing = {...this.state.Editing}
        delete currEditing[row_element.getAttribute('data-id')];
        let inputs = row_element.querySelectorAll('input');
        for(let i = 0; i < inputs.length; i++)
        {
            inputs[i].value = inputs[i].getAttribute('orig-val');
            inputs[i].setAttribute('disabled',true);
        };
        this.setState({"Editing":currEditing});
    };

    async handleEditSave(e)
    {
        let row_element = e.target.parentNode.parentNode.parentNode.parentNode;
        let id = row_element.getAttribute('data-id');
        let inputs = row_element.querySelectorAll('input[db_col]');
        let uneditables = row_element.querySelectorAll('div[db_col]');
        let put_data = {...this.config['edit_config']['data']};
        let active = this.config['edit_config']['active'];
        let extract_fkeys = this.config['extract_config']['keys']
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
            else if(extract_fkeys[db_col] !== null)
            {
                put_data[active][db_col] = default_value.split(' - ')[0];
            }
        };

        for(let i = 0; i < uneditables.length; i++)
        {
            let default_value = uneditables[i].getAttribute('orig-val');
            let db_col = uneditables[i].getAttribute('db_col');
            if(extract_fkeys[db_col] !== null)
            {
                put_data[active][db_col] = default_value.split(' - ')[0];
            };
        };

        let data = await fetcherModify("PUT",put_data,this.config.endpoint);
        if(data['Error'])
        {
            alert(data['Error']);
            return
        };
        if(data['detail'])
        {
            alert(data['detail']);
            return
        };

        let currEditing = {...this.state.Editing};
        let extract_methods = this.config['extract_config']["methods"];
        delete currEditing[id];
        for(let i = 0; i < inputs.length; i++)
        {
            let db_col = inputs[i].getAttribute('db_col');
            let key = extract_fkeys[db_col];
            let source = data[active][db_col];
            inputs[i].value = extract_methods[db_col](key,source);
            inputs[i].setAttribute('orig-val',inputs[i].value);
            inputs[i].setAttribute('disabled',true);
        };
        for(let i = 0; i < uneditables.length; i++)
        {
            let db_col = uneditables[i].getAttribute('db_col');
            let key = extract_fkeys[db_col];
            let source = data[active][db_col];
            uneditables[i].innerHTML = extract_methods[db_col](key,source); 
        };
        this.setState({"Editing":currEditing});
    };

    handleRowClicked(e)
    {
        this.setState({"ShowRowDetail":false});
        if(this.state.ShowRowDetail && this.CurrentDetailID.current === e.row['col1'])
        {
            this.CurrentDetailID.current = null;
            delete this.CurrentEditDetails.current[ e.row['col1']];
            return;
        };
        this.DetailTblConfig.current.start_query={"timesheet":{"operator":"equal","value":e.row['col1'] }};
        this.CurrentDetailID.current = e.row['col1'];
        for(let  i = 0; i < this.col_keys.length; i++)
        {
            this.CurrentEditDetails.current[this.col_keys[i]] = e.row[`col${i+1}`]
        };
    };
}

class TableBuilder{
    addEditCell()
    {
        let data = {};
        data['field'] = `col${this.col_keys.length + 1}`;
        data['headerName'] = ''
        data['width']=this.config['col_width'];
        data['renderCell'] = (params) => 
            <div className="Comp-Table-Edit">
            {
                this.state.Editing[params.id]?
                <div className = "Options">
                    <button onClick = {(e) => {this.handleEditSave(e)}}>Save</button>
                    <button onClick = {(e) => {this.handleEditReset(e)}}>Reset</button>
                </div>:
                <EditIcon onClick = {(e) => this.handleEditCell(e)}/>
            }
            </div>;
        return data;
    };

    buildRows()
    {
        let rows = [];
        for(let i = 0; i < this.TableValues.current.length; i++) //set rows and data
        {
            let data = {};
            let field;
            data['id']=this.TableValues.current[i].id;
            for(let c = 0; c < this.col_keys.length; c++)
            {
                field=this.col_keys[c];
                data[`col${c+1}`]=this.TableValues.current[i][field];
            };
            rows.push(data);
        };
        return  rows;
    };

    buildColumns()
    {
        let columns = [];
        let extract_fkeys = this.config['extract_config']['keys'];
        let extract_methods = this.config['extract_config']['methods']
        for(let c = 0; c < this.col_keys.length; c++)
        {
            let data = {};
            data['field'] = `col${c+1}`;
            data['headerName'] = this.config['col_map'][this.col_keys[c]];
            data['width']=this.config['col_width'];
            if(!(this.col_keys[c] in this.config['uneditable']))
            {
                data['renderCell'] = (params) => 
                {
                    let field=this.col_keys[c];
                    let key = extract_fkeys[field];
                    let cleaned_val  = extract_methods[field](key,params.value);
                    return(
                    <input db_col = {this.col_keys[c]} orig-val = {JSON.stringify(cleaned_val).replace(/"/g,'')} disabled className = "Comp-Table-Input" defaultValue={cleaned_val}></input>
                    )
                };
            }
            else
            {
                data['renderCell'] = (params) => 
                {
                    let field=this.col_keys[c];
                    let key = extract_fkeys[field];
                    let cleaned_val = extract_methods[field](key,params.value);
                    return(
                    <div db_col = {this.col_keys[c]} orig-val = {JSON.stringify(cleaned_val).replace(/"/g,'')}>{cleaned_val}</div>
                    )
                };
            }
            columns.push(data);
        };
        if(this.config.edit_config)
        {
            columns.push(this.addEditCell());
        };
        return columns;
    };

    buildGrid(data)
    {
        this.TableValues.current = data;
        let rows = this.buildRows();
        let columns = this.buildColumns();
        this.setState({"TableGrid":[rows,columns]});
    };
};

class Table extends Component
{
    constructor(props)
    {
        super(props);
        this.__proto__ = Extender(this.__proto__, [TableBuilder, TableEvents]);
    }
}

export {Table}

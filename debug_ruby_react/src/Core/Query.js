import {fetcherSelect} from '../Utilities/Endpoints';
import {Component} from 'react';

export class Query extends Component{
    validateQueryValue(operator, field, value_element)
    {
        let currentQueryOptions = this.QueryOptions.current;
        if(!(operator in this.operator_map))
        {
            currentQueryOptions[field]['operator']=null;
            currentQueryOptions[field]['value']=null;
            return;
        };

        currentQueryOptions[field]['operator']=this.operator_map[operator];
        if(operator === 'in')
        {
            try
            {
                let parsed_val = JSON.parse(`[${value_element.value}]`);
                currentQueryOptions[field]['value']=parsed_val;
                value_element.style.backgroundColor = "white";
            }
            catch
            {
                currentQueryOptions[field]['value']=[];
                value_element.style.backgroundColor = "red";
            };
            return;
        };
        value_element.style.backgroundColor = "white";
        currentQueryOptions[field]['value']=value_element.value;
    };

    handleQueryClear(e)
    {
        let currentQueryOptions = this.QueryOptions.current;
        for(let i = 0; i < this.col_keys.length; i++)
        {
            currentQueryOptions[this.col_keys[i]]={operator:null,value:null};
        };
        let comp_element = e.target.parentNode.parentNode;
        let input_elements = comp_element.querySelectorAll('input');
        for(let inp = 0; inp < input_elements.length; inp++)
        {
            input_elements[inp].value = null;
        };
    };

    handleOperatorChange(e, field)
    {   
        let operator = e.target.value;
        let value_element = e.target.parentNode.children[0];
        this.validateQueryValue(operator, field, value_element);
    };

    handleValueChange(e, field)
    {   
        let operator_element = e.target.parentNode.children[1];
        this.validateQueryValue(operator_element.value,field, e.target);
    };

    async getQuery()
    {
        let data = await fetcherSelect('GET',this.QueryOptions.current, this.config.endpoint);
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
        this.setTableValues(data);
    };
}
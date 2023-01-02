class QueryBuilder
{
    static updateQueryFields(element, new_index, reset) //utility
    {
        let regex = /(\[\d+\])/g;
        let name, id;
        let active_inps = element.querySelectorAll('input:not(.hidden,[type="hidden"])');
        let hidden_inps = element.querySelectorAll('input.hidden');
        let oper_selects = element.querySelectorAll('select');
        let mult_inps = element.querySelectorAll('input[type="hidden"]');
        for(let i = 0; i < active_inps.length; i++) //Doesn't matter which since both arraylikes are 1 to 1
        {
            if(reset)
            {
                active_inps[i].value='';
                active_inps[i].removeAttribute('value');
            };
            [active_inps, hidden_inps, mult_inps, oper_selects].forEach(arr => 
            {
                name = arr[i].getAttribute('name');
                id = arr[i].getAttribute('id');
                if(name){arr[i].setAttribute('name', name.replace(regex,`[${new_index}]`))}; //incremented indices}
                arr[i].setAttribute('id', id.replace(regex,`[${new_index}]`));
            });
        };
    };
    static addCustomQuery(e) //onclick
    {
        let table = e.target.closest('form').querySelector('table');
        let tbody = table.querySelector('table tbody');
        let num_customs = table.querySelector('input[id="num_customs"]')
        let trs = tbody.querySelectorAll('tr');
        let clone = trs[Math.max(0,trs.length-1)].cloneNode(true);

        //clone will retain previous index. We will retrieve it and increment by 1
        let new_index = JSON.parse(clone.getAttribute('index')) + 1;
        let error_div = clone.querySelector('div[id="form-input-err"]');
        let clone_delete = clone.querySelector('tr button[id="delete"]');
        let oper_selects = clone.querySelectorAll(`select[event_handler="handleQueryOpers"]`);

        num_customs.value = parseInt(num_customs.value) + 1; //increment converted int
        clone_delete.style="display:inline-block";
        clone_delete.onclick = (e) => {QueryBuilder.deleteCustomQuery(e)};
        oper_selects.forEach((element) =>
        {
            element.onchange = (e) => {QueryBuilder['handleQueryOpers'](e)};
        });

        if(error_div){error_div.remove();}
        clone.setAttribute('index',new_index);
        
        QueryBuilder.updateQueryFields(clone,new_index, true);
        tbody.appendChild(clone);
    };
    
    static deleteCustomQuery(e)  //onclick
    {
        let table = e.target.closest('form').querySelector('table');
        let tbody = table.querySelector('tbody');
        let num_customs = table.querySelector('input[id="num_customs"]')
        let trs = tbody.children;
        let curr_tr = e.target.closest('tr');
        let new_index = JSON.parse(curr_tr.getAttribute('index'));
        num_customs.value = parseInt(num_customs.value) - 1; //increment converted int
        curr_tr.remove();
        for(let r = new_index + 1; r < trs.length; r++)
        {
            trs[r].setAttribute('index',new_index);
            QueryBuilder.updateQueryFields(trs[r],new_index);
            new_index += 1;
        };
    };
    
    static clearCustomQuery(e)  //onclick
    {
        let tbody = e.target.closest('form').querySelector('tbody');
        let inps = tbody.querySelectorAll('input:not([type="submit"],[type="hidden"])');
        inps.forEach(element => {
            element.value='';
            element.removeAttribute('value');
        });
    };

    static exportQueryCSV(e) //onclick
    {
        let req_format_inp = e.target.closest('form').querySelector('input[name="request_format"]')
        req_format_inp.value = "csv";
        setTimeout(() => {req_format_inp.value = "html";}, 0);
    };


    static handleQuerySubmit(e) //onsubmit
    {
        let array_inps = e.target.querySelectorAll('input[to_array="true"]');
        let proceed = true;
        let in_regex, validator, match, in_error;
        let div;
        array_inps.forEach(element => 
        {
            validator = element.getAttribute('validator');
            in_regex = new RegExp(document.getElementById(`validation[mult_regex][${validator}]`).value, 'g');
            if(element.value !== '' && !element.value.match(in_regex))
            {
                proceed=false;
                div=document.createElement('div');
                div.classList.add('form-input-err');
                div.setAttribute('id','form-input-err')
                in_error = document.getElementById(`validation[error][${validator}]`).value;
                div.innerHTML = `<img src = '/assets/shared_exclamation_square.svg' style='height:1.5em'/>&nbsp;&nbsp;${in_error}`;
                element.parentNode.appendChild(div);
                setTimeout(() => {div.remove();}, 2500);
            };
        });
        let submit_btn = e.target.querySelector('button[type="submit"]:not([id="export"])');
        submit_btn.removeAttribute('data-disable-with');
        return proceed;
    };
    
    static handleQueryOpers(e) //onchange
    {
        let hidden_inp = e.target.parentNode.querySelector('input.hidden');
        let mult_inp = e.target.parentNode.querySelector('input[type="hidden"]');
        let active_inp = e.target.parentNode.querySelector('input:not(.hidden)');
    
        e.target.value === 'in'? mult_inp.value = true : mult_inp.value = false;
        if(e.target.value === 'in' && !active_inp.getAttribute('to_array')) //initial case of inputs
        {
            hidden_inp.classList.remove('hidden'); //make visible
            hidden_inp.setAttribute('to_array', true); //set attribute to now visible
            hidden_inp.setAttribute('name',hidden_inp.getAttribute('id'));
            hidden_inp.value = active_inp.value;
            active_inp.classList.add('hidden');
            active_inp.removeAttribute('name');
        }
        else if (e.target.value !== 'in'  && active_inp.getAttribute('to_array'))
        {
            hidden_inp.classList.remove('hidden'); //make visible
            hidden_inp.setAttribute('name',hidden_inp.getAttribute('id'));
            active_inp.removeAttribute('to_array', true); //set attribute to now visible
            active_inp.classList.add('hidden');
            active_inp.removeAttribute('name');
            hidden_inp.value = active_inp.value;
        }
    };

    static handleQueryView(e) //onchange
    {
        let form = e.target.closest('form');
        let submit_btn = form.querySelector('button[type="submit"]:not([id="export"])');
        console.log(submit_btn);
        submit_btn.click();
        submit_btn.removeAttribute('data-disable-with');
    };
};

let form = document.getElementById('QueryBuilder');
form.onsubmit = (e) => {return QueryBuilder.handleQuerySubmit(e)};

['exportQueryCSV','addCustomQuery','deleteCustomQuery','clearCustomQuery'].forEach((ev) =>
{
    form.querySelectorAll(`button[event_handler="${ev}"]`).forEach((element) =>
    {
        element.onclick = (e) => {QueryBuilder[ev](e)};
    })
});

['handleQueryOpers', 'handleQueryView'].forEach((ev)=>
{
    form.querySelectorAll(`select[event_handler="${ev}"]`).forEach((element) =>
    {
        element.onchange = (e) => {QueryBuilder[ev](e)};
    });
});
function getParentIntAttrib(e,key,n)
{ 
  let element = e.target;
  for(let i = 0; i < n; i++)
  { 
    element=element.parentNode;
  };
  return parseInt(element.getAttribute(key));
};

function buildDateTimeStr(date)
{
    let year = date.getFullYear();
    let month = `0${date.getMonth()+1}`.slice(-2);
    let day = `0${date.getDate()}`.slice(-2);
    let hour = `0${date.getHours()}`.slice(-2);
    let minutes = `0${date.getMinutes()}`.slice(-2);
    let seconds = `0${date.getSeconds()}`.slice(-2);
    let dstr = `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
    return dstr;
};

function alternativeBoolState(CurrState, setCurState)
{
  if(CurrState)
  {
    setCurState(false);
    return;
  };
  setCurState(true);
};

function processDelData(del_items, label = "")
{
    if(del_items.length === 0)
    {
        return "";
    }
    let id_str=[];
    for(let i = 0; i < del_items.length; i++)
    {
        id_str.push(del_items[i].id);
    };
    id_str = id_str.join(', ');
    return `${label}${id_str}`
};

export {getParentIntAttrib,buildDateTimeStr, alternativeBoolState, processDelData}
function getParentIntAttrib(e,key,n)
{ 
  let element = e.target;
  for(let i = 0; i < n; i++)
  { 
    element=element.parentNode;
  };
  return parseInt(element.getAttribute(key));
};

function buildDateTimeStr(date = null, time_period = true)
{
    if(!date)
    {
      date = new Date();
    };
    let year = date.getFullYear();
    let month = `0${date.getMonth()+1}`.slice(-2);
    let day = `0${date.getDate()}`.slice(-2);
    let hour = `0${date.getHours()}`.slice(-2);
    let minutes = `0${date.getMinutes()}`.slice(-2);
    let seconds = `0${date.getSeconds()}`.slice(-2);
    let dstr;
    if(time_period)
    {
      dstr = `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
    }
    else
    {
      dstr = `${year}-${month}-${day}`
    };

    return dstr;
};

function buildCalendarStr(date = null)
{
  if(!date)
  {
    date = new Date();
  };
  return date.toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"});
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

let hidePasswordInput = (e, Password, PassChar, ShowPass) => {
  let curr_password = Password.current;
  let value = e.target.value;
  let curr_pass_length = curr_password.join('').length;
  let diff = value.length - curr_pass_length;
  let mod_chars=[];
  let hidden_pass = [];
  let currPassChar = PassChar.current
  let newPassChar = currPassChar[1]+diff;
  let index_offset = currPassChar[1]-currPassChar[0];
  if(diff > 0)
  {
    mod_chars = value.slice(currPassChar[0],newPassChar);
    if(value[value.length-1] !== '*' && diff === 1)
    {
        curr_password.splice(currPassChar[0],diff,...mod_chars); 
    }
    else
    {
        curr_password.splice(currPassChar[0],index_offset,...mod_chars); 
    }
  }
  else if(diff < 0)
  {
    mod_chars = value.slice(currPassChar[0],newPassChar);
    let replaced=false;
    if(!ShowPass.current)
    {
        for(let i = 0; i < value.length;i++)
        {
            if(value[i] !== '*'){replaced=true; break;}
        };
    };
    ShowPass.current = false;

    if(!replaced)
    {
        curr_password.splice(newPassChar,-diff);
    }
    else if (replaced)
    {
        curr_password.splice(currPassChar[0],index_offset,...mod_chars);
    }
  }
  else
  {
      mod_chars = value.slice(currPassChar[0],currPassChar[1]);
      curr_password.splice(currPassChar[0],index_offset,...mod_chars);
      newPassChar=currPassChar[1];
  };
  for(let i = 0; i < value.length;i++)
  {
      hidden_pass.push('*')
  };
  e.target.value = hidden_pass.join('');
  PassChar.current = [newPassChar,newPassChar];
  Password.current = curr_password;
};



export {getParentIntAttrib,buildDateTimeStr, alternativeBoolState, processDelData, buildCalendarStr, hidePasswordInput}
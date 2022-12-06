let test = 
{
    0:
    {
        1:
        {
            2:
            {
                3:"VALUE"
            }
        }
    }
};


let GLOBALS =
{
    "INCOME":true,
    "INCOME_HISTORY":true
}
function recurser(data)
{
    let keys = Object.keys(data);
    keys.map(
    (k, index)=>
    {
        if(!(data[k] in GLOBALS))
        {
            return <></>
        }

        if(typeof(data[k]) === 'object')
        {
            return(
                <div key = {index}>
                    {recurser(data[k])}
                </div>
            )
        }
        
        return(
            <div>{data[k]}</div>
        )
    })
};
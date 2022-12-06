import React, {Suspense} from 'react';

export default function LazyWrapper({Comp})
{
    return(
        <Suspense fallback = 
        {
            <div style={{backgroundColor:"rgb(149, 180, 168)",color:"black",fontSize:"1.5em",display:"flex",justifyContent:"center",alignItems:"center",flex:"1"}}>
                Loading your page...
            </div>
        }>
            {Comp}
        </Suspense>
    )
};
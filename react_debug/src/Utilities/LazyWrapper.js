import React, {Suspense} from 'react';

export default function LazyWrapper({Comp})
{
    return(
        <Suspense fallback = {<div>Loading...</div>}>
            {Comp}
        </Suspense>
    )
};
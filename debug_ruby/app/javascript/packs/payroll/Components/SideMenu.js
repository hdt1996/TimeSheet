import React from 'react';
import { Link } from 'react-router-dom';
function SideMenu(
    {
        MenuLinks=
        {
            "Menu_Item1":"/",
            "Menu_Item2":"/"
        }
    })
{
    function handleCollapse(e)
    {
        let element = e.target.parentNode.querySelector('#menu');
        if(!element.classList.contains("easewidth0"))
        {
            element.classList.add("easewidth0")
        }
        else
        {
            element.classList.remove("easewidth0")
        };
    };

    const alternative_shades = ["lighter","darker"];
    let curr_index = -1;
    return ( 
        <div className="disflxrow fitmwd">
            <div className="disflxcol easewidth13 ovflxhide"  id="menu">
                <div className="bktitleclr3 disflxrctr fntsz1p5e fntbld">
                    Applications
                </div>
                {
                    Object.keys(MenuLinks).map((menu_item, index)=>
                    {
                        curr_index++;
                        if(curr_index === alternative_shades.length)
                        {
                            curr_index = 0;
                        };
                        return (
                        <div id={alternative_shades[curr_index]} key={index} className="flx1 mxht3e" >
                            <Link className="whtspnowrap nolinktxt disflxrctr ht100pct ovflxhide" to={MenuLinks[menu_item]}> {menu_item}</Link>
                        </div>
                        )
                    })
                }
            </div>
            <div className="wdp5e bkbarclr1 disflxcol posrel collapse-after" id="before" onDoubleClick={(e) => {handleCollapse(e)}}></div>
        </div>
    );
}
  
  export default SideMenu;
  
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
        let element = e.target.parentNode.querySelector('.Menu');
        if(!element.classList.contains("Transition"))
        {
            element.classList.add("Transition")
        }
        else
        {
            element.classList.remove("Transition")
        };
    };

    const alternative_shades = ["lighter","darker"];
    let curr_index = -1;
    return ( 
        <div className="Comp-SideMenu">
            <div className="Menu">
            {
                Object.keys(MenuLinks).map((menu_item, index)=>
                {
                    curr_index++;
                    if(curr_index === alternative_shades.length)
                    {
                        curr_index = 0;
                    };
                    return (
                    <div id={alternative_shades[curr_index]} key={index}>
                        <Link className="Link" to={MenuLinks[menu_item]}> {menu_item}</Link>
                    </div>
                    )
                })
            }
            </div>
            <div className="Collapse" id="before" onDoubleClick={(e) => {handleCollapse(e)}}></div>
        </div>
    );
}
  
  export default SideMenu;
  
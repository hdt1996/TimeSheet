import React, { useState, useEffect } from 'react';

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
        if(!element.classList.contains("SideMenu-Transition"))
        {
            element.classList.add("SideMenu-Transition")
        }
        else
        {
            element.classList.remove("SideMenu-Transition")
        };
    };
    const alternative_shades = ["lighter","darker"];
    let curr_index = -1;
    return ( //First map is column titles; Second map is for data rows/columns
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
                        <a id="link" href={MenuLinks[menu_item]}> {menu_item}</a>
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
  
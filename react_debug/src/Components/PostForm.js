import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add'
import {getParentIntAttrib} from '../Utilities/Utils'
import React from "react";
function PostForm(
  {
    config={num_rows:5,col_map:{}}, inputChange, BillingLineData
  }
)
{
  let rows = [];
  for(let i = 0; i < config["num_rows"]; i++)
  {
    rows.push(i);
  };

  let col_keys = Object.keys(config['col_map']);
  let col_titles = Object.keys(config['col_map']).map(function(key){return config['col_map'][key]});
  const alternative_shades = ["lighter","darker"];
  let ColorIndex = 1;

  function handleAdd(){
    let parent_element = document.querySelector('#Comp-PostForm');
    let par_children = parent_element.children;
    //Make copy of 2nd to last element
    let new_clone = par_children[par_children.length-2].cloneNode(true); //Clone contains attributes but not hydrated event listeners
    
    //Before we insert, we need to update the placeholder which is the actual programmatic index of the rows
    //List starts with zero but on the frontend we use 1 as starting point
    let updated_placeholder = parseInt(new_clone.getAttribute('placeholder'))+1; //Initial clone has placeholder of 0, we increment

    new_clone.setAttribute('placeholder',updated_placeholder) //update
    new_clone.querySelector(".Index").innerHTML = updated_placeholder + 1; //The index shown is the placeholder plus one since we do not start from zero
    new_clone.setAttribute("id",alternative_shades[ColorIndex]);
    //We will use this to feed to onKeyUp event handler #TODO

    //Hydrating event handler now.
    //First we need to get the input elements
    let clone_input_elements = new_clone.querySelectorAll("#form-control-db") //This id was assigned for easy search
    for(let i = 0; i < clone_input_elements.length; i++)
    {
      clone_input_elements[i].onkeyup=(e)=>{inputChange(e, true)}; //We subtract because we need indice start from 0 for POST data but starting from 1 for display
      clone_input_elements[i].value = "";
    };

    //Now we add the delete event listener
    //Get the delete div from the clone
    let clone_delete_icon = new_clone.querySelector(".Delete");
    clone_delete_icon.onclick=(e)=>{handleDelete(e)};

    //This is it for hydrating the new clone!
    //Insert before very last "Add" icon
    parent_element.insertBefore(new_clone,par_children[par_children.length-1]); //Here we target the actual index of the add button since we are inserting --before--
    BillingLineData.current.push({id:null,num_minutes:null,memo:null})
    if(ColorIndex+1 === 2)
    {
      ColorIndex = 0;
    }
    else
    {
      ColorIndex++;
    };

  };

  function handleDelete(e){
    //For deleting we will be removing the last element just before the add icon
    //Get the parents and children
    let index = getParentIntAttrib(e,'placeholder',1);
    let par_children = document.querySelector('#Comp-PostForm').children; //initial Children
    if(index === 0 && par_children.length === 2){return;}; //Don't delete first row otherwise there will be no copy to clone

    par_children[index].remove(); // Chosen element is deleted. par_children is now stale. Reset to updated list
    BillingLineData.current.splice(index,1); //removes element and re-indexes
    par_children = document.querySelector('#Comp-PostForm').children;

    for(index; index < par_children.length - 1; index++) //uses index to re order elements on dom, starting from the index that was deleted
    // i.e. if index deleted was 2, the next element in its place would be 3 and so forth. REORDER them to start from 2
    // No need to rehydrate elements since arguments for array functions
    {
      par_children[index].setAttribute("placeholder",index);
      par_children[index].querySelector(".Index").innerHTML = index+1;
    };

    if(ColorIndex === 0){
      ColorIndex = 1;
    }
    else
    {
      ColorIndex--;
    };
  };

    return (
      <Form id="Comp-PostForm">
      {
        rows.map((r, rindex)=>
        {                
          return (
            <Row key = {rindex} className="Comp-PostForm-Row" placeholder={`${rindex}`}>
              <Col className="Index">
                {rindex+1}
              </Col>
              {
                col_titles.map((c, cindex) =>
                {
                  let db_attrib = col_keys[cindex];
                  return (
                    <Col id="col" key = {cindex}>
                      <Form.Control onKeyUp = {(e) =>{inputChange(e, true)}} db = {db_attrib} id="form-control-db" placeholder={c} />
                    </Col>
                  )
                })
              }
              <div className="Delete" onClick={(e)=>{handleDelete(e)}}>
                <Delete className="Icon"/>
              </div>
            </Row>
          )
        })
      }

      <div className="Comp-PostForm-Add">
        <Add className="Button" onClick={()=>{handleAdd()}}></Add>
      </div>
    </Form>
    );
}
  
export default PostForm;
  
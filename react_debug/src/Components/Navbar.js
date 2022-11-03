function Navbar({config={'title':'Title','sections':['Section1','Section2','Section3'],'dropdowns':['Dropdown1','Dropdown2','Dropdown3']}}) {
  let title = config['title'];
  let sections = config['sections'];
  let dropdowns = config['dropdowns'];
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <a className="navbar-brand" href="#">{title}</a>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
          {
            sections.map((sect, index)=>
            {
              return (
                <li className="nav-item" key={index}>
                  <a className="nav-link" href="#">{sect} 
                    <span className="sr-only">(current)</span>
                  </a>
                </li>
              )
            })
          }
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {dropdowns[0]}
            </a>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
              {
                dropdowns.slice(1).map((drp, index)=>
                {
                  return <a className="dropdown-item" href="#" key = {index}>{drp}</a>
                })
              }
            </div>
          </li>
        </ul>
        <form className="form-inline my-2 my-lg-0">
          <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search"></input>
          <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
        </form>
      </div>
    </nav>
  );
}

export default Navbar;

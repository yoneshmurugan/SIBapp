import data from '../data/MainPage/HeaderLinks.json';
import { NavLink } from 'react-router-dom';

function HeaderLinks({ onClick = null, classname = "", ismembers = false, memfooter = false }) {

  if (memfooter) {
    const footerComponent = data.map((link, index) => {
      if (link.name === "Members") {
        return (
          <a
            key={index}
            href={"#hero"}
            className={classname}
            data-text={link.name}
            onClick={onClick}
          >
            {link.name}
          </a>
        )
      }
      else {
        return (<NavLink
          key={index}
          to={`/${link.url}`}
          className={classname}
          data-text={link.name}
          onClick={onClick}
        >
          {link.name}
        </NavLink>)
      }
    });
    return footerComponent ;
  }

  if (ismembers) {
    return <>
      <NavLink
        key={1}
        to={"/"}
        className={classname}
        data-text={data[0].name}
        onClick={onClick}
      >
        {data[0].name}
      </NavLink>
    </>
  }

  const HeaderComponent = data.map((link, index) => {
    if (link.name === "Members") {
      return (
        <NavLink
          key={index}
          to={link.url}
          className={classname}
          data-text={link.name}
          onClick={onClick}
        >
          {link.name}
        </NavLink>
      )
    }
    else {
      return (<a
        key={index}
        href={link.url}
        className={classname}
        data-text={link.name}z
        onClick={onClick}
      >
        {link.name}
      </a>)
    }
  });

  return <>{HeaderComponent}</>;
}

export default HeaderLinks;
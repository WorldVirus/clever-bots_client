import React from 'react';

const Diolog = props => (
  <ul>
    {
      props.items.map((item, index) => <li key={index}><div className="answer left">
      <div className="avatar">
        <img
          src="https://bootdey.com/img/Content/avatar/avatar1.png"
          alt="User name"
        />
        <div className="status offline" />
      </div>
      <div className="text">{item}</div>
      </div>
      </li>)
    }
  </ul>
);

export default Diolog;

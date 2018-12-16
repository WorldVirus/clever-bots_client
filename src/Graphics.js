import React from "react";

import {Doughnut} from 'react-chartjs-2';

const data = {
	labels: [
    'joy',
		'annoyance',
	],
	datasets: [{
		data: [300, 50],
		backgroundColor: [
		'#FF6384',
		'#36A2EB',
		],
		hoverBackgroundColor: [
		'#FF6384',
		'#36A2EB',
		]
	}]
};

export default class Graphics extends React.Component{
  render() {
    return (
      <div>
        <Doughnut data={data} />
      </div>
    );
  }
}

// const rootElement = document.querySelector("div.content");
// ReactDOM.render(<Grahics />, rootElement);

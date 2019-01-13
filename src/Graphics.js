import React from "react";

import {Doughnut} from 'react-chartjs-2';

const data = {
	labels: [
    'Neutral',
		'Happy',
    'Sad' ,
    'Angry',
    'Fear',
    'Not enough sonorancy to determine emotions',
	],
	datasets: [{
		data: [300, 50,10,20,30,40,50,60],
		backgroundColor: [
		'#009999',
		'#66ff66',
		'#000099',
		'#ff3333',
		'#cc00cc',
		'#6A2EB',

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

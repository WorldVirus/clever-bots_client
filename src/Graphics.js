import React from "react";

import { Bar, Doughnut } from 'react-chartjs-2';
//import 'chartjs-plugin-labels';
export default class Graphics extends React.Component {

	render() {
		const data = {
			labels: [
				'Агрессия',
				'Страх',
				'Счастье',
				'Равнодушие',
				'Грусть',
				'Сложно определить эмоцию',
			],
			datasets: [{
				data: [this.props.emothionData.Angry, this.props.emothionData.Fear, this.props.emothionData.Happy,
				this.props.emothionData.Neutral, this.props.emothionData.Sad,  this.props.emothionData.not_enough,],
				backgroundColor: [
					'#e63900',
					'#ff9999',
					'#66ff33',
					'#6600cc',
					'#996600',
					'#cc6699',
				],
				label: 'Статистика эмоций',
			}],
			options: {
				pieceLabel: {
					precision: 0,
					fontSize: 12,
					fontColor: '#fff',
					fontStyle: 'bold',
					fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
				}
			}
		};

		const pleasure_data = {
			labels: [
				'Удолетворенность',
				'Неудолетворенность',
				// 'Длинна сообщений'
			],
			datasets: [{
				data: [Math.random() * (60 - 20) + 50, Math.random() * (50 - 20) + 30,this.props.emothionData.len],
				backgroundColor: [
					'#99ff33',
					'#ffcc00',
				],
				label: 'Удолетвореность диалогом',
			}],
			options: {
				pieceLabel: {
					precision: 0,
					fontSize: 12,
					fontColor: '#fff',
					fontStyle: 'bold',
					fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
				},
				scales: {
					xAxes: [{
						stacked: true
					}],
					yAxes: [{
						stacked: true
					}]
				}
			}
		}
		return (
			<div>
				<Doughnut data={data} />
				<div style={{ paddingTop: '50px' }}></div>
				<Bar data={pleasure_data} />

			</div>
		);
	}
}

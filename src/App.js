import React from "react";
import Hello from "./Hello";

import './css/fullstack.css';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }


    render () {
        return (
                <div className='header-contents'>
                <Hello name="User" />
                </div>
        );
    }
}

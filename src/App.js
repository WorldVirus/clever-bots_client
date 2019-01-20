import React from "react";
import MainContainer from "./MainContainer";
import './App.css'
import './css/fullstack.css';

export default class App extends React.Component {

    render () {
        return (
                <div className='header-contents'>
                <MainContainer name="User" />
                </div>
        );
    }
}

import React from "react";
import { Grid, Row, Col } from "react-bootstrap";
import Graphics from "./Graphics";
import Dialog from "./Dialog";
import io from "socket.io-client";
import init from "./audioSender";

const url = window.location.host.includes("localhost")
  ? "http://0.0.0.0:5000"
  : "https://hackmoscow-api.herokuapp.com";
var SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default class MainContainer extends React.Component {
  constructor(props) {
    super(props);
    this.testChunk = [];
    this.state = {
      checkClick: false,
      positionStatic: false,
      botAnswers: "",
      renderAnswers: [],
      speechResult: "",
      disableFlag:true,
      objEmothins: {
        Neutral: 0,
        Happy: 0,
        Angry: 0,
        Fear: 0,
        Sad: 0,
        not_enough: 0,
        len: 0,
        checker: false
      }
    };

    this.clicker = this.clicker.bind(this);
    this.startMenu = this.startMenu.bind(this);
  }

  clicker(e) {
    e.preventDefault();
    if (!this.state.checkClick) {
      this.setState({
        checkClick: true,
        positionStatic: true
      });
      this.startRecording();
    } else {
      this.setState({
        checkClick: false
      });
    }
  }

  startRecording() {
    let recognition = new SpeechRecognition();
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    let socket = io.connect(`${url}/audio`);
    socket.on("my response", function(msg) {
    });
    init(true);
    this.setState({
      disableFlag:true,
    })
    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 2;
    recognition.start();

    recognition.onresult = event => {
      console.log(`onresult`)
      let speechResult = event.results[0][0].transcript;
      Promise.all([this.textSender(speechResult)]);
    };

    recognition.onaudioend = () => {
      console.log(`onaudioend`)
      init(false);
      this.setState({
        disableFlag:false,
      })
    };
  }

  startMenu() {
    fetch(`${url}/emotion `, {
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then(data => {
        console.log(data)

        if(data.neutral !== undefined ){
        this.setState({
          positionStatic: false,
          objEmothins: {
            Neutral: data.neutral,
            Happy: data.happy,
            Sad: data.sad,
            Data: data.angry,
            not_enough: data.not_enough,
            len: data.len,
            checker: true
          }
        });
      }
      else{
        throw "No response with data"
      }
      }).catch(e=>{
        console.log(e)
      });

    this.setState({
      positionStatic: false,
      checkClick: false,
      renderAnswers: []
    });
  }

  textSender(valueSpeech) {
    return fetch(`${url}/postjson`, {
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ speech_data: valueSpeech })
    })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then(data => {
        if (this.state.botAnswers.length) {
          this.setState({ botAnswers: "" });
        }
        this.setState({
          botAnswers: data.answer_value,
          renderAnswers: this.state.renderAnswers.concat([data.answer_value]),
          checkClick: false
        });
      });
  }

  render() {
    const name = "Привет !";
    const { checkClick, positionStatic, objEmothins,disableFlag } = this.state;
    return (
      <div className="cont" style={{ marginTop: objEmothins.checker || positionStatic ? "16px" : "200px" }}>
        {objEmothins.checker ? (
          <Graphics emothionData={objEmothins} />
        ) : (
          <>
            {positionStatic ? (
              <button className="close" disabled= {disableFlag} onClick={this.startMenu} />
            ) : (
              ""
            )}
            <section className="content_wrapper">
              <Grid>
                <Row>
                  <Col md={7} mdOffset={5}>
                    <h1 style={{ fontSize: positionStatic ? "30px" : "65px" }}>
                      {name}
                    </h1>
                  </Col>
                </Row>

                <Row>
                  <Col md={7} mdOffset={5} style={{ paddingTop: "15px" }}>
                    <button
                      style={{
                        backgroundColor: checkClick ? "#d9534f" : "#28a745"
                      }}
                      type="button"
                      onClick={this.clicker}
                      className={`btn btn-success btn-circle btn-xl${
                        checkClick ? " btn-click-red" : ""
                      }`}
                    >
                      <i className="fa fa-phone" />{" "}
                    </button>
                  </Col>
                </Row>
              </Grid>

              <div className="dialog-wrapper">
                <div className="div-wrapper-line" />
                <div className="dialog-wrapper-content">
                  <div className="content container-fluid bootstrap snippets">
                    <div className="row row-broken">
                      <div
                        className="col-inside-lg decor-default chat"
                        style={{
                          overflow: "hidden",
                          outline: "none",
                          backgroundColor: "unset",
                          height: "unset"
                        }}
                        tabIndex="5000"
                      >
                        <div className="chat-body">
                          {this.state.positionStatic ? (
                            <Dialog items={this.state.renderAnswers} />
                          ) : (
                            ""
                          )}
                          <div id="project-wrapper">
                            <div id="project-container">
                              <div id="overlay" />
                              <div id="content" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    );
  }
}

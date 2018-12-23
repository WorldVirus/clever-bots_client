import React from "react";
import { Grid, Row, Col } from "react-bootstrap";
import Graphics from "./Graphics";
import Dialog from "./Dialog";
let mediaRecorder;

var SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
// var SpeechGrammarList = SpeechGrammarList || new webkitSpeechGrammarList();
// var SpeechRecognitionEvent = SpeechRecognitionEvent || new webkitSpeechRecognitionEvent();

export default class Hello extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checkClick: false,
      positionStatic: false,
      botAnswers: '',
      renderAnswers:[],
      arChuncks: [],
      url:'',
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

  textSender(valueSpeech) {
    return (fetch(`http://127.0.0.1:5000/postjson`, {
      mode: "cors",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ speech_data: valueSpeech })
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      }
    }).then(data => {
      if (this.state.botAnswers.length) {
        this.setState({ botAnswers: '' });
      }
      this.setState({
        botAnswers: data.answer_value,
        renderAnswers:this.state.renderAnswers.concat([data.answer_value]),
        checkClick: false
      });
    })
    );
  }

  audioSender() {
    const formData = new Blob(this.state.arChuncks, { type: 'audio/wav' })

    return (fetch(`http://127.0.0.1:5000/mediataker `, {
      mode: "cors",
      headers: {
        "Content-Type": "audio/wav"
      },
      method: "POST",
      body: formData
    })
    )
  }

  startRecording() {
    let recognition = new SpeechRecognition();

    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();
    recognition.onstart = () => {  
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorder.start();
        if(this.state.arChuncks.length){
          this.setState({
            arChuncks: [],
          });
        }
      mediaRecorder.addEventListener("dataavailable", event => {
        this.setState({
          arChuncks: this.state.arChuncks.concat([event.data])
        });
      });
    });
  }

  recognition.onaudioend = () => {  
    mediaRecorder.stop();
    mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(this.state.arChuncks);
      const audioUrl = URL.createObjectURL(audioBlob);
      this.setState({ url: audioUrl });
    });  
  }  

    recognition.onresult = event => {
      let speechResult = event.results[0][0].transcript;
       Promise.all([this.textSender(speechResult),this.audioSender()])
    };
  }
  startMenu(){
    this.setState({positionStatic:false,checkClick:false, renderAnswers:[],})
  }
  render() {
    const name = "Hello, User";
    const { checkClick, positionStatic } = this.state;
    return (
      <div className="cont" style={{ top: positionStatic ? "1%" : "30%" }}>
     {positionStatic? <a className="close" onClick={this.startMenu}></a>:''}
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
      </div>
    );
  }
}

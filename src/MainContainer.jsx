import React from "react";
import { Grid, Row, Col } from "react-bootstrap";
import Graphics from "./Graphics";
import Dialog from "./Dialog";
import io from 'socket.io-client';
import init from './audioSender'
let mediaRecorder;

var SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
var audioContext = new AudioContext();

export default class MainContainer extends React.Component {
  constructor(props) {
    super(props);
    this.testChunk = [];
    this.state = {
      checkClick: false,
      positionStatic: false,
      botAnswers: '',
      renderAnswers: [],
      arChuncks: [],
      url: '',
      speechResult: '',
      objEmothins: {
        Neutral: 0,
        Happy: 0,
        Angry: 0,
        Fear: 0,
        Sad: 0,
        not_enough: 0,
        len: 0,
      },
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

    var audioInput = null,
        realAudioInput = null,
        inputPoint = null,
        recording = false;
      
        let socket = io.connect('http://127.0.0.1:5000/audio');
        socket.on('my response', function(msg) {
          console.log(`msg`,msg)
       //   $('#log').append('<p>Received: ' + msg.data + '</p>');
      });
      socket.emit('start-recording', {numChannels: 1, bps: 16, fps: parseInt(audioContext.sampleRate)});
      init();
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
        this.testChunk.concat([event.data])
        this.testChunk[0] = event.data
        console.log(`this.state.arChuncks`,this.testChunk[0].size)
        console.log(`this.state.arChuncks`,this.testChunk)

        this.setState({
          arChuncks: this.state.arChuncks.concat([event.data])
        });
      });
    });
  }

    recognition.onresult = event => {
      console.log(`onresult`)
      let speechResult = event.results[0][0].transcript;
       Promise.all([this.textSender(speechResult)])
       
    };

    recognition.onaudioend = () => {  
      console.log(`onaudioend`)
      mediaRecorder.stop();
      mediaRecorder.addEventListener("stop", () => {
        // const audioBlob = new Blob(this.state.arChuncks);
        // const audioUrl = URL.createObjectURL(audioBlob);
        // this.setState({ url: audioUrl });
      });  
    }  
  }

  startMenu(){
    fetch(`http://127.0.0.1:5000/emotion `, {
      mode: "cors",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      }
    }).then(data => {
  console.log(`data`,data)
      this.setState({
        positionStatic: false, 
        objEmothins: {
          Neutral: data.neutral,
          Happy: data.happy,
          Sad: data.sad,
          Data:data.angry,
          not_enough: data.not_enough,
          len: data.len,
        }
      })
    })
    
    this.setState({positionStatic:false,checkClick:false, renderAnswers:[],});
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
        renderAnswers: this.state.renderAnswers.concat([data.answer_value]),
        checkClick: false
      });
    })
    );
  }

  audioSender() {
    const formData = new Blob(this.state.arChuncks, { type: 'audio/wav' })
    return (fetch(`http://127.0.0.1:5000/mediataker`, {
      mode: "cors",
      headers: {
        "Content-Type": "audio/wav"
      },
      method: "POST",
      body: formData
    })
    )
  }

  sizeSender() {
    console.log(`sizeSender`)
    return (
      fetch(`http://127.0.0.1:5000/size_taker`, {
        mode: "cors",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ size_chunk: this.testChunk[0].size })
      }))
  }

  render() {
    const name = "Hello, User";
    const { checkClick, positionStatic } = this.state;
    return (
      <div className="cont" style={{ top: positionStatic ? "1%" : "30%" }}>
      {/* <Graphics/> */}
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

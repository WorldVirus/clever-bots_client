
import io from "socket.io-client";

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var recording = false;
var analyserNode = window.analyserNode;
var audioContext = new AudioContext();
var scriptNode = window.scriptNode;
var audioInput = null,
  realAudioInput = null,
  inputPoint = null;
 const url = window.location.host.includes("localhost")
? "http://0.0.0.0:5000"
: "https://hackmoscow-api.herokuapp.com";
var socketio = io.connect(`${url}/audio`,{transports: ['websocket']});
var zeroGain = window.zeroGain;

var recordStart = false;

const convertToMono = (input)=> {
  var splitter = audioContext.createChannelSplitter(2);
  var merger = audioContext.createChannelMerger(2);

  input.connect(splitter);
  splitter.connect(
    merger,
    0,
    0
  );
  splitter.connect(
    merger,
    0,
    1
  );
  return merger;
}

const gotStream = stream => {
  recording = recordStart;
  if (recording) {
    socketio.emit("start-recording", {
      numChannels: 1,
      bps: 16,
      fps: parseInt(audioContext.sampleRate)
    });
  }

  inputPoint = audioContext.createGain();

  // Create an AudioNode from the stream.
  realAudioInput = audioContext.createMediaStreamSource(stream);
  audioInput = realAudioInput;

  audioInput = convertToMono(audioInput);
  audioInput.connect(inputPoint);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 2048;
  inputPoint.connect(analyserNode);
    if(audioContext.state === 'suspended'){
      audioContext.resume().then(function() {
      });
    }
  scriptNode = (audioContext.createScriptProcessor || audioContext.createJavaScriptNode).call(audioContext, 1024, 1, 1);

  scriptNode.onaudioprocess = audioEvent => {
    if (recording) {
      var input = audioEvent.inputBuffer.getChannelData(0);
      var buffer = new ArrayBuffer(input.length * 2);
      var output = new DataView(buffer);
      for (var i = 0, offset = 0; i < input.length; i++, offset += 2) {
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
      socketio.emit("write-audio", buffer);
    } 
    else{
      audioContext.suspend()
    }
  };

  if (!recording) {
    socketio.emit("end-recording");
  }
  inputPoint.connect(scriptNode);
  scriptNode.connect(audioContext.destination);

  zeroGain = audioContext.createGain();
  zeroGain.gain.value = 0.0;
  inputPoint.connect(zeroGain);
  zeroGain.connect(audioContext.destination);
};

export default function initAudio(startRecord) {
  recordStart = startRecord;
  navigator.getUserMedia({ audio: true }, gotStream, e => {
    console.log(e);
  });
}

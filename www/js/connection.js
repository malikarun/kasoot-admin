// find demo at this url
// https://www.webrtc-experiment.com/RTCMultiConnection/stream-mp3-live.html

// find code at this url
// https://github.com/muaz-khan/RTCMultiConnection/blob/master/demos/stream-mp3-live.html
// https://github.com/muaz-khan/WebRTC-Experiment/issues/222


window.onload = function () {
 var connection = new RTCMultiConnection('haryanvi-radio-kasoot');

  connection.session = {
    audio: true,
    oneway: true
  };

  // connect to signaling gateway
  connection.connect();

  // open a connection to stream audio
  connection.open();
  // dont capture user media
  connection.dontCaptureUserMedia = true;


  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  var context = new AudioContext();

  var gainNode = context.createGain();

  var destination = context.createMediaStreamDestination();

  var reader = new FileReader();

  gainNode.connect(context.destination);

  // don't play for self
  // gainNode.gain.value = 0;

  reader.onload = (function(e) {

    // Import callback function that provides PCM audio data decoded as an audio buffer
    context.decodeAudioData(e.target.result, function(buffer) {
      // Create the sound source
      var soundSource = context.createBufferSource();

      soundSource.buffer = buffer;

      // soundSource.loop = true;
      console.log(soundSource);

      soundSource.start(0, 0 / 1000);

      soundSource.connect(gainNode);

      soundSource.connect(destination);

      // connection.attachStreams.pop();
      connection.attachStreams.push(destination.stream);

      soundSource.onended = function(){
        console.log("stopped");
      }
    });
  });

  // document.querySelector('input[type=file]').onchange = function() {
  //   console.log("file added")
  //   // this.disabled = true;
  //   console.log(this.files);
  //   reader.readAsArrayBuffer(this.files[this.files.length-1]);
  // };

  document.addEventListener('next-song', function() {
    console.log("song is changed")
    reader.readAsArrayBuffer(this.files[this.files.length-1]);
  });
}
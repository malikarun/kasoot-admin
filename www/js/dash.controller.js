angular.module('starter.controllers')

.controller('DashCtrl', function($scope, $log, $http, $timeout) {

  $scope.playlist = [];

  $scope.currentSource = false;
  $scope.looping = false;
  $scope.playing = false;

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
  // connection.dontCaptureUserMedia = true;

  // get the Audio context
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  // create a new audiocontext node
  var context = new AudioContext();

  var gainNode = context.createGain();

  var destination = context.createMediaStreamDestination();

  var reader = new FileReader();

  gainNode.connect(context.destination);

  // don't play for self
  gainNode.gain.value = 0;

  reader.onload = function(e) {
    createNewSource(e);
  }

  reader.onerror = function(e) {
    $log.info("An error occured reading file");
    $scope.playing = false;
    if ($scope.looping){
      $scope.playNext();
    }
  }

  reader.onabort = function(e) {
    $log.info("Read operation aborted");
    $scope.playing = false;
  }

  $scope.play = function (index){
    if ( $scope.currentSource) {
      $scope.stopped = true;
      $scope.currentSource.stop();
    }

    if (typeof index == 'undefined') {
      var index = Math.floor(Math.random() * $scope.playlist.length);
    }

    $scope.currentSong = $scope.playlist[index];
    reader.abort();
    console.log(reader);

    if ($scope.currentSong) {
      reader.readAsArrayBuffer($scope.currentSong);
      $scope.playing = true;
      $scope.stopped = false;
    } else {
      alert("Nothing to Play");
    }
    $log.info("in play");
    $scope.applyScope();
  }

  $scope.playNext = function(){
    $log.info($scope.currentSong);
    var currentIndex = $scope.playlist.indexOf($scope.currentSong);

    if (currentIndex == $scope.playlist.length-1){
      index = 0;
    } else{
      index = currentIndex+1;
    }

    $scope.play(index);
  }

  $scope.playPrevious = function(){
    var currentIndex = $scope.playlist.indexOf($scope.currentSong);

    if (currentIndex == 0){
      index = $scope.playlist.length-1;
    } else {
      index = currentIndex-1;
    }

    $scope.play(index);
  }

  $scope.stop = function() {
    if ( $scope.currentSource) {
      $scope.stopped = true;
      $scope.currentSource.stop();
    }
    $scope.applyScope();
  }

  $scope.toggleLooping = function(){
    $scope.looping = !$scope.looping;
    $scope.applyScope();
  }

  $scope.applyScope = function(){
    $timeout(function () {
      $scope.$apply();
    }, 500);
  }

  document.querySelector('.add-new-song').onclick = function() {
    var files = document.querySelector('input[type=file]').files;

    angular.forEach(files, function(newFile){
      if ( typeof newFile !== 'undefined' ){
        if (newFile.size/1024/1024 < 15){
          if ($scope.playlist.indexOf(newFile)){
            $scope.playlist.push(newFile);
          } else {
            $log.info("File already exist");
          }
        } else {
          $log.info("File too large(" + newFile.size/1024/1024 + " Mb) \n upload smaller file");
        }
      }
    });
    $scope.applyScope();
  };

  function createNewSource(e){
    $log.info("createNewSource", e);
    // Import callback function that provides PCM audio data decoded as an audio buffer
    context.decodeAudioData(e.target.result, function(buffer) {
      // Create the sound source
      $scope.currentSource = context.createBufferSource();

      $scope.currentSource.buffer = buffer;

      // $scope.currentSource.loop = true;
      $log.info($scope.currentSource);

      $scope.currentSource.start(0, 0 / 1000);

      $scope.currentSource.connect(gainNode);

      $scope.currentSource.connect(destination);

      // connection.attachStreams.pop();
      connection.attachStreams.push(destination.stream);

      $scope.currentSource.onended = function(){
        $log.info("stopped");
        // $scope.playing = false;
        $log.info("$scope.playing", $scope.playing);
        $log.info("$scope.stopped", $scope.stopped);
        $log.info("$scope.looping", $scope.looping);

        if ($scope.looping && !$scope.stopped){
          $log.info("will play next");
          $scope.playNext();
        }
      }
    });
    $scope.applyScope();
  }
})
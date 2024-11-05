let audioContext;
let analyser;
let dataArray;
let canvas;
let canvasCtx;
let audio;

// Load Audio
function loadAudio() {
  const url = document.getElementById("audio-url").value;

  if (audio) {
    audio.pause(); // Pause any previous audio
  }

  // Get audio element and set new source
  audio = document.getElementById("audio-player");
  audio.src = url;
  audio.crossOrigin = "anonymous"; // Enable cross-origin for testing if needed
  audio.load();
  audio.play();

  setupAudioContext();
}

// Set up Audio Context for Web Audio API
function setupAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  const source = audioContext.createMediaElementSource(audio);
  analyser = audioContext.createAnalyser();

  source.connect(analyser);
  analyser.connect(audioContext.destination);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  canvas = document.getElementById("visualizer");
  canvasCtx = canvas.getContext("2d");

  drawVisualizer();
}

// Draw the audio visualizer
function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);

  analyser.getByteFrequencyData(dataArray);

  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = canvas.width / dataArray.length;
  let barHeight;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    barHeight = dataArray[i];
    const red = (barHeight + 100) % 256;
    const green = (i * 5) % 256;
    const blue = 255;

    canvasCtx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

    x += barWidth + 1;
  }
}

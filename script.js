let player;
let audioContext;
let analyser;
let dataArray;
let canvas;
let canvasCtx;

// Load YouTube video
function loadVideo() {
  const url = document.getElementById("youtube-url").value;
  const videoId = extractVideoId(url);

  if (videoId) {
    if (player) {
      player.loadVideoById(videoId);
    } else {
      player = new YT.Player("player", {
        videoId: videoId,
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }
  } else {
    alert("Invalid YouTube URL. Please try again.");
  }
}

// Extract video ID from URL
function extractVideoId(url) {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Initialize Web Audio API when the player is ready
function onPlayerReady(event) {
  // Create or resume the AudioContext
  if (!audioContext || audioContext.state === "closed") {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Use the player's video element as the audio source
  const source = audioContext.createMediaElementSource(event.target.getIframe());
  analyser = audioContext.createAnalyser();

  source.connect(analyser);
  analyser.connect(audioContext.destination);

  // Configure analyser
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  // Set up canvas for visualizer
  canvas = document.getElementById("visualizer");
  canvasCtx = canvas.getContext("2d");

  // Start the visualizer animation
  drawVisualizer();
}

// Start the visualization when the video plays
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && audioContext.state === "suspended") {
    audioContext.resume();
  }
}

// Draw the audio visualizer
function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);

  // Get audio data
  analyser.getByteFrequencyData(dataArray);

  // Clear canvas
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  // Visualize frequency data
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

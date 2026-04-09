import './style.css'

const app = document.querySelector('#app')
const PIXEL_WIDTH = 96

app.innerHTML = `
  <main class="shell">
    <section class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Glyph Signal Lab</p>
          <h1>Pixel Camera</h1>
        </div>
        <p class="status" id="camera-status" aria-live="polite">Requesting camera...</p>
      </div>

      <div class="output-grid">
        <div class="preview-frame preview-frame-main">
          <canvas
            id="pixel-output"
            class="pixel-output"
            aria-label="Pixelated camera output"
          ></canvas>
        </div>

        <div class="debug-panel">
          <p class="debug-label">Raw camera preview</p>
          <div class="preview-frame preview-frame-debug">
            <video
              id="camera-preview"
              class="camera-preview"
              autoplay
              playsinline
              muted
            ></video>
          </div>
        </div>
      </div>
    </section>
  </main>
`

const statusEl = document.querySelector('#camera-status')
const videoEl = document.querySelector('#camera-preview')
const outputCanvas = document.querySelector('#pixel-output')
const outputContext = outputCanvas.getContext('2d')

const sourceCanvas = document.createElement('canvas')
const sourceContext = sourceCanvas.getContext('2d')

let frameId = null

outputContext.imageSmoothingEnabled = false
sourceContext.imageSmoothingEnabled = false

function setStatus(message, tone = 'muted') {
  statusEl.textContent = message
  statusEl.dataset.tone = tone
}

function renderFrame() {
  if (videoEl.readyState < 2) {
    frameId = requestAnimationFrame(renderFrame)
    return
  }

  const videoWidth = videoEl.videoWidth
  const videoHeight = videoEl.videoHeight

  if (!videoWidth || !videoHeight) {
    frameId = requestAnimationFrame(renderFrame)
    return
  }

  const sourceWidth = PIXEL_WIDTH
  const sourceHeight = Math.max(1, Math.round((videoHeight / videoWidth) * sourceWidth))

  if (sourceCanvas.width !== sourceWidth || sourceCanvas.height !== sourceHeight) {
    sourceCanvas.width = sourceWidth
    sourceCanvas.height = sourceHeight
  }

  if (outputCanvas.width !== videoWidth || outputCanvas.height !== videoHeight) {
    outputCanvas.width = videoWidth
    outputCanvas.height = videoHeight
  }

  sourceContext.drawImage(videoEl, 0, 0, sourceWidth, sourceHeight)
  outputContext.clearRect(0, 0, outputCanvas.width, outputCanvas.height)
  outputContext.drawImage(sourceCanvas, 0, 0, outputCanvas.width, outputCanvas.height)

  frameId = requestAnimationFrame(renderFrame)
}

function startRenderLoop() {
  if (frameId !== null) {
    cancelAnimationFrame(frameId)
  }

  frameId = requestAnimationFrame(renderFrame)
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus('Camera unavailable in this browser.', 'error')
    return
  }

  setStatus('Requesting camera...', 'muted')

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })

    videoEl.srcObject = stream
    videoEl.addEventListener('loadedmetadata', startRenderLoop, { once: true })
    setStatus('Camera ready.', 'success')
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      setStatus('Permission denied.', 'error')
      return
    }

    if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
      setStatus('No camera found.', 'error')
      return
    }

    setStatus('Camera failed to start.', 'error')
  }
}

startCamera()

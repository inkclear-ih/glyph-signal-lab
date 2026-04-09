import './style.css'

const app = document.querySelector('#app')
const settings = {
  pixelWidth: 96,
  brightness: 0,
  contrast: 1.15,
  threshold: 128,
  invert: false,
  backgroundColor: '#060a08',
  foregroundColor: '#24d676',
}

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

      <section class="controls-panel" aria-label="Render controls">
        <label class="control">
          <span>Resolution</span>
          <input
            id="pixel-width"
            type="range"
            min="48"
            max="160"
            step="4"
            value="${settings.pixelWidth}"
          />
          <output id="pixel-width-value">${settings.pixelWidth}px</output>
        </label>

        <label class="control">
          <span>Brightness</span>
          <input
            id="brightness"
            type="range"
            min="-100"
            max="100"
            step="1"
            value="${settings.brightness}"
          />
          <output id="brightness-value">${settings.brightness}</output>
        </label>

        <label class="control">
          <span>Contrast</span>
          <input
            id="contrast"
            type="range"
            min="0.4"
            max="2"
            step="0.05"
            value="${settings.contrast}"
          />
          <output id="contrast-value">${settings.contrast.toFixed(2)}</output>
        </label>

        <label class="control">
          <span>Threshold</span>
          <input
            id="threshold"
            type="range"
            min="0"
            max="255"
            step="1"
            value="${settings.threshold}"
          />
          <output id="threshold-value">${settings.threshold}</output>
        </label>

        <label class="control control-toggle">
          <span>Invert</span>
          <input id="invert" type="checkbox" />
        </label>

        <label class="control">
          <span>Background</span>
          <input id="background-color" type="color" value="${settings.backgroundColor}" />
        </label>

        <label class="control">
          <span>Foreground</span>
          <input id="foreground-color" type="color" value="${settings.foregroundColor}" />
        </label>
      </section>

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

function hexToRgb(hex) {
  const value = hex.slice(1)

  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

function applyBitmapEffect(width, height) {
  const frame = sourceContext.getImageData(0, 0, width, height)
  const { data } = frame
  const backgroundColor = hexToRgb(settings.backgroundColor)
  const foregroundColor = hexToRgb(settings.foregroundColor)

  for (let i = 0; i < data.length; i += 4) {
    const luminance = (0.299 * data[i]) + (0.587 * data[i + 1]) + (0.114 * data[i + 2])
    const adjusted = ((luminance - 128) * settings.contrast) + 128 + settings.brightness
    const clipped = Math.max(0, Math.min(255, adjusted))
    const isForeground = settings.invert
      ? clipped < settings.threshold
      : clipped >= settings.threshold
    const color = isForeground ? foregroundColor : backgroundColor

    data[i] = color[0]
    data[i + 1] = color[1]
    data[i + 2] = color[2]
    data[i + 3] = 255
  }

  sourceContext.putImageData(frame, 0, 0)
}

function bindControl(id, formatter = (value) => value) {
  const input = document.querySelector(`#${id}`)
  const output = document.querySelector(`#${id}-value`)

  input.addEventListener('input', () => {
    const value = input.type === 'range' ? Number(input.value) : input.checked
    settings[id === 'pixel-width' ? 'pixelWidth' : id] = value

    if (output) {
      output.value = formatter(value)
      output.textContent = formatter(value)
    }
  })
}

bindControl('pixel-width', (value) => `${value}px`)
bindControl('brightness')
bindControl('contrast', (value) => value.toFixed(2))
bindControl('threshold')

document.querySelector('#invert').addEventListener('input', (event) => {
  settings.invert = event.target.checked
})

document.querySelector('#background-color').addEventListener('input', (event) => {
  settings.backgroundColor = event.target.value
})

document.querySelector('#foreground-color').addEventListener('input', (event) => {
  settings.foregroundColor = event.target.value
})

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

  const sourceWidth = settings.pixelWidth
  const sourceHeight = Math.max(1, Math.round((videoHeight / videoWidth) * sourceWidth))

  if (sourceCanvas.width !== sourceWidth || sourceCanvas.height !== sourceHeight) {
    sourceCanvas.width = sourceWidth
    sourceCanvas.height = sourceHeight
  }

  if (outputCanvas.width !== sourceWidth || outputCanvas.height !== sourceHeight) {
    outputCanvas.width = sourceWidth
    outputCanvas.height = sourceHeight
  }

  sourceContext.drawImage(videoEl, 0, 0, sourceWidth, sourceHeight)
  applyBitmapEffect(sourceWidth, sourceHeight)
  outputContext.clearRect(0, 0, outputCanvas.width, outputCanvas.height)
  outputContext.drawImage(sourceCanvas, 0, 0)

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

import './style.css'

const app = document.querySelector('#app')
const LIVE_BITMAP_WIDTH_MAX = 640
const DEFAULT_SETTINGS = {
  pixelWidth: 96,
  brightness: 0,
  contrast: 1.15,
  threshold: 128,
  ditherMode: 'threshold',
  invert: false,
  backgroundColor: '#060a08',
  foregroundColor: '#24d676',
  exportSize: '1920x1080',
}
const settings = { ...DEFAULT_SETTINGS }

const DITHER_MAPS = {
  'bayer-2x2': [
    [64, 191],
    [128, 0],
  ],
  'bayer-4x4': [
    [16, 144, 48, 175],
    [207, 80, 239, 112],
    [32, 159, 0, 128],
    [223, 96, 191, 64],
  ],
  'bayer-8x8': [
    [4, 132, 36, 164, 12, 139, 44, 172],
    [195, 68, 227, 100, 203, 76, 235, 107],
    [51, 179, 20, 148, 60, 187, 28, 155],
    [243, 115, 212, 84, 251, 124, 219, 92],
    [8, 136, 40, 167, 0, 128, 32, 159],
    [199, 71, 231, 103, 191, 63, 223, 96],
    [56, 184, 24, 151, 48, 175, 16, 144],
    [247, 120, 215, 88, 239, 111, 207, 80],
  ],
  horizontal: [
    [142, 142, 142, 170, 199, 227, 227, 227, 227, 199, 170, 170],
    [113, 113, 85, 85, 56, 28, 28, 28, 28, 56, 85, 113],
    [227, 227, 227, 199, 170, 170, 142, 142, 142, 170, 199, 227],
    [28, 28, 28, 56, 85, 113, 113, 113, 85, 85, 56, 28],
  ],
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
          <span>Bitmap Width</span>
          <input
            id="pixel-width"
            type="range"
            min="48"
            max="${LIVE_BITMAP_WIDTH_MAX}"
            step="4"
            value="${settings.pixelWidth}"
          />
          <output id="pixel-width-value">${formatBitmapWidth(settings.pixelWidth)}</output>
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

        <label class="control">
          <span>Dither Mode</span>
          <select id="dither-mode">
            <option value="threshold" selected>Threshold</option>
            <option value="bayer-2x2">Bayer 2x2</option>
            <option value="bayer-4x4">Bayer 4x4</option>
            <option value="bayer-8x8">Bayer 8x8</option>
            <option value="horizontal">Horizontal</option>
          </select>
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

        <div class="control control-actions">
          <span>Actions</span>
          <div class="button-row">
            <button id="freeze-toggle" type="button">Freeze Frame</button>
            <button id="reset-controls" type="button" class="button-secondary">Reset</button>
            <button id="export-png" type="button">Export PNG</button>
          </div>
        </div>

        <label class="control">
          <span>PNG Export Size</span>
          <select id="export-scale">
            <option value="2048x1152">2048 x 1152</option>
            <option value="1920x1080" selected>1920 x 1080</option>
            <option value="1600x900">1600 x 900</option>
            <option value="1280x720">1280 x 720</option>
            <option value="1024x576">1024 x 576</option>
            <option value="960x540">960 x 540</option>
            <option value="640x360">640 x 360</option>
            <option value="320x180">320 x 180</option>
            <option value="160x90">160 x 90</option>
            <option value="96x54">96 x 54</option>
          </select>
          <small class="control-note">Only affects the downloaded PNG, not the live preview.</small>
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
let isFrozen = false

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

function getSourceRegion(width, height) {
  const targetAspectRatio = 16 / 9
  const sourceAspectRatio = width / height

  if (sourceAspectRatio >= targetAspectRatio) {
    return {
      x: 0,
      y: 0,
      width,
      height,
      aspectRatio: sourceAspectRatio,
    }
  }

  const croppedHeight = width / targetAspectRatio

  return {
    x: 0,
    y: (height - croppedHeight) / 2,
    width,
    height: croppedHeight,
    aspectRatio: targetAspectRatio,
  }
}

function applyBitmapEffect(width, height) {
  const frame = sourceContext.getImageData(0, 0, width, height)
  const { data } = frame
  const backgroundColor = hexToRgb(settings.backgroundColor)
  const foregroundColor = hexToRgb(settings.foregroundColor)
  const thresholdMap = DITHER_MAPS[settings.ditherMode]

  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4
    const x = pixelIndex % width
    const y = Math.floor(pixelIndex / width)
    const luminance = (0.299 * data[i]) + (0.587 * data[i + 1]) + (0.114 * data[i + 2])
    const adjusted = ((luminance - 128) * settings.contrast) + 128 + settings.brightness
    const clipped = Math.max(0, Math.min(255, adjusted))
    const mapThreshold = thresholdMap
      ? thresholdMap[y % thresholdMap.length][x % thresholdMap[0].length] - 128 + settings.threshold
      : settings.threshold
    const isForeground = settings.invert
      ? clipped < mapThreshold
      : clipped >= mapThreshold
    const color = isForeground ? foregroundColor : backgroundColor

    data[i] = color[0]
    data[i + 1] = color[1]
    data[i + 2] = color[2]
    data[i + 3] = 255
  }

  sourceContext.putImageData(frame, 0, 0)
}

function formatBitmapWidth(value) {
  return `${value}px wide`
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

bindControl('pixel-width', formatBitmapWidth)
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

document.querySelector('#dither-mode').addEventListener('input', (event) => {
  settings.ditherMode = event.target.value
})

document.querySelector('#export-scale').addEventListener('input', (event) => {
  settings.exportSize = event.target.value
})

const freezeToggleButton = document.querySelector('#freeze-toggle')
const resetControlsButton = document.querySelector('#reset-controls')
const exportPngButton = document.querySelector('#export-png')

function updateFreezeButton() {
  freezeToggleButton.textContent = isFrozen ? 'Resume Live' : 'Freeze Frame'
  freezeToggleButton.setAttribute('aria-pressed', String(isFrozen))
}

function syncControlValues() {
  const pixelWidthInput = document.querySelector('#pixel-width')
  const pixelWidthValue = document.querySelector('#pixel-width-value')
  const brightnessInput = document.querySelector('#brightness')
  const brightnessValue = document.querySelector('#brightness-value')
  const contrastInput = document.querySelector('#contrast')
  const contrastValue = document.querySelector('#contrast-value')
  const thresholdInput = document.querySelector('#threshold')
  const thresholdValue = document.querySelector('#threshold-value')
  const ditherModeInput = document.querySelector('#dither-mode')
  const invertInput = document.querySelector('#invert')
  const backgroundColorInput = document.querySelector('#background-color')
  const foregroundColorInput = document.querySelector('#foreground-color')
  const exportScaleInput = document.querySelector('#export-scale')

  pixelWidthInput.value = String(settings.pixelWidth)
  pixelWidthValue.value = formatBitmapWidth(settings.pixelWidth)
  pixelWidthValue.textContent = formatBitmapWidth(settings.pixelWidth)

  brightnessInput.value = String(settings.brightness)
  brightnessValue.value = String(settings.brightness)
  brightnessValue.textContent = String(settings.brightness)

  contrastInput.value = String(settings.contrast)
  contrastValue.value = settings.contrast.toFixed(2)
  contrastValue.textContent = settings.contrast.toFixed(2)

  thresholdInput.value = String(settings.threshold)
  thresholdValue.value = String(settings.threshold)
  thresholdValue.textContent = String(settings.threshold)

  ditherModeInput.value = settings.ditherMode
  invertInput.checked = settings.invert
  backgroundColorInput.value = settings.backgroundColor
  foregroundColorInput.value = settings.foregroundColor
  exportScaleInput.value = settings.exportSize
}

freezeToggleButton.addEventListener('click', () => {
  isFrozen = !isFrozen
  updateFreezeButton()
})

resetControlsButton.addEventListener('click', () => {
  Object.assign(settings, DEFAULT_SETTINGS)
  isFrozen = false
  syncControlValues()
  updateFreezeButton()
})

exportPngButton.addEventListener('click', () => {
  if (!outputCanvas.width || !outputCanvas.height) {
    return
  }

  const exportCanvas = document.createElement('canvas')
  const exportContext = exportCanvas.getContext('2d')
  const [exportWidth, exportHeight] = settings.exportSize
    .split('x')
    .map((value) => Number(value))

  exportCanvas.width = exportWidth
  exportCanvas.height = exportHeight
  exportContext.imageSmoothingEnabled = false
  exportContext.drawImage(outputCanvas, 0, 0, exportWidth, exportHeight)

  const link = document.createElement('a')
  link.href = exportCanvas.toDataURL('image/png')
  link.download = 'glyph-signal-lab-export.png'
  link.click()
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

  const sourceRegion = getSourceRegion(videoWidth, videoHeight)
  outputCanvas.style.aspectRatio = `${sourceRegion.width} / ${sourceRegion.height}`

  const sourceWidth = settings.pixelWidth
  const sourceHeight = Math.max(1, Math.round((sourceRegion.height / sourceRegion.width) * sourceWidth))

  if (sourceCanvas.width !== sourceWidth || sourceCanvas.height !== sourceHeight) {
    sourceCanvas.width = sourceWidth
    sourceCanvas.height = sourceHeight
  }

  if (outputCanvas.width !== sourceWidth || outputCanvas.height !== sourceHeight) {
    outputCanvas.width = sourceWidth
    outputCanvas.height = sourceHeight
  }

  if (!isFrozen) {
    sourceContext.drawImage(
      videoEl,
      sourceRegion.x,
      sourceRegion.y,
      sourceRegion.width,
      sourceRegion.height,
      0,
      0,
      sourceWidth,
      sourceHeight,
    )
    applyBitmapEffect(sourceWidth, sourceHeight)
    outputContext.clearRect(0, 0, outputCanvas.width, outputCanvas.height)
    outputContext.drawImage(sourceCanvas, 0, 0)
  }

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

syncControlValues()
updateFreezeButton()
startCamera()

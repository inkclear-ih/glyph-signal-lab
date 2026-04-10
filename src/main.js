import './style.css'

const app = document.querySelector('#app')
const LIVE_BITMAP_WIDTH_MAX = 640
const SOURCE_TYPES = {
  camera: 'camera',
  image: 'image',
  video: 'video',
}
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
  sequenceDuration: '1',
  sequenceFps: '12',
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
          <span>Source</span>
          <select id="source-type">
            <option value="camera" selected>Camera</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </label>

        <div class="control control-actions">
          <span>Source File</span>
          <div class="button-row">
            <button id="choose-file" type="button" class="button-secondary" hidden>Choose File</button>
          </div>
          <small class="control-note" id="source-file-note">Live camera is active.</small>
        </div>

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
            <option value="blue-noise">Blue Noise</option>
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
            <button id="export-sequence" type="button">Export PNG Seq</button>
            <button id="export-webm" type="button">Export WebM</button>
            <button id="stop-capture" type="button" class="button-secondary" disabled>Stop Capture</button>
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

        <label class="control">
          <span>Capture Duration</span>
          <select id="sequence-duration">
            <option value="1" selected>1s</option>
            <option value="10">10s</option>
            <option value="20">20s</option>
            <option value="50">50s</option>
            <option value="stop">Until stop</option>
          </select>
          <small class="control-note">Until stop applies to WebM only.</small>
        </label>

        <label class="control">
          <span>Seq FPS</span>
          <select id="sequence-fps">
            <option value="12" selected>12</option>
            <option value="24">24</option>
          </select>
        </label>
      </section>

      <div class="output-grid">
        <div class="preview-frame preview-frame-main" id="main-preview-frame">
          <canvas
            id="pixel-output"
            class="pixel-output"
            aria-label="Pixelated source output"
          ></canvas>
          <button
            id="fullscreen-toggle"
            class="preview-overlay-button"
            type="button"
            aria-label="Enter fullscreen"
            title="Toggle fullscreen"
          >Fullscreen</button>
        </div>

        <div class="debug-panel">
          <p class="debug-label" id="debug-label">Raw camera preview</p>
          <div class="preview-frame preview-frame-debug">
            <video
              id="camera-preview"
              class="camera-preview"
              autoplay
              playsinline
              muted
            ></video>
            <img id="image-preview" class="camera-preview" alt="Selected source preview" hidden />
          </div>
        </div>
      </div>
    </section>
  </main>
`

const statusEl = document.querySelector('#camera-status')
const sourceTypeInput = document.querySelector('#source-type')
const chooseFileButton = document.querySelector('#choose-file')
const sourceFileNote = document.querySelector('#source-file-note')
const debugLabel = document.querySelector('#debug-label')
const videoEl = document.querySelector('#camera-preview')
const imageEl = document.querySelector('#image-preview')
const outputCanvas = document.querySelector('#pixel-output')
const outputContext = outputCanvas.getContext('2d')
const mainPreviewFrame = document.querySelector('#main-preview-frame')
const fileInput = document.createElement('input')

fileInput.type = 'file'
fileInput.hidden = true
app.append(fileInput)

const sourceCanvas = document.createElement('canvas')
const sourceContext = sourceCanvas.getContext('2d')
const blueNoiseCanvas = document.createElement('canvas')
const blueNoiseContext = blueNoiseCanvas.getContext('2d', { willReadFrequently: true })

let frameId = null
let isFrozen = false
let isSequenceExporting = false
let activeWebmCapture = null
let blueNoiseThresholdMap = null
let blueNoiseLoadFailed = false
let currentSourceType = SOURCE_TYPES.camera
let pendingSourceType = null
let currentFileUrl = null
let currentFileName = ''
let cameraStream = null

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

function getActiveThresholdMap() {
  if (settings.ditherMode === 'blue-noise') {
    if (!blueNoiseThresholdMap && blueNoiseLoadFailed) {
      return null
    }

    return blueNoiseThresholdMap
  }

  return DITHER_MAPS[settings.ditherMode] ?? null
}

function loadBlueNoiseThresholdMap() {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.addEventListener('load', () => {
      blueNoiseCanvas.width = image.width
      blueNoiseCanvas.height = image.height
      blueNoiseContext.clearRect(0, 0, image.width, image.height)
      blueNoiseContext.drawImage(image, 0, 0)

      const { data } = blueNoiseContext.getImageData(0, 0, image.width, image.height)
      const thresholdMap = []

      for (let y = 0; y < image.height; y += 1) {
        const row = []

        for (let x = 0; x < image.width; x += 1) {
          const index = ((y * image.width) + x) * 4
          const grayscale = Math.round((0.299 * data[index]) + (0.587 * data[index + 1]) + (0.114 * data[index + 2]))
          row.push(grayscale)
        }

        thresholdMap.push(row)
      }

      resolve(thresholdMap)
    }, { once: true })

    image.addEventListener('error', () => {
      reject(new Error('Blue noise asset failed to load.'))
    }, { once: true })

    image.src = `${import.meta.env.BASE_URL}patterns/bluenoise.png`
  })
}

function applyBitmapEffect(width, height) {
  const frame = sourceContext.getImageData(0, 0, width, height)
  const { data } = frame
  const backgroundColor = hexToRgb(settings.backgroundColor)
  const foregroundColor = hexToRgb(settings.foregroundColor)
  const thresholdMap = getActiveThresholdMap()

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

function isFileSource() {
  return currentSourceType === SOURCE_TYPES.image || currentSourceType === SOURCE_TYPES.video
}

function isStaticImageSource() {
  return currentSourceType === SOURCE_TYPES.image
}

function getDisplayedSourceType() {
  return pendingSourceType ?? currentSourceType
}

function hasActiveCaptureOperation() {
  return activeWebmCapture !== null || isSequenceExporting
}

function clearCanvas(canvas, context) {
  context.clearRect(0, 0, canvas.width, canvas.height)
}

function clearOutputCanvas() {
  clearCanvas(outputCanvas, outputContext)
}

function revokeCurrentFileUrl() {
  if (!currentFileUrl) {
    return
  }

  URL.revokeObjectURL(currentFileUrl)
  currentFileUrl = null
}

function stopCameraStream() {
  if (!cameraStream) {
    return
  }

  cameraStream.getTracks().forEach((track) => track.stop())
  cameraStream = null
}

function clearVideoSource() {
  videoEl.pause()
  videoEl.srcObject = null
  videoEl.removeAttribute('src')
  videoEl.load()
}

function clearImageSource() {
  imageEl.removeAttribute('src')
}

function resetFreezeState() {
  isFrozen = false
  updateFreezeButton()
}

function setDebugPreview(type) {
  const showImage = type === SOURCE_TYPES.image
  imageEl.hidden = !showImage
  videoEl.hidden = showImage
  debugLabel.textContent = showImage
    ? 'Source image preview'
    : type === SOURCE_TYPES.video
      ? 'Source video preview'
      : 'Raw camera preview'
}

function getCurrentSourceElement() {
  return currentSourceType === SOURCE_TYPES.image ? imageEl : videoEl
}

function hasRenderableSource() {
  if (currentSourceType === SOURCE_TYPES.image) {
    return Boolean(imageEl.src) && imageEl.complete && imageEl.naturalWidth > 0 && imageEl.naturalHeight > 0
  }

  return Boolean(videoEl.srcObject || videoEl.currentSrc) && videoEl.readyState >= 2 && videoEl.videoWidth > 0 && videoEl.videoHeight > 0
}

function getRenderableDimensions() {
  if (currentSourceType === SOURCE_TYPES.image) {
    return {
      width: imageEl.naturalWidth,
      height: imageEl.naturalHeight,
    }
  }

  return {
    width: videoEl.videoWidth,
    height: videoEl.videoHeight,
  }
}

function updateSourceFileNote() {
  const displayedSourceType = getDisplayedSourceType()

  if (displayedSourceType === SOURCE_TYPES.camera) {
    sourceFileNote.textContent = 'Live camera is active.'
    return
  }

  if (!currentFileName || pendingSourceType) {
    sourceFileNote.textContent = displayedSourceType === SOURCE_TYPES.image
      ? 'Choose a single image file.'
      : 'Choose a single video file.'
    return
  }

  sourceFileNote.textContent = currentFileName
}

function updateSourceControls() {
  const displayedSourceType = getDisplayedSourceType()
  const showFileButton = displayedSourceType === SOURCE_TYPES.image || displayedSourceType === SOURCE_TYPES.video
  const isLocked = hasActiveCaptureOperation()

  chooseFileButton.hidden = !showFileButton
  chooseFileButton.disabled = isLocked
  chooseFileButton.textContent = currentFileName ? 'Choose Another File' : 'Choose File'
  sourceTypeInput.disabled = isLocked
  fileInput.accept = displayedSourceType === SOURCE_TYPES.image ? 'image/*' : 'video/*'
  updateSourceFileNote()
}

function updateFreezeButton() {
  freezeToggleButton.textContent = isFrozen ? 'Resume Live' : 'Freeze Frame'
  freezeToggleButton.setAttribute('aria-pressed', String(isFrozen))
  freezeToggleButton.disabled = isStaticImageSource()
  freezeToggleButton.title = isStaticImageSource() ? 'Freeze is only needed for camera or video sources.' : ''
}

function isUnlimitedCaptureDuration() {
  return settings.sequenceDuration === 'stop'
}

function getCaptureDurationSeconds() {
  return isUnlimitedCaptureDuration() ? null : Number(settings.sequenceDuration)
}

function updateCaptureButtons() {
  const isWebmRecording = activeWebmCapture !== null
  const isUnlimited = isUnlimitedCaptureDuration()
  const canAnimate = !isStaticImageSource()
  const hasFrames = outputCanvas.width > 0 && outputCanvas.height > 0

  exportWebmButton.disabled = !canAnimate || !hasFrames || isWebmRecording || isSequenceExporting
  exportSequenceButton.disabled = !canAnimate || !hasFrames || isWebmRecording || isSequenceExporting || isUnlimited
  stopCaptureButton.disabled = !isWebmRecording

  exportWebmButton.title = canAnimate ? '' : 'WebM export is available for camera or video sources.'
  exportSequenceButton.title = isUnlimited
    ? 'Until stop is available for WebM only.'
    : canAnimate
      ? ''
      : 'PNG sequence export is available for camera or video sources.'
  stopCaptureButton.title = isWebmRecording ? 'Stop the active WebM capture.' : 'No WebM capture is active.'
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
  const sequenceDurationInput = document.querySelector('#sequence-duration')
  const sequenceFpsInput = document.querySelector('#sequence-fps')

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
  sequenceDurationInput.value = settings.sequenceDuration
  sequenceFpsInput.value = settings.sequenceFps
  sourceTypeInput.value = getDisplayedSourceType()
  updateSourceControls()
  updateCaptureButtons()
}

function getExportDimensions() {
  return settings.exportSize
    .split('x')
    .map((value) => Number(value))
}

function createExportCanvas() {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const [width, height] = getExportDimensions()

  canvas.width = width
  canvas.height = height
  context.imageSmoothingEnabled = false

  return { canvas, context, width, height }
}

function drawProcessedFrame(context, width, height) {
  context.clearRect(0, 0, width, height)
  context.drawImage(outputCanvas, 0, 0, width, height)
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
        return
      }

      reject(new Error('PNG encoding failed.'))
    }, 'image/png')
  })
}

function waitForNextAnimationFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

function waitForTimeout(durationMs) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs)
  })
}

async function waitForCaptureTime(targetTime) {
  while (performance.now() < targetTime) {
    await waitForNextAnimationFrame()
  }
}

function formatExportTimestamp(date = new Date()) {
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}${month}${day}_${hours}${minutes}${seconds}`
}

function createStillPngFilename(timestamp) {
  return `gsl_pic_${timestamp}.png`
}

function createSequenceFrameFilename(timestamp, frameNumber) {
  return `gsl_seq_${timestamp}_${String(frameNumber).padStart(4, '0')}.png`
}

function createWebmFilename(timestamp) {
  return `gsl_vid_${timestamp}.webm`
}

function updateFullscreenButton() {
  const isFullscreen = document.fullscreenElement === mainPreviewFrame
  fullscreenToggleButton.textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'
  fullscreenToggleButton.setAttribute('aria-label', isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen')
  fullscreenToggleButton.setAttribute('aria-pressed', String(isFullscreen))
}

function getSupportedWebmMimeType() {
  if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) {
    return null
  }

  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ]

  return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? null
}

function drawSourceFrame(sourceWidth, sourceHeight, sourceRegion) {
  sourceContext.drawImage(
    getCurrentSourceElement(),
    sourceRegion.x,
    sourceRegion.y,
    sourceRegion.width,
    sourceRegion.height,
    0,
    0,
    sourceWidth,
    sourceHeight,
  )
}

function clearLoadedFile() {
  currentFileName = ''
  revokeCurrentFileUrl()
  clearVideoSource()
  clearImageSource()
}

async function loadSelectedFile(file) {
  clearLoadedFile()
  currentFileName = file.name
  currentFileUrl = URL.createObjectURL(file)

  if (currentSourceType === SOURCE_TYPES.image) {
    imageEl.src = currentFileUrl

    try {
      await imageEl.decode()
    } catch {
      clearLoadedFile()
      clearOutputCanvas()
      updateCaptureButtons()
      updateSourceControls()
      setStatus('Image file could not be loaded.', 'error')
      return
    }

    updateSourceControls()
    updateCaptureButtons()
    setStatus('Image ready.', 'success')
    return
  }

  videoEl.loop = true
  videoEl.src = currentFileUrl

  try {
    await videoEl.play()
  } catch {
    // Playback may need a second attempt once metadata is ready.
  }

  updateSourceControls()
  setStatus('Video ready.', 'success')
}

async function promptForFile() {
  fileInput.value = ''
  fileInput.click()
}

async function switchSource(nextSourceType) {
  if (hasActiveCaptureOperation()) {
    sourceTypeInput.value = currentSourceType
    return
  }

  if (nextSourceType === currentSourceType) {
    pendingSourceType = null
    updateSourceControls()
    return
  }

  if (nextSourceType === SOURCE_TYPES.camera) {
    pendingSourceType = null
    currentSourceType = nextSourceType
    resetFreezeState()
    stopCameraStream()
    clearLoadedFile()
    clearOutputCanvas()
    setDebugPreview(currentSourceType)
    updateSourceControls()
    updateCaptureButtons()
    setStatus('Switching to camera...', 'muted')
    await startCamera()
    return
  }

  pendingSourceType = nextSourceType
  sourceTypeInput.value = nextSourceType
  updateSourceControls()
  setStatus(
    nextSourceType === SOURCE_TYPES.image ? 'Choose an image file.' : 'Choose a video file.',
    'muted',
  )
  await promptForFile()
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
  if (event.target.value === 'blue-noise' && !blueNoiseThresholdMap) {
    event.target.value = settings.ditherMode
    setStatus('Blue Noise asset unavailable.', 'error')
    return
  }

  settings.ditherMode = event.target.value
})

document.querySelector('#export-scale').addEventListener('input', (event) => {
  settings.exportSize = event.target.value
})

document.querySelector('#sequence-duration').addEventListener('input', (event) => {
  settings.sequenceDuration = event.target.value
  updateCaptureButtons()
})

document.querySelector('#sequence-fps').addEventListener('input', (event) => {
  settings.sequenceFps = event.target.value
})

const freezeToggleButton = document.querySelector('#freeze-toggle')
const resetControlsButton = document.querySelector('#reset-controls')
const exportPngButton = document.querySelector('#export-png')
const exportSequenceButton = document.querySelector('#export-sequence')
const exportWebmButton = document.querySelector('#export-webm')
const stopCaptureButton = document.querySelector('#stop-capture')
const fullscreenToggleButton = document.querySelector('#fullscreen-toggle')

sourceTypeInput.addEventListener('input', async (event) => {
  await switchSource(event.target.value)
})

chooseFileButton.addEventListener('click', async () => {
  if (hasActiveCaptureOperation()) {
    return
  }

  await promptForFile()
})

fileInput.addEventListener('change', async (event) => {
  const [file] = event.target.files ?? []

  if (!file) {
    if (pendingSourceType) {
      pendingSourceType = null
      sourceTypeInput.value = currentSourceType
      updateSourceControls()
      setStatus('Source unchanged.', 'muted')
      return
    }

    updateSourceControls()
    if (isFileSource()) {
      setStatus('No file selected.', 'muted')
    }
    return
  }

  if (pendingSourceType) {
    resetFreezeState()
    stopCameraStream()
    clearLoadedFile()
    clearOutputCanvas()
    currentSourceType = pendingSourceType
    pendingSourceType = null
    setDebugPreview(currentSourceType)
    updateSourceControls()
    updateCaptureButtons()
  }

  await loadSelectedFile(file)
  updateCaptureButtons()
})

freezeToggleButton.addEventListener('click', () => {
  if (isStaticImageSource()) {
    return
  }

  isFrozen = !isFrozen
  updateFreezeButton()
})

resetControlsButton.addEventListener('click', () => {
  Object.assign(settings, DEFAULT_SETTINGS)
  resetFreezeState()
  syncControlValues()
})

exportPngButton.addEventListener('click', () => {
  if (!outputCanvas.width || !outputCanvas.height) {
    return
  }

  const exportTimestamp = formatExportTimestamp()
  const { canvas: exportCanvas, context: exportContext, width: exportWidth, height: exportHeight } = createExportCanvas()

  drawProcessedFrame(exportContext, exportWidth, exportHeight)

  const link = document.createElement('a')
  link.href = exportCanvas.toDataURL('image/png')
  link.download = createStillPngFilename(exportTimestamp)
  link.click()
})

exportWebmButton.addEventListener('click', async () => {
  if (!outputCanvas.width || !outputCanvas.height) {
    setStatus('Nothing to export yet.', 'error')
    return
  }

  if (isStaticImageSource()) {
    setStatus('WebM export is available for camera or video sources.', 'error')
    return
  }

  const mimeType = getSupportedWebmMimeType()

  if (!mimeType) {
    setStatus('WebM recording is unavailable in this browser.', 'error')
    return
  }

  const durationSeconds = getCaptureDurationSeconds()
  const framesPerSecond = Number(settings.sequenceFps)
  const exportTimestamp = formatExportTimestamp()
  const { canvas: exportCanvas, context: exportContext, width: exportWidth, height: exportHeight } = createExportCanvas()
  const stream = exportCanvas.captureStream(framesPerSecond)
  const recorder = new MediaRecorder(stream, { mimeType })
  const chunks = []
  let exportFailed = false
  let stopRequested = false

  drawProcessedFrame(exportContext, exportWidth, exportHeight)

  const stopped = new Promise((resolve, reject) => {
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data)
      }
    })

    recorder.addEventListener('stop', resolve, { once: true })
    recorder.addEventListener('error', () => {
      exportFailed = true
      reject(new Error('WebM recording failed.'))
    }, { once: true })
  })

  try {
    activeWebmCapture = {
      stop() {
        if (recorder.state !== 'inactive') {
          stopRequested = true
          recorder.stop()
        }
      },
    }
    updateCaptureButtons()
    setStatus(
      durationSeconds === null
        ? `Recording WebM at ${framesPerSecond} FPS until stopped...`
        : `Recording ${durationSeconds}s WebM at ${framesPerSecond} FPS...`,
      'muted',
    )
    recorder.start()

    const startTime = performance.now()

    if (durationSeconds === null) {
      let frameIndex = 0

      while (recorder.state !== 'inactive') {
        const targetTime = startTime + ((frameIndex * 1000) / framesPerSecond)
        await waitForCaptureTime(targetTime)

        if (recorder.state === 'inactive') {
          break
        }

        drawProcessedFrame(exportContext, exportWidth, exportHeight)
        frameIndex += 1
      }
    } else {
      const frameTotal = durationSeconds * framesPerSecond

      for (let frameIndex = 0; frameIndex < frameTotal; frameIndex += 1) {
        const targetTime = startTime + ((frameIndex * 1000) / framesPerSecond)
        await waitForCaptureTime(targetTime)
        drawProcessedFrame(exportContext, exportWidth, exportHeight)
      }

      await waitForTimeout(1000 / framesPerSecond)
      recorder.stop()
    }
    await stopped

    const blob = new Blob(chunks, { type: mimeType })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = downloadUrl
    link.download = createWebmFilename(exportTimestamp)
    link.click()

    URL.revokeObjectURL(downloadUrl)
    setStatus(stopRequested ? 'WebM capture stopped and saved.' : 'WebM export saved.', 'success')
  } catch {
    if (!exportFailed && recorder.state !== 'inactive') {
      recorder.stop()
    }

    setStatus('WebM export failed.', 'error')
  } finally {
    activeWebmCapture = null
    stream.getTracks().forEach((track) => track.stop())
    updateCaptureButtons()
  }
})

stopCaptureButton.addEventListener('click', () => {
  if (!activeWebmCapture) {
    setStatus('No WebM capture is active.', 'muted')
    return
  }

  setStatus('Stopping WebM capture...', 'muted')
  activeWebmCapture.stop()
})

fullscreenToggleButton.addEventListener('click', async () => {
  if (!document.fullscreenEnabled || !mainPreviewFrame.requestFullscreen) {
    setStatus('Fullscreen is unavailable in this browser.', 'error')
    return
  }

  try {
    if (document.fullscreenElement === mainPreviewFrame) {
      await document.exitFullscreen()
      return
    }

    await mainPreviewFrame.requestFullscreen()
  } catch {
    setStatus('Fullscreen toggle failed.', 'error')
  }
})

document.addEventListener('fullscreenchange', updateFullscreenButton)

exportSequenceButton.addEventListener('click', async () => {
  if (!outputCanvas.width || !outputCanvas.height) {
    setStatus('Nothing to export yet.', 'error')
    return
  }

  if (isStaticImageSource()) {
    setStatus('PNG sequence export is available for camera or video sources.', 'error')
    return
  }

  if (!window.showDirectoryPicker) {
    setStatus('PNG sequence export needs the File System Access API in Chrome desktop.', 'error')
    return
  }

  if (isUnlimitedCaptureDuration()) {
    setStatus('Until stop is currently available for WebM export only.', 'error')
    return
  }

  try {
    isSequenceExporting = true
    updateCaptureButtons()
    setStatus('Choose a folder for the PNG sequence export...', 'muted')
    const directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
    const durationSeconds = getCaptureDurationSeconds()
    const framesPerSecond = Number(settings.sequenceFps)
    const frameTotal = durationSeconds * framesPerSecond
    const exportTimestamp = formatExportTimestamp()
    const { canvas: exportCanvas, context: exportContext, width: exportWidth, height: exportHeight } = createExportCanvas()

    setStatus(`Exporting ${frameTotal} PNG frames...`, 'muted')

    const startTime = performance.now()

    for (let frameIndex = 0; frameIndex < frameTotal; frameIndex += 1) {
      const targetTime = startTime + ((frameIndex * 1000) / framesPerSecond)
      await waitForCaptureTime(targetTime)

      drawProcessedFrame(exportContext, exportWidth, exportHeight)

      const blob = await canvasToBlob(exportCanvas)
      const fileName = createSequenceFrameFilename(exportTimestamp, frameIndex + 1)
      const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true })
      const writable = await fileHandle.createWritable()

      await writable.write(blob)
      await writable.close()
    }

    setStatus(`PNG sequence saved: ${frameTotal} frames.`, 'success')
  } catch (error) {
    if (error?.name === 'AbortError') {
      setStatus('PNG sequence export canceled.', 'muted')
      return
    }

    setStatus('PNG sequence export failed.', 'error')
  } finally {
    isSequenceExporting = false
    updateCaptureButtons()
  }
})

function renderFrame() {
  if (!hasRenderableSource()) {
    frameId = requestAnimationFrame(renderFrame)
    return
  }

  const { width: mediaWidth, height: mediaHeight } = getRenderableDimensions()

  if (!mediaWidth || !mediaHeight) {
    frameId = requestAnimationFrame(renderFrame)
    return
  }

  const sourceRegion = getSourceRegion(mediaWidth, mediaHeight)
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
    updateCaptureButtons()
  }

  if (!isFrozen || isStaticImageSource()) {
    drawSourceFrame(sourceWidth, sourceHeight, sourceRegion)
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

  setDebugPreview(SOURCE_TYPES.camera)
  setStatus('Requesting camera...', 'muted')

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })

    videoEl.srcObject = cameraStream
    await videoEl.play()
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
updateSourceControls()
updateFreezeButton()
updateFullscreenButton()
updateCaptureButtons()
setDebugPreview(currentSourceType)
startRenderLoop()

try {
  blueNoiseThresholdMap = await loadBlueNoiseThresholdMap()
} catch (error) {
  blueNoiseLoadFailed = true
  console.error(error)
  setStatus('Blue Noise asset failed to load.', 'error')
}

await startCamera()

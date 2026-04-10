import './style.css'

const app = document.querySelector('#app')
const LIVE_BITMAP_WIDTH_MAX = 640
const DEFAULT_ASCII_CHARSET = '@%#*+=-:. '
const IH_MARK_URL = `${import.meta.env.BASE_URL}IH.svg`
const ASCII_FONT_MODES = {
  monospace: 'monospace',
  studio: 'studio',
  zanco: 'zanco',
  uploaded: 'uploaded',
}
const ASCII_BUILTIN_CUSTOM_FONTS = {
  [ASCII_FONT_MODES.studio]: {
    label: 'Serrucho 100',
    family: 'GlyphSignalAsciiSerrucho',
    url: `${import.meta.env.BASE_URL}fonts/IHSerrucho-100.otf`,
  },
  [ASCII_FONT_MODES.zanco]: {
    label: 'Zanco Bold',
    family: 'GlyphSignalAsciiZanco',
    url: `${import.meta.env.BASE_URL}fonts/Zanco-Bold.otf`,
  },
}
const ASCII_GLYPH_SIZE_MIN = 4
const ASCII_GLYPH_SIZE_MAX = 240
const ASCII_MIN_ADVANCE_RATIO = 0.5
const ASCII_HORIZONTAL_MIN_ADVANCE_RATIO = 0.08
const ASCII_FONT_UPLOAD_ACCEPT = '.otf,.ttf,.woff,.woff2'
const ASCII_FONT_UPLOAD_EXTENSIONS = new Set(['otf', 'ttf', 'woff', 'woff2'])
const RENDER_MODES = {
  bitmap: 'bitmap',
  ascii: 'ascii',
}
const ASCII_PRESET_IDS = {
  terminal: 'terminal',
  dense: 'dense',
  clean: 'clean',
  blocks: 'blocks',
  blueprint: 'blueprint',
  minimal: 'minimal',
  custom: 'custom',
}
const ASCII_PRESETS = {
  [ASCII_PRESET_IDS.terminal]: {
    label: 'Terminal',
    columns: 96,
    characterSet: '@%#*+=-:. ',
    allCaps: false,
    cellWidth: 10,
    cellHeight: 16,
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontWeight: '700',
    fontSizeRatio: 0.9,
    horizontalBias: 0,
    verticalBias: -0.03,
  },
  [ASCII_PRESET_IDS.dense]: {
    label: 'Dense',
    columns: 124,
    characterSet: '@#W$9876543210?!abc;:+=-,._ ',
    allCaps: true,
    cellWidth: 8,
    cellHeight: 12,
    fontFamily: '"Courier New", "Consolas", monospace',
    fontWeight: '700',
    fontSizeRatio: 0.96,
    horizontalBias: 0,
    verticalBias: -0.02,
  },
  [ASCII_PRESET_IDS.clean]: {
    label: 'Clean',
    columns: 88,
    characterSet: '@#*+=-. ',
    allCaps: false,
    cellWidth: 11,
    cellHeight: 18,
    fontFamily: '"SFMono-Regular", "Cascadia Mono", "Consolas", monospace',
    fontWeight: '500',
    fontSizeRatio: 0.78,
    horizontalBias: 0,
    verticalBias: -0.01,
  },
  [ASCII_PRESET_IDS.blocks]: {
    label: 'Blocks',
    characterSet: '\u2588\u2593\u2592\u2591 ',
    columns: 92,
    allCaps: false,
    cellWidth: 12,
    cellHeight: 14,
    fontFamily: '"Courier New", "Consolas", monospace',
    fontWeight: '700',
    fontSizeRatio: 1,
    horizontalBias: 0,
    verticalBias: -0.05,
  },
  [ASCII_PRESET_IDS.blueprint]: {
    label: 'Blueprint',
    columns: 100,
    characterSet: 'WMNXK0Okxdolc:.. ',
    allCaps: true,
    cellWidth: 10,
    cellHeight: 16,
    fontFamily: '"Lucida Console", "Courier New", monospace',
    fontWeight: '400',
    fontSizeRatio: 0.82,
    horizontalBias: 0.02,
    verticalBias: -0.04,
  },
  [ASCII_PRESET_IDS.minimal]: {
    label: 'Minimal',
    columns: 72,
    characterSet: '#*=. ',
    allCaps: false,
    cellWidth: 14,
    cellHeight: 22,
    fontFamily: '"SFMono-Regular", "Menlo", "Consolas", monospace',
    fontWeight: '400',
    fontSizeRatio: 0.7,
    horizontalBias: 0,
    verticalBias: -0.01,
  },
}
const DEFAULT_ASCII_PRESET = ASCII_PRESET_IDS.terminal
const SOURCE_TYPES = {
  camera: 'camera',
  image: 'image',
  video: 'video',
}
const DEFAULT_SETTINGS = {
  renderMode: RENDER_MODES.bitmap,
  pixelWidth: 96,
  asciiPreset: DEFAULT_ASCII_PRESET,
  asciiColumns: ASCII_PRESETS[DEFAULT_ASCII_PRESET].columns,
  asciiCharacterSet: ASCII_PRESETS[DEFAULT_ASCII_PRESET].characterSet,
  asciiAllCaps: ASCII_PRESETS[DEFAULT_ASCII_PRESET].allCaps,
  asciiCellWidth: ASCII_PRESETS[DEFAULT_ASCII_PRESET].cellWidth,
  asciiCellHeight: ASCII_PRESETS[DEFAULT_ASCII_PRESET].cellHeight,
  asciiFontFamily: ASCII_PRESETS[DEFAULT_ASCII_PRESET].fontFamily,
  asciiFontWeight: ASCII_PRESETS[DEFAULT_ASCII_PRESET].fontWeight,
  asciiFontSizeRatio: ASCII_PRESETS[DEFAULT_ASCII_PRESET].fontSizeRatio,
  asciiHorizontalBias: ASCII_PRESETS[DEFAULT_ASCII_PRESET].horizontalBias,
  asciiVerticalBias: ASCII_PRESETS[DEFAULT_ASCII_PRESET].verticalBias,
  asciiFontMode: ASCII_FONT_MODES.monospace,
  asciiLetterSpacing: 0,
  asciiLineSpacing: 0,
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
const CONTROL_CONFIGS = {
  'pixel-width': {
    settingKey: 'pixelWidth',
    formatter: formatBitmapWidth,
  },
  'ascii-columns': {
    settingKey: 'asciiColumns',
    formatter: formatGlyphSize,
    fromControlValue: glyphSizeToAsciiColumns,
    toControlValue: asciiColumnsToGlyphSize,
  },
  'ascii-letter-spacing': {
    settingKey: 'asciiLetterSpacing',
  },
  'ascii-line-spacing': {
    settingKey: 'asciiLineSpacing',
  },
  brightness: {},
  contrast: {
    formatter: (value) => value.toFixed(2),
  },
  threshold: {},
}

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
        <div class="panel-brand">
          <span class="eyebrow-mark" aria-hidden="true" style="--mark-url: url('${IH_MARK_URL}')"></span>
          <p class="eyebrow">Glyph Signal Lab</p>
        </div>
        <p class="status" id="camera-status" aria-live="polite">Requesting camera...</p>
      </div>

      <div class="studio-layout">
        <section class="preview-column">
          <div class="preview-frame preview-frame-main" id="main-preview-frame">
            <canvas
              id="pixel-output"
              class="pixel-output"
              aria-label="Processed source output"
            ></canvas>
            <button
              id="fullscreen-toggle"
              class="preview-overlay-button"
              type="button"
              aria-label="Enter fullscreen"
              title="Toggle fullscreen"
            >Fullscreen</button>
          </div>
        </section>

        <aside class="tools-column">
          <section class="tools-panel" aria-label="Render controls">
            <div class="tools-grid">
              <div class="controls-section controls-section-input">
                <div class="controls-section-label">Input</div>

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
                  <span>Render Mode</span>
                  <select id="render-mode">
                    <option value="bitmap" selected>Bitmap</option>
                    <option value="ascii">ASCII</option>
                  </select>
                </label>

                <label class="control" id="dither-mode-control">
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

                <label class="control" id="ascii-preset-control" hidden>
                  <span>ASCII Preset</span>
                  <select id="ascii-preset">
                    <option value="terminal">Terminal</option>
                    <option value="dense">Dense</option>
                    <option value="clean">Clean</option>
                    <option value="blocks">Blocks</option>
                    <option value="blueprint">Blueprint</option>
                    <option value="minimal">Minimal</option>
                    <option value="custom">Custom</option>
                  </select>
                </label>
              </div>

              <div class="controls-section controls-section-render">
                <div class="controls-section-label">Render</div>

                <label class="control" id="pixel-width-control">
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

                <label class="control" id="ascii-columns-control" hidden>
                  <span>Glyph Size</span>
                  <input
                    id="ascii-columns"
                    type="range"
                    min="${ASCII_GLYPH_SIZE_MIN}"
                    max="${ASCII_GLYPH_SIZE_MAX}"
                    step="1"
                    value="${settings.asciiColumns}"
                  />
                  <output id="ascii-columns-value">${formatGlyphSize(settings.asciiColumns)}</output>
                </label>

                <label class="control" id="ascii-charset-control" hidden>
                  <span>Character Set</span>
                  <input
                    id="ascii-charset"
                    type="text"
                    value="${settings.asciiCharacterSet.replace(/"/g, '&quot;')}"
                    spellcheck="false"
                    autocomplete="off"
                  />
                  <small class="control-note">Characters are used left to right: dark to light.</small>
                </label>

                <label class="control" id="ascii-font-control" hidden>
                  <span>ASCII Font</span>
                  <select id="ascii-font">
                    <option value="monospace" selected>Monospace</option>
                    <option value="studio" disabled>Serrucho 100</option>
                    <option value="zanco" disabled>Zanco Bold</option>
                  </select>
                  <small class="control-note" id="ascii-font-note">Custom ASCII fonts loading...</small>
                </label>

                <div class="control control-actions" id="ascii-upload-font-control" hidden>
                  <span>Custom Font</span>
                  <div class="button-row">
                    <button id="choose-font" type="button" class="button-secondary">Choose Font</button>
                  </div>
                  <small class="control-note" id="ascii-upload-font-note">No custom font loaded.</small>
                </div>

                <label class="control control-toggle" id="ascii-all-caps-control" hidden>
                  <span>All Caps</span>
                  <input id="ascii-all-caps" type="checkbox" />
                </label>

              <label class="control" id="ascii-letter-spacing-control" hidden>
                <span>Letter Spacing</span>
                <input
                  id="ascii-letter-spacing"
                  type="range"
                  min="-20"
                  max="20"
                  step="1"
                  value="${settings.asciiLetterSpacing}"
                />
                <output id="ascii-letter-spacing-value">${settings.asciiLetterSpacing}</output>
                </label>

              <label class="control" id="ascii-line-spacing-control" hidden>
                <span>Line Spacing</span>
                <input
                  id="ascii-line-spacing"
                  type="range"
                  min="-20"
                  max="24"
                  step="1"
                  value="${settings.asciiLineSpacing}"
                />
                <output id="ascii-line-spacing-value">${settings.asciiLineSpacing}</output>
                </label>
              </div>

              <div class="controls-section controls-section-export">
                <div class="controls-section-label">Export</div>

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
              </div>

              <div class="controls-section controls-section-image">
                <div class="controls-section-label">Image</div>

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

                <label class="control" id="threshold-control">
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
              </div>

              <div class="controls-section controls-section-color">
                <div class="controls-section-label">Color</div>

                <label class="control">
                  <span>Background</span>
                  <input id="background-color" type="color" value="${settings.backgroundColor}" />
                </label>

                <label class="control">
                  <span>Foreground</span>
                  <input id="foreground-color" type="color" value="${settings.foregroundColor}" />
                </label>
              </div>

              <div class="debug-panel controls-section controls-section-raw">
                <button
                  id="raw-preview-toggle"
                  class="debug-toggle"
                  type="button"
                  aria-expanded="true"
                  aria-controls="raw-preview-region"
                >
                  <span class="debug-label" id="debug-label">Raw camera preview</span>
                  <span class="debug-toggle-chevron" aria-hidden="true"></span>
                </button>
                <div id="raw-preview-region" class="debug-panel-body">
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
            </div>
          </section>
        </aside>
      </div>
    </section>
  </main>
`

const statusEl = document.querySelector('#camera-status')
const sourceTypeInput = document.querySelector('#source-type')
const renderModeInput = document.querySelector('#render-mode')
const asciiPresetInput = document.querySelector('#ascii-preset')
const chooseFileButton = document.querySelector('#choose-file')
const sourceFileNote = document.querySelector('#source-file-note')
const debugLabel = document.querySelector('#debug-label')
const rawPreviewToggleButton = document.querySelector('#raw-preview-toggle')
const rawPreviewRegion = document.querySelector('#raw-preview-region')
const videoEl = document.querySelector('#camera-preview')
const imageEl = document.querySelector('#image-preview')
const outputCanvas = document.querySelector('#pixel-output')
const outputContext = outputCanvas.getContext('2d')
const mainPreviewFrame = document.querySelector('#main-preview-frame')
const fileInput = document.createElement('input')
const fontUploadInput = document.createElement('input')
const asciiPresetControl = document.querySelector('#ascii-preset-control')
const pixelWidthControl = document.querySelector('#pixel-width-control')
const thresholdControl = document.querySelector('#threshold-control')
const ditherModeControl = document.querySelector('#dither-mode-control')
const asciiColumnsControl = document.querySelector('#ascii-columns-control')
const asciiCharsetInput = document.querySelector('#ascii-charset')
const asciiCharsetControl = document.querySelector('#ascii-charset-control')
const asciiFontInput = document.querySelector('#ascii-font')
const asciiFontControl = document.querySelector('#ascii-font-control')
const asciiFontNote = document.querySelector('#ascii-font-note')
const asciiUploadFontControl = document.querySelector('#ascii-upload-font-control')
const chooseFontButton = document.querySelector('#choose-font')
const asciiUploadFontNote = document.querySelector('#ascii-upload-font-note')
const asciiAllCapsControl = document.querySelector('#ascii-all-caps-control')
const asciiLetterSpacingControl = document.querySelector('#ascii-letter-spacing-control')
const asciiLineSpacingControl = document.querySelector('#ascii-line-spacing-control')

fileInput.type = 'file'
fileInput.hidden = true
fontUploadInput.type = 'file'
fontUploadInput.hidden = true
fontUploadInput.accept = ASCII_FONT_UPLOAD_ACCEPT
app.append(fileInput)
app.append(fontUploadInput)

const sourceCanvas = document.createElement('canvas')
const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true })
const asciiSourceCanvas = document.createElement('canvas')
const asciiSourceContext = asciiSourceCanvas.getContext('2d')
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
const asciiCustomFontStatuses = Object.fromEntries(
  Object.keys(ASCII_BUILTIN_CUSTOM_FONTS).map((mode) => [mode, 'loading']),
)
let asciiUploadedFont = null
let asciiUploadedFontGeneration = 0
let asciiUploadFontNoteMessage = 'No custom font loaded.'
let hasAsciiSourceFrame = false
let previewResizeObserver = null
const asciiPreviewSize = {
  width: 0,
  height: 0,
}

outputContext.imageSmoothingEnabled = false
sourceContext.imageSmoothingEnabled = false
asciiSourceContext.imageSmoothingEnabled = false

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

function isAsciiMode() {
  return settings.renderMode === RENDER_MODES.ascii
}

function getAsciiStyleSettings() {
  return {
    cellWidth: settings.asciiCellWidth,
    cellHeight: settings.asciiCellHeight,
    fontFamily: getActiveAsciiFontFamily(),
    fontWeight: settings.asciiFontWeight,
    fontSizeRatio: settings.asciiFontSizeRatio,
    horizontalBias: settings.asciiHorizontalBias,
    verticalBias: settings.asciiVerticalBias,
    letterSpacing: settings.asciiLetterSpacing,
    lineSpacing: settings.asciiLineSpacing,
  }
}

function getAsciiCustomFontDefinition(mode) {
  if (mode === ASCII_FONT_MODES.uploaded) {
    return asciiUploadedFont
  }

  return ASCII_BUILTIN_CUSTOM_FONTS[mode] ?? null
}

function getActiveAsciiFontFamily() {
  const customFont = getAsciiCustomFontDefinition(settings.asciiFontMode)

  if (customFont && asciiCustomFontStatuses[settings.asciiFontMode] === 'loaded') {
    return `"${customFont.family}", ${settings.asciiFontFamily}`
  }

  return settings.asciiFontFamily
}

function clampAsciiAdvance(advance, cellSize, minAdvanceRatio = ASCII_MIN_ADVANCE_RATIO) {
  return Math.max(
    Math.max(1, cellSize * minAdvanceRatio),
    advance,
  )
}

function getFittedAsciiTrackCount(targetSize, cellSize, advance) {
  if (targetSize <= cellSize) {
    return 1
  }

  return Math.max(1, Math.floor((targetSize - cellSize) / advance) + 1)
}

function getAsciiRenderLayoutMetrics(targetWidth, targetHeight) {
  const {
    cellWidth: referenceCellWidth,
    cellHeight: referenceCellHeight,
    fontWeight,
    fontFamily,
    fontSizeRatio,
    horizontalBias,
    verticalBias,
    letterSpacing,
    lineSpacing,
  } = getAsciiStyleSettings()
  const requestedColumns = Math.max(ASCII_GLYPH_SIZE_MIN, settings.asciiColumns)
  const cellWidth = targetWidth / requestedColumns
  const glyphScale = cellWidth / referenceCellWidth
  const cellHeight = referenceCellHeight * glyphScale
  const horizontalAdvance = clampAsciiAdvance(
    cellWidth + (letterSpacing * glyphScale),
    cellWidth,
    ASCII_HORIZONTAL_MIN_ADVANCE_RATIO,
  )
  const verticalAdvance = clampAsciiAdvance(cellHeight + (lineSpacing * glyphScale), cellHeight)
  const columns = getFittedAsciiTrackCount(targetWidth, cellWidth, horizontalAdvance)
  const rows = getFittedAsciiTrackCount(targetHeight, cellHeight, verticalAdvance)
  const gridWidth = cellWidth + (Math.max(0, columns - 1) * horizontalAdvance)
  const gridHeight = cellHeight + (Math.max(0, rows - 1) * verticalAdvance)

  return {
    cellWidth,
    cellHeight,
    fontWeight,
    fontFamily,
    fontSize: Math.max(8, Math.round(cellHeight * fontSizeRatio)),
    horizontalBias,
    verticalBias,
    columns,
    rows,
    horizontalAdvance,
    verticalAdvance,
    offsetX: (targetWidth - gridWidth) / 2,
    offsetY: (targetHeight - gridHeight) / 2,
  }
}

function getAsciiCustomFontStatus(mode) {
  return asciiCustomFontStatuses[mode] ?? 'failed'
}

function updateAsciiUploadFontNote(message = 'No custom font loaded.') {
  asciiUploadFontNoteMessage = message
  asciiUploadFontNote.textContent = message
}

function getAsciiFontNoteText() {
  const selectedCustomFont = getAsciiCustomFontDefinition(settings.asciiFontMode)

  if (selectedCustomFont) {
    const selectedStatus = getAsciiCustomFontStatus(settings.asciiFontMode)
    return selectedStatus === 'loaded'
      ? `${selectedCustomFont.label} ready.`
      : selectedStatus === 'failed'
        ? `${selectedCustomFont.label} failed to load. Using monospace.`
        : `${selectedCustomFont.label} loading...`
  }

  const customFontStatuses = Object.values(asciiCustomFontStatuses)

  if (customFontStatuses.every((status) => status === 'loaded')) {
    return 'Custom ASCII fonts ready.'
  }

  if (customFontStatuses.some((status) => status === 'loading')) {
    return 'Custom ASCII fonts loading...'
  }

  if (customFontStatuses.some((status) => status === 'loaded')) {
    return 'Some custom ASCII fonts unavailable.'
  }

  return 'Custom ASCII fonts unavailable. Using monospace.'
}

function updateAsciiFontUi() {
  for (const mode of Object.keys(ASCII_BUILTIN_CUSTOM_FONTS)) {
    const option = asciiFontInput.querySelector(`option[value="${mode}"]`)

    if (option) {
      option.disabled = getAsciiCustomFontStatus(mode) !== 'loaded'
    }
  }

  const uploadedOption = asciiFontInput.querySelector(`option[value="${ASCII_FONT_MODES.uploaded}"]`)

  if (asciiUploadedFont && getAsciiCustomFontStatus(ASCII_FONT_MODES.uploaded) === 'loaded') {
    if (!uploadedOption) {
      const option = document.createElement('option')
      option.value = ASCII_FONT_MODES.uploaded
      option.textContent = 'Uploaded Font'
      asciiFontInput.append(option)
    }
  } else if (uploadedOption) {
    uploadedOption.remove()
  }

  if (uploadedOption || asciiFontInput.querySelector(`option[value="${ASCII_FONT_MODES.uploaded}"]`)) {
    const option = asciiFontInput.querySelector(`option[value="${ASCII_FONT_MODES.uploaded}"]`)

    if (option) {
      option.disabled = getAsciiCustomFontStatus(ASCII_FONT_MODES.uploaded) !== 'loaded'
    }
  }

  if (getAsciiCustomFontDefinition(settings.asciiFontMode) && getAsciiCustomFontStatus(settings.asciiFontMode) !== 'loaded') {
    settings.asciiFontMode = ASCII_FONT_MODES.monospace
  }

  asciiFontInput.value = settings.asciiFontMode
  asciiFontNote.textContent = getAsciiFontNoteText()
}

async function loadAsciiCustomFonts() {
  if (!('FontFace' in window) || !document.fonts) {
    for (const mode of Object.keys(ASCII_BUILTIN_CUSTOM_FONTS)) {
      asciiCustomFontStatuses[mode] = 'failed'
    }

    updateAsciiFontUi()
    setStatus('Custom ASCII fonts could not load. Using monospace.', 'error')
    return
  }

  const customFontEntries = Object.entries(ASCII_BUILTIN_CUSTOM_FONTS)
  const results = await Promise.allSettled(
    customFontEntries.map(async ([mode, customFont]) => {
      const fontFace = new FontFace(customFont.family, `url(${customFont.url})`)
      const loadedFontFace = await fontFace.load()
      document.fonts.add(loadedFontFace)
      asciiCustomFontStatuses[mode] = 'loaded'
    }),
  )

  let failedCount = 0

  results.forEach((result, index) => {
    const [mode] = customFontEntries[index]

    if (result.status === 'rejected') {
      asciiCustomFontStatuses[mode] = 'failed'
      failedCount += 1
      console.error(result.reason)
      return
    }

    asciiCustomFontStatuses[mode] = 'loaded'
  })

  updateAsciiFontUi()

  if (failedCount === customFontEntries.length) {
    setStatus('Custom ASCII fonts could not load. Using monospace.', 'error')
  }
}

function getAsciiUploadedFontName() {
  return asciiUploadedFont?.fileName ?? ''
}

function getFontFileExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

function isAcceptedFontFile(file) {
  return ASCII_FONT_UPLOAD_EXTENSIONS.has(getFontFileExtension(file.name))
}

function cleanupAsciiUploadedFont() {
  if (!asciiUploadedFont) {
    asciiCustomFontStatuses[ASCII_FONT_MODES.uploaded] = 'failed'
    return
  }

  if (asciiUploadedFont.fontFace && document.fonts?.delete) {
    document.fonts.delete(asciiUploadedFont.fontFace)
  }

  if (asciiUploadedFont.url) {
    URL.revokeObjectURL(asciiUploadedFont.url)
  }

  asciiUploadedFont = null
  asciiCustomFontStatuses[ASCII_FONT_MODES.uploaded] = 'failed'
}

async function loadUploadedAsciiFont(file) {
  if (!('FontFace' in window) || !document.fonts) {
    updateAsciiUploadFontNote('Font uploads unsupported here.')
    setStatus('Custom font upload unavailable in this browser.', 'error')
    return
  }

  if (!isAcceptedFontFile(file)) {
    updateAsciiUploadFontNote('Unsupported font file.')
    setStatus('Font upload failed.', 'error')
    return
  }

  const nextUrl = URL.createObjectURL(file)
  const nextFamily = `GlyphSignalAsciiUploaded${++asciiUploadedFontGeneration}`
  const fontFace = new FontFace(nextFamily, `url(${nextUrl})`)

  asciiCustomFontStatuses[ASCII_FONT_MODES.uploaded] = 'loading'
  updateAsciiUploadFontNote('Loading font...')
  updateAsciiFontUi()

  try {
    const loadedFontFace = await fontFace.load()
    document.fonts.add(loadedFontFace)

    const previousSelectedMode = settings.asciiFontMode

    cleanupAsciiUploadedFont()
    asciiUploadedFont = {
      label: 'Uploaded Font',
      family: nextFamily,
      fileName: file.name,
      url: nextUrl,
      fontFace: loadedFontFace,
    }
    asciiCustomFontStatuses[ASCII_FONT_MODES.uploaded] = 'loaded'
    settings.asciiFontMode = ASCII_FONT_MODES.uploaded
    asciiFontInput.value = ASCII_FONT_MODES.uploaded
    updateAsciiUploadFontNote(file.name)
    updateAsciiFontUi()
    markAsciiPresetCustom()

    if (previousSelectedMode !== ASCII_FONT_MODES.uploaded) {
      setStatus('Uploaded font ready.', 'success')
    } else {
      setStatus('Uploaded font replaced.', 'success')
    }
  } catch (error) {
    URL.revokeObjectURL(nextUrl)
    asciiCustomFontStatuses[ASCII_FONT_MODES.uploaded] = asciiUploadedFont ? 'loaded' : 'failed'
    updateAsciiUploadFontNote(asciiUploadedFont ? 'Font load failed. Keeping previous upload.' : 'Font load failed.')
    updateAsciiFontUi()
    console.error(error)
    setStatus('Font upload failed.', 'error')
  }
}

function applyAsciiPreset(presetId) {
  const preset = ASCII_PRESETS[presetId]

  if (!preset) {
    return
  }

  settings.asciiPreset = presetId
  settings.asciiColumns = preset.columns
  settings.asciiCharacterSet = preset.characterSet
  settings.asciiAllCaps = preset.allCaps
  settings.asciiCellWidth = preset.cellWidth
  settings.asciiCellHeight = preset.cellHeight
  settings.asciiFontFamily = preset.fontFamily
  settings.asciiFontWeight = preset.fontWeight
  settings.asciiFontSizeRatio = preset.fontSizeRatio
  settings.asciiHorizontalBias = preset.horizontalBias
  settings.asciiVerticalBias = preset.verticalBias
}

function markAsciiPresetCustom() {
  if (settings.asciiPreset === ASCII_PRESET_IDS.custom) {
    return
  }

  settings.asciiPreset = ASCII_PRESET_IDS.custom
  asciiPresetInput.value = ASCII_PRESET_IDS.custom
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

function clampByte(value) {
  return Math.max(0, Math.min(255, value))
}

function getBaseLuminance(red, green, blue) {
  return (0.299 * red) + (0.587 * green) + (0.114 * blue)
}

function adjustLuminance(luminance) {
  const adjusted = ((luminance - 128) * settings.contrast) + 128 + settings.brightness

  return clampByte(adjusted)
}

function getAdjustedLuminance(red, green, blue) {
  return adjustLuminance(getBaseLuminance(red, green, blue))
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
    const clipped = getAdjustedLuminance(data[i], data[i + 1], data[i + 2])
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

function getAsciiCharacterSet() {
  const charset = settings.asciiCharacterSet || DEFAULT_ASCII_CHARSET
  const normalized = settings.asciiAllCaps ? charset.toUpperCase() : charset

  return normalized.length ? normalized : DEFAULT_ASCII_CHARSET
}

function analyzeAsciiFrame(columns, rows) {
  const frame = sourceContext.getImageData(0, 0, columns, rows)
  const { data } = frame
  const luminanceGrid = new Uint8ClampedArray(columns * rows)

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const pixelIndex = (y * columns) + x
      const index = pixelIndex * 4

      luminanceGrid[pixelIndex] = Math.round(getBaseLuminance(data[index], data[index + 1], data[index + 2]))
    }
  }

  return {
    columns,
    rows,
    luminanceGrid,
  }
}

function analyzeAsciiSourceFrame(columns, rows) {
  resizeCanvas(sourceCanvas, sourceContext, columns, rows)
  sourceContext.clearRect(0, 0, columns, rows)
  sourceContext.drawImage(asciiSourceCanvas, 0, 0, columns, rows)

  return analyzeAsciiFrame(columns, rows)
}

function captureAsciiSourceFrame(sourceRegion) {
  const width = Math.max(1, Math.round(sourceRegion.width))
  const height = Math.max(1, Math.round(sourceRegion.height))

  resizeCanvas(asciiSourceCanvas, asciiSourceContext, width, height)
  asciiSourceContext.clearRect(0, 0, width, height)
  asciiSourceContext.drawImage(
    getCurrentSourceElement(),
    sourceRegion.x,
    sourceRegion.y,
    sourceRegion.width,
    sourceRegion.height,
    0,
    0,
    width,
    height,
  )
  hasAsciiSourceFrame = true
}

function renderAsciiToContext(context, targetWidth, targetHeight) {
  if (!hasAsciiSourceFrame) {
    context.clearRect(0, 0, targetWidth, targetHeight)
    return
  }

  const layout = getAsciiRenderLayoutMetrics(targetWidth, targetHeight)
  const { columns, rows, luminanceGrid } = analyzeAsciiSourceFrame(layout.columns, layout.rows)
  const characterSet = getAsciiCharacterSet()
  const thresholdBias = settings.threshold - 128
  const {
    cellWidth,
    cellHeight,
    horizontalAdvance,
    verticalAdvance,
    fontFamily,
    fontWeight,
    fontSize,
    horizontalBias,
    verticalBias,
    offsetX,
    offsetY,
  } = layout
  const halfCellWidth = cellWidth / 2
  const halfCellHeight = cellHeight / 2

  context.save()
  context.clearRect(0, 0, targetWidth, targetHeight)
  context.fillStyle = settings.backgroundColor
  context.fillRect(0, 0, targetWidth, targetHeight)
  context.fillStyle = settings.foregroundColor
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const index = (y * columns) + x
      const clipped = adjustLuminance(luminanceGrid[index])
      const biased = clampByte(clipped + thresholdBias)
      const normalized = settings.invert ? 1 - (biased / 255) : biased / 255
      const characterIndex = Math.min(
        characterSet.length - 1,
        Math.floor(normalized * (characterSet.length - 1)),
      )
      const character = characterSet[characterIndex]

      if (character === ' ') {
        continue
      }

      const centerX = offsetX + (x * horizontalAdvance) + (cellWidth * (0.5 + horizontalBias))
      const centerY = offsetY + (y * verticalAdvance) + (cellHeight * (0.5 + verticalBias))

      if (
        centerX + halfCellWidth < 0
        || centerX - halfCellWidth > targetWidth
        || centerY + halfCellHeight < 0
        || centerY - halfCellHeight > targetHeight
      ) {
        continue
      }

      context.fillText(
        character,
        Math.round(centerX),
        Math.round(centerY),
      )
    }
  }

  context.restore()
}

function updateAsciiPreviewSize(aspectRatio) {
  const rect = outputCanvas.getBoundingClientRect()
  const width = rect.width || outputCanvas.clientWidth || mainPreviewFrame.clientWidth || 1
  const height = rect.height || outputCanvas.clientHeight || (width / aspectRatio)

  asciiPreviewSize.width = Math.max(1, width)
  asciiPreviewSize.height = Math.max(1, height)
}

function getAsciiPreviewRenderSize(aspectRatio) {
  updateAsciiPreviewSize(aspectRatio)

  const devicePixelRatio = window.devicePixelRatio || 1

  return {
    width: Math.max(1, Math.round(asciiPreviewSize.width * devicePixelRatio)),
    height: Math.max(1, Math.round(asciiPreviewSize.height * devicePixelRatio)),
  }
}

function formatBitmapWidth(value) {
  return `${value}px wide`
}

function asciiColumnsToGlyphSize(value) {
  return (ASCII_GLYPH_SIZE_MAX + ASCII_GLYPH_SIZE_MIN) - value
}

function glyphSizeToAsciiColumns(value) {
  return asciiColumnsToGlyphSize(value)
}

function formatGlyphSize(value) {
  return String(asciiColumnsToGlyphSize(value))
}

function formatControlValue(id, value) {
  const formatter = CONTROL_CONFIGS[id]?.formatter ?? ((nextValue) => nextValue)
  return formatter(value)
}

function getControlStateValue(id, inputValue) {
  const fromControlValue = CONTROL_CONFIGS[id]?.fromControlValue ?? ((value) => value)
  return fromControlValue(inputValue)
}

function getDisplayControlValue(id, settingValue) {
  const toControlValue = CONTROL_CONFIGS[id]?.toControlValue ?? ((value) => value)
  return toControlValue(settingValue)
}

function getControlSettingKey(id) {
  return CONTROL_CONFIGS[id]?.settingKey ?? id
}

function clampToRangeStep(value, min, max, step, base = min) {
  const clampedValue = Math.min(max, Math.max(min, value))

  if (!Number.isFinite(step) || step <= 0) {
    return clampedValue
  }

  const precision = Math.max(
    0,
    ...[step, min, max, base]
      .filter((candidate) => Number.isFinite(candidate))
      .map((candidate) => {
        const decimals = String(candidate).split('.')[1]
        return decimals ? decimals.length : 0
      }),
  )
  const stepCount = Math.round((clampedValue - base) / step)

  return Number((base + (stepCount * step)).toFixed(precision))
}

function updateRangeInputVisual(input) {
  if (!input || input.type !== 'range') {
    return
  }

  const min = Number(input.min)
  const max = Number(input.max)
  const value = Number(input.value)

  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || !Number.isFinite(value)) {
    input.style.setProperty('--range-fill-percent', '50%')
    return
  }

  const percent = ((value - min) / (max - min)) * 100
  const clampedPercent = Math.min(100, Math.max(0, percent))
  input.style.setProperty('--range-fill-percent', `${clampedPercent}%`)
}

function applyInlineEditorValue(input, editorValue) {
  const min = Number(input.min)
  const max = Number(input.max)
  const step = input.step === 'any' ? Number.NaN : Number(input.step || '1')
  const parsedValue = Number(editorValue)

  if (editorValue.trim() === '' || !Number.isFinite(parsedValue)) {
    return false
  }

  const nextValue = clampToRangeStep(parsedValue, min, max, step)
  input.value = String(nextValue)
  input.dispatchEvent(new Event('input', { bubbles: true }))

  return true
}

function updateInlineOutputText(id, input, output) {
  const rawValue = input.type === 'range' ? Number(input.value) : input.checked
  const value = input.type === 'range' ? getControlStateValue(id, rawValue) : rawValue
  const formattedValue = formatControlValue(id, value)

  output.value = formattedValue
  output.textContent = formattedValue
}

function stepInlineEditorValue(input, editor, direction) {
  const min = Number(input.min)
  const max = Number(input.max)
  const step = input.step === 'any' ? 1 : Number(input.step || '1')
  const editorValue = Number(editor.value)
  const currentValue = Number.isFinite(editorValue) ? editorValue : Number(input.value)
  const nextValue = clampToRangeStep(currentValue + (step * direction), min, max, step)

  editor.value = String(nextValue)
  input.value = String(nextValue)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

function beginInlineOutputEdit(id, input, output) {
  if (!output || output.dataset.editing === 'true' || input.disabled) {
    return
  }

  const editorFrame = document.createElement('span')
  const editor = document.createElement('input')
  const stepper = document.createElement('span')
  const incrementButton = document.createElement('button')
  const decrementButton = document.createElement('button')
  let didFinalize = false
  const initialInputValue = input.value

  editorFrame.className = 'control-value-editor'
  editor.type = 'text'
  editor.inputMode = 'decimal'
  editor.className = 'control-value-editor-input'
  editor.value = input.value
  editor.setAttribute('aria-label', `Edit ${id} value`)
  stepper.className = 'control-value-editor-stepper'
  incrementButton.type = 'button'
  incrementButton.className = 'control-value-editor-step control-value-editor-step-up'
  incrementButton.setAttribute('aria-label', `Increase ${id} value`)
  decrementButton.type = 'button'
  decrementButton.className = 'control-value-editor-step control-value-editor-step-down'
  decrementButton.setAttribute('aria-label', `Decrease ${id} value`)

  const outputStyles = window.getComputedStyle(output)
  editorFrame.style.fontSize = outputStyles.fontSize
  editorFrame.style.fontWeight = outputStyles.fontWeight
  editorFrame.style.fontFamily = outputStyles.fontFamily
  editorFrame.style.lineHeight = outputStyles.lineHeight
  editorFrame.style.letterSpacing = outputStyles.letterSpacing
  editorFrame.style.textTransform = outputStyles.textTransform

  output.dataset.editing = 'true'
  stepper.append(incrementButton, decrementButton)
  editorFrame.append(editor, stepper)
  output.append(editorFrame)
  editor.focus()
  editor.select()

  const finish = (mode) => {
    if (didFinalize) {
      return
    }

    didFinalize = true

    if (mode === 'cancel') {
      input.value = initialInputValue
      input.dispatchEvent(new Event('input', { bubbles: true }))
    } else {
      applyInlineEditorValue(input, editor.value)
    }

    document.removeEventListener('pointerdown', handleOutsidePointerDown, true)
    editorFrame.remove()
    updateInlineOutputText(id, input, output)
    delete output.dataset.editing
  }

  const handleStep = (direction) => {
    stepInlineEditorValue(input, editor, direction)
    editor.focus()
    editor.select()
  }

  function handleOutsidePointerDown(event) {
    const eventPath = event.composedPath()

    if (eventPath.includes(editorFrame) || eventPath.includes(output)) {
      return
    }

    finish('commit')
  }

  editor.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      finish('commit')
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      finish('cancel')
    }
  })

  editorFrame.addEventListener('pointerdown', (event) => {
    event.stopPropagation()
  })

  editorFrame.addEventListener('click', (event) => {
    event.stopPropagation()
  })

  incrementButton.addEventListener('pointerdown', (event) => {
    event.preventDefault()
  })

  decrementButton.addEventListener('pointerdown', (event) => {
    event.preventDefault()
  })

  incrementButton.addEventListener('click', () => {
    handleStep(1)
  })

  decrementButton.addEventListener('click', () => {
    handleStep(-1)
  })

  const syncLiveValue = () => {
    applyInlineEditorValue(input, editor.value)
  }

  editor.addEventListener('input', syncLiveValue)
  editor.addEventListener('change', syncLiveValue)
  document.addEventListener('pointerdown', handleOutsidePointerDown, true)
}

function setControlDisabled(control, isDisabled) {
  if (!control) {
    return
  }

  control.dataset.disabled = String(isDisabled)

  const interactiveElements = control.querySelectorAll('input, select, button')

  interactiveElements.forEach((element) => {
    element.disabled = isDisabled
  })
}

function bindControl(id) {
  const input = document.querySelector(`#${id}`)
  const output = document.querySelector(`#${id}-value`)

  updateRangeInputVisual(input)

  input.addEventListener('input', () => {
    const rawValue = input.type === 'range' ? Number(input.value) : input.checked
    const value = input.type === 'range' ? getControlStateValue(id, rawValue) : rawValue
    const settingKey = getControlSettingKey(id)

    settings[settingKey] = value

    if (output) {
      const formattedValue = formatControlValue(id, value)

      if (output.dataset.editing !== 'true') {
        output.value = formattedValue
        output.textContent = formattedValue
      }
    }

    updateRangeInputVisual(input)
  })

  if (input.type === 'range' && output) {
    output.addEventListener('click', () => {
      beginInlineOutputEdit(id, input, output)
    })
  }
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
  hasAsciiSourceFrame = false
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

function updateRenderModeControls() {
  const showAsciiControls = isAsciiMode()

  asciiPresetControl.hidden = !showAsciiControls
  pixelWidthControl.hidden = showAsciiControls
  ditherModeControl.hidden = showAsciiControls
  asciiColumnsControl.hidden = !showAsciiControls
  asciiCharsetControl.hidden = !showAsciiControls
  asciiFontControl.hidden = !showAsciiControls
  asciiUploadFontControl.hidden = !showAsciiControls
  asciiAllCapsControl.hidden = !showAsciiControls
  asciiLetterSpacingControl.hidden = !showAsciiControls
  asciiLineSpacingControl.hidden = !showAsciiControls

  setControlDisabled(asciiPresetControl, !showAsciiControls)
  setControlDisabled(pixelWidthControl, showAsciiControls)
  setControlDisabled(ditherModeControl, showAsciiControls)
  setControlDisabled(asciiColumnsControl, !showAsciiControls)
  setControlDisabled(asciiCharsetControl, !showAsciiControls)
  setControlDisabled(asciiFontControl, !showAsciiControls)
  setControlDisabled(asciiUploadFontControl, !showAsciiControls)
  setControlDisabled(asciiAllCapsControl, !showAsciiControls)
  setControlDisabled(asciiLetterSpacingControl, !showAsciiControls)
  setControlDisabled(asciiLineSpacingControl, !showAsciiControls)
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
  const asciiColumnsInput = document.querySelector('#ascii-columns')
  const asciiColumnsValue = document.querySelector('#ascii-columns-value')
  const asciiFontInput = document.querySelector('#ascii-font')
  const asciiAllCapsInput = document.querySelector('#ascii-all-caps')
  const asciiLetterSpacingInput = document.querySelector('#ascii-letter-spacing')
  const asciiLetterSpacingValue = document.querySelector('#ascii-letter-spacing-value')
  const asciiLineSpacingInput = document.querySelector('#ascii-line-spacing')
  const asciiLineSpacingValue = document.querySelector('#ascii-line-spacing-value')
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

  renderModeInput.value = settings.renderMode
  asciiPresetInput.value = settings.asciiPreset

  pixelWidthInput.value = String(settings.pixelWidth)
  pixelWidthValue.value = formatBitmapWidth(settings.pixelWidth)
  pixelWidthValue.textContent = formatBitmapWidth(settings.pixelWidth)

  asciiColumnsInput.value = String(getDisplayControlValue('ascii-columns', settings.asciiColumns))
  asciiColumnsValue.value = formatGlyphSize(settings.asciiColumns)
  asciiColumnsValue.textContent = formatGlyphSize(settings.asciiColumns)
  asciiCharsetInput.value = settings.asciiCharacterSet
  asciiFontInput.value = settings.asciiFontMode
  chooseFontButton.disabled = false
  asciiAllCapsInput.checked = settings.asciiAllCaps
  asciiLetterSpacingInput.value = String(settings.asciiLetterSpacing)
  asciiLetterSpacingValue.value = String(settings.asciiLetterSpacing)
  asciiLetterSpacingValue.textContent = String(settings.asciiLetterSpacing)
  asciiLineSpacingInput.value = String(settings.asciiLineSpacing)
  asciiLineSpacingValue.value = String(settings.asciiLineSpacing)
  asciiLineSpacingValue.textContent = String(settings.asciiLineSpacing)

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
  updateAsciiFontUi()
  updateAsciiUploadFontNote(asciiUploadFontNoteMessage)
  updateRenderModeControls()
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
  if (isAsciiMode()) {
    if (!isFrozen || isStaticImageSource()) {
      const { width: mediaWidth, height: mediaHeight } = getRenderableDimensions()
      const sourceRegion = getSourceRegion(mediaWidth, mediaHeight)

      captureAsciiSourceFrame(sourceRegion)
    }

    renderAsciiToContext(context, width, height)
    return
  }

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

function setRawPreviewCollapsed(isCollapsed) {
  rawPreviewToggleButton.setAttribute('aria-expanded', String(!isCollapsed))
  rawPreviewRegion.hidden = isCollapsed
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

function resizeCanvas(canvas, context, width, height) {
  if (canvas.width === width && canvas.height === height) {
    return false
  }

  canvas.width = width
  canvas.height = height
  context.imageSmoothingEnabled = false
  return true
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

bindControl('pixel-width')
bindControl('ascii-columns')
bindControl('ascii-letter-spacing')
bindControl('ascii-line-spacing')
bindControl('brightness')
bindControl('contrast')
bindControl('threshold')

document.querySelector('#ascii-columns').addEventListener('input', () => {
  markAsciiPresetCustom()
})

asciiPresetInput.addEventListener('input', (event) => {
  applyAsciiPreset(event.target.value)
  syncControlValues()
})

asciiFontInput.addEventListener('input', (event) => {
  const selectedCustomFont = getAsciiCustomFontDefinition(event.target.value)

  if (selectedCustomFont && getAsciiCustomFontStatus(event.target.value) !== 'loaded') {
    settings.asciiFontMode = ASCII_FONT_MODES.monospace
    asciiFontInput.value = ASCII_FONT_MODES.monospace
    setStatus(`${selectedCustomFont.label} unavailable. Using monospace.`, 'error')
    return
  }

  settings.asciiFontMode = event.target.value
  markAsciiPresetCustom()
})

chooseFontButton.addEventListener('click', () => {
  fontUploadInput.value = ''
  fontUploadInput.click()
})

fontUploadInput.addEventListener('change', async (event) => {
  const [file] = event.target.files ?? []

  if (!file) {
    return
  }

  await loadUploadedAsciiFont(file)
})

renderModeInput.addEventListener('input', (event) => {
  settings.renderMode = event.target.value
  updateRenderModeControls()
})

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

asciiCharsetInput.addEventListener('input', (event) => {
  settings.asciiCharacterSet = event.target.value || DEFAULT_ASCII_CHARSET
  markAsciiPresetCustom()
})

document.querySelector('#ascii-all-caps').addEventListener('input', (event) => {
  settings.asciiAllCaps = event.target.checked
  markAsciiPresetCustom()
})

document.querySelector('#ascii-letter-spacing').addEventListener('input', () => {
  markAsciiPresetCustom()
})

document.querySelector('#ascii-line-spacing').addEventListener('input', () => {
  markAsciiPresetCustom()
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

rawPreviewToggleButton.addEventListener('click', () => {
  const isExpanded = rawPreviewToggleButton.getAttribute('aria-expanded') === 'true'
  setRawPreviewCollapsed(isExpanded)
})

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

window.addEventListener('beforeunload', () => {
  cleanupAsciiUploadedFont()
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

  if (isAsciiMode()) {
    const previewAspectRatio = sourceRegion.width / sourceRegion.height
    const { width: previewWidth, height: previewHeight } = getAsciiPreviewRenderSize(previewAspectRatio)

    if (!isFrozen || isStaticImageSource()) {
      captureAsciiSourceFrame(sourceRegion)
    }

    if (resizeCanvas(outputCanvas, outputContext, previewWidth, previewHeight)) {
      updateCaptureButtons()
    }

    renderAsciiToContext(outputContext, previewWidth, previewHeight)
  } else if (!isFrozen || isStaticImageSource()) {
    const sourceWidth = settings.pixelWidth
    const sourceHeight = Math.max(1, Math.round((sourceRegion.height / sourceRegion.width) * sourceWidth))

    resizeCanvas(sourceCanvas, sourceContext, sourceWidth, sourceHeight)
    if (resizeCanvas(outputCanvas, outputContext, sourceWidth, sourceHeight)) {
      updateCaptureButtons()
    }

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
updateRenderModeControls()
updateSourceControls()
updateFreezeButton()
updateFullscreenButton()
updateCaptureButtons()
setRawPreviewCollapsed(false)
setDebugPreview(currentSourceType)
startRenderLoop()
updateAsciiFontUi()
void loadAsciiCustomFonts()

if (window.ResizeObserver) {
  previewResizeObserver = new ResizeObserver(() => {
    const aspectRatio = outputCanvas.width && outputCanvas.height
      ? outputCanvas.width / outputCanvas.height
      : 16 / 9

    updateAsciiPreviewSize(aspectRatio)
  })

  previewResizeObserver.observe(mainPreviewFrame)
  previewResizeObserver.observe(outputCanvas)
}

try {
  blueNoiseThresholdMap = await loadBlueNoiseThresholdMap()
} catch (error) {
  blueNoiseLoadFailed = true
  console.error(error)
  setStatus('Blue Noise asset failed to load.', 'error')
}

await startCamera()

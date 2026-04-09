import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="shell">
    <section class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Glyph Signal Lab</p>
          <h1>Camera Input</h1>
        </div>
        <p class="status" id="camera-status" aria-live="polite">Requesting camera…</p>
      </div>

      <div class="preview-frame">
        <video
          id="camera-preview"
          class="camera-preview"
          autoplay
          playsinline
          muted
        ></video>
      </div>
    </section>
  </main>
`

const statusEl = document.querySelector('#camera-status')
const videoEl = document.querySelector('#camera-preview')

function setStatus(message, tone = 'muted') {
  statusEl.textContent = message
  statusEl.dataset.tone = tone
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus('Camera unavailable in this browser.', 'error')
    return
  }

  setStatus('Requesting camera…', 'muted')

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })

    videoEl.srcObject = stream
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

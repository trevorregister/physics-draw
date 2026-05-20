import { type Ref } from 'vue'
import { toCanvas } from 'html-to-image'
import katex from 'katex'

const EXPORT_PADDING = 20

export function useExport(svgRef: Ref<SVGSVGElement | null>, filename: string) {
  async function renderLabelToCanvas(latex: string, color: string): Promise<HTMLCanvasElement> {
    const wrapper = document.createElement('div')
    // Keep element in viewport so getBoundingClientRect() returns real dimensions
    Object.assign(wrapper.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      zIndex: '-1',
      pointerEvents: 'none',
      display: 'inline-block',
      color,
      fontSize: '13px',
      fontFamily: 'KaTeX_Main, serif',
      whiteSpace: 'nowrap',
    })
    wrapper.innerHTML = katex.renderToString(latex, { throwOnError: false, displayMode: false })
    document.body.appendChild(wrapper)
    try {
      return await toCanvas(wrapper, { pixelRatio: 2 })
    } finally {
      document.body.removeChild(wrapper)
    }
  }

  async function exportPng() {
    const svg = svgRef.value
    if (!svg) return

    // Map a foreignObject's screen-center to SVG viewBox coordinates.
    // Using getBoundingClientRect handles the apparatus viewport transform correctly.
    const svgScreen = svg.getBoundingClientRect()
    const vbW = svg.viewBox.baseVal.width || svg.clientWidth || 800
    const vbH = svg.viewBox.baseVal.height || svg.clientHeight || 600
    const toSvgX = (screenX: number) => (screenX - svgScreen.left) * (vbW / svgScreen.width)
    const toSvgY = (screenY: number) => (screenY - svgScreen.top) * (vbH / svgScreen.height)

    // Capture label positions and render them before touching the SVG
    const liveFOs = Array.from(svg.querySelectorAll('foreignObject'))
    const labels = await Promise.all(liveFOs.map(async (fo) => {
      const r = fo.getBoundingClientRect()
      const cx = toSvgX(r.left + r.width / 2)
      const cy = toSvgY(r.top + r.height / 2)
      const latex = fo.getAttribute('data-label') ?? ''
      const color = fo.getAttribute('data-color') ?? '#1e293b'
      const labelCanvas = await renderLabelToCanvas(latex, color)
      return { labelCanvas, cx, cy }
    }))

    // Compute tight content bbox: temporarily remove no-export elements so getBBox()
    // only measures diagram content, then immediately restore them.
    const noExportEls = Array.from(svg.querySelectorAll('[data-no-export="true"]'))
    type Slot = { el: Element; parent: Element; next: Element | null }
    const slots: Slot[] = noExportEls.map(el => ({
      el, parent: el.parentElement!, next: el.nextElementSibling,
    }))
    slots.forEach(({ el }) => el.parentElement!.removeChild(el))

    let rawBBox: SVGRect | null = null
    try {
      const b = (svg as unknown as SVGGraphicsElement).getBBox()
      if (b.width > 0 && b.height > 0) rawBBox = b
    } catch { /* fall through to full-viewBox fallback */ }
    finally {
      slots.forEach(({ el, parent, next }) => {
        if (next && next.parentElement === parent) parent.insertBefore(el, next)
        else parent.appendChild(el)
      })
    }

    // Fall back to full viewBox if diagram is empty or getBBox failed
    const PAD = EXPORT_PADDING
    const vbX = rawBBox ? rawBBox.x - PAD : 0
    const vbY = rawBBox ? rawBBox.y - PAD : 0
    const W   = rawBBox ? rawBBox.width  + PAD * 2 : vbW
    const H   = rawBBox ? rawBBox.height + PAD * 2 : vbH

    // Clone SVG, strip no-export elements and foreignObjects
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.querySelectorAll('[data-no-export="true"]').forEach(el => el.remove())
    clone.querySelectorAll('foreignObject').forEach(fo => fo.remove())

    clone.setAttribute('width', String(W))
    clone.setAttribute('height', String(H))
    clone.setAttribute('viewBox', `${vbX} ${vbY} ${W} ${H}`)
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    const SCALE = 2
    const svgString = new XMLSerializer().serializeToString(clone)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    try {
      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = W * SCALE
          canvas.height = H * SCALE
          const ctx = canvas.getContext('2d')!
          ctx.scale(SCALE, SCALE)
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, W, H)
          ctx.drawImage(img, 0, 0, W, H)

          for (const { labelCanvas, cx, cy } of labels) {
            if (labelCanvas.width === 0 || labelCanvas.height === 0) continue
            const lw = labelCanvas.width / 2   // CSS width (canvas rendered at 2× pixelRatio)
            const lh = labelCanvas.height / 2
            // Shift from SVG viewBox space into the cropped export canvas space
            ctx.drawImage(labelCanvas, (cx - vbX) - lw / 2, (cy - vbY) - lh / 2, lw, lh)
          }

          const pngUrl = canvas.toDataURL('image/png')
          const a = document.createElement('a')
          a.href = pngUrl
          a.download = filename
          a.click()
          resolve()
        }
        img.onerror = reject
        img.src = url
      })
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  return { exportPng }
}

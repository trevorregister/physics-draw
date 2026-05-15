import { type Ref } from 'vue'
import { toCanvas } from 'html-to-image'
import katex from 'katex'

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

    // Capture all labels before touching the SVG
    const liveFOs = Array.from(svg.querySelectorAll('foreignObject'))
    const labels = await Promise.all(liveFOs.map(async (fo) => {
      const foX = parseFloat(fo.getAttribute('x') || '0')
      const foY = parseFloat(fo.getAttribute('y') || '0')
      const foW = parseFloat(fo.getAttribute('width') || '120')
      const foH = parseFloat(fo.getAttribute('height') || '32')
      const latex = fo.getAttribute('data-label') ?? ''
      const color = fo.getAttribute('data-color') ?? '#1e293b'
      const labelCanvas = await renderLabelToCanvas(latex, color)
      return {
        labelCanvas,
        cx: foX + foW / 2,
        cy: foY + foH / 2,
      }
    }))

    // Clone SVG without foreignObjects so the SVG blob renders cleanly
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.querySelectorAll('foreignObject').forEach(fo => fo.remove())

    const vb = svg.viewBox.baseVal
    const W = vb.width > 0 ? vb.width : svg.clientWidth || 800
    const H = vb.height > 0 ? vb.height : svg.clientHeight || 600
    const SCALE = 2

    clone.setAttribute('width', String(W))
    clone.setAttribute('height', String(H))
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

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

          // Composite labels directly — no SVG image embedding, so no security restrictions
          for (const { labelCanvas, cx, cy } of labels) {
            const lw = labelCanvas.width / 2  // CSS width (canvas is 2x from pixelRatio)
            const lh = labelCanvas.height / 2
            ctx.drawImage(labelCanvas, cx - lw / 2, cy - lh / 2, lw, lh)
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

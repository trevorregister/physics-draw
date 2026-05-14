import { type Ref } from 'vue'

export function useExport(svgRef: Ref<SVGSVGElement | null>, filename: string) {
  async function exportPng() {
    const svg = svgRef.value
    if (!svg) return

    const clone = svg.cloneNode(true) as SVGSVGElement

    // Replace foreignObject (KaTeX labels) with plain SVG text for export
    clone.querySelectorAll('foreignObject').forEach((fo) => {
      const x = parseFloat(fo.getAttribute('x') || '0') + 4
      const y = parseFloat(fo.getAttribute('y') || '0') + 16
      const labelText = fo.getAttribute('data-label') ?? ''
      const color = fo.getAttribute('data-color') ?? '#000000'

      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      textEl.setAttribute('x', String(x))
      textEl.setAttribute('y', String(y))
      textEl.setAttribute('font-size', '14')
      textEl.setAttribute('font-family', 'serif')
      textEl.setAttribute('fill', color)
      textEl.textContent = labelText
      fo.replaceWith(textEl)
    })

    // Use viewBox dimensions as export size
    const vb = svg.viewBox.baseVal
    const W = vb.width > 0 ? vb.width : svg.clientWidth || 800
    const H = vb.height > 0 ? vb.height : svg.clientHeight || 600
    const SCALE = 2

    clone.setAttribute('width', String(W))
    clone.setAttribute('height', String(H))
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    // Serialize SVG to a blob URL
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

          const dataUrl = canvas.toDataURL('image/png')
          const a = document.createElement('a')
          a.href = dataUrl
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

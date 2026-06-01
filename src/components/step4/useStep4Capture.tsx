import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useCallback, type CSSProperties } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import PrintTypePreview, { type PrintTypePreviewVariant } from '../PrintTypePreview'
import { mmToPx, printCaptureScale } from '../../utils/layout'
import {
  buildPrintPageHtml,
  nextPaintFrames,
  openPrintDocument,
  openSheetPdfBlob,
  rasterizeFitImagesForCapture,
  waitForImagesLoaded,
} from '../../utils/printCapture'
import type {
  PrintTypePreviewLayout,
  PrintTypePreviewLayoutParams,
} from '../../utils/printTypePreviewLayout'

export type GuideImageFit = 'contain' | 'cover' | 'fill'

export type CaptureShot = {
  dataUrl: string
  pxW: number
  pxH: number
}

export type SlotRectPercent = {
  index: number
  left: number
  top: number
  width: number
  height: number
}

export function previewVariantFor(printType: string): PrintTypePreviewVariant {
  if (printType === 'background' || printType === 'images') return printType
  return 'frame'
}

export function buildSlotRects(layout: PrintTypePreviewLayout): SlotRectPercent[] {
  const { paperW, paperH, refillW, refillH } = layout
  const slots: SlotRectPercent[] = []

  if (layout.kind === 'fold') {
    const { marginX, marginY, bookCount, foldCount, panelW, holeZoneMm } = layout.fold
    for (let row = 0; row < bookCount; row += 1) {
      for (let col = 0; col < foldCount; col += 1) {
        const index = row * foldCount + col
        const x = marginX + holeZoneMm + col * panelW
        const y = marginY + row * refillH
        slots.push({
          index,
          left: (x / paperW) * 100,
          top: (y / paperH) * 100,
          width: (panelW / paperW) * 100,
          height: (refillH / paperH) * 100,
        })
      }
    }
    return slots
  }

  const { cols, rows, marginX, marginY } = layout
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col
      const x = marginX + col * refillW
      const y = marginY + row * refillH
      slots.push({
        index,
        left: (x / paperW) * 100,
        top: (y / paperH) * 100,
        width: (refillW / paperW) * 100,
        height: (refillH / paperH) * 100,
      })
    }
  }
  return slots
}

const captureSheetStyle = (
  paperW_px: number,
  paperH_px: number,
): CSSProperties => ({
  position: 'relative',
  width: paperW_px,
  height: paperH_px,
  backgroundColor: '#ffffff',
  overflow: 'hidden',
})

const captureOverlayLayerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  lineHeight: 0,
}

const captureSlotStyle = (rect: SlotRectPercent): CSSProperties => ({
  position: 'absolute',
  left: `${rect.left}%`,
  top: `${rect.top}%`,
  width: `${rect.width}%`,
  height: `${rect.height}%`,
  overflow: 'hidden',
  margin: 0,
  padding: 0,
})

const captureSlotImageStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

function clearCaptureSvgPaperFills(root: HTMLElement) {
  root.querySelectorAll('svg').forEach((svg) => {
    const paperRect = svg.querySelector(':scope > rect')
    if (!paperRect) return
    const fill = paperRect.getAttribute('fill')
    if (fill && fill !== 'none') {
      paperRect.setAttribute('fill', 'none')
    }
  })
}

function fixCaptureSvgDimensions(root: HTMLElement, paperH_px: number) {
  root.querySelectorAll('svg').forEach((svg) => {
    svg.setAttribute('width', '100%')
    if (svg.getAttribute('height') === 'auto' || !svg.getAttribute('height')) {
      svg.setAttribute('height', String(paperH_px))
    }
  })
}

function createOffscreenCaptureHost(paperW_px: number, paperH_px: number) {
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  Object.assign(host.style, {
    position: 'fixed',
    left: '-100000px',
    top: '0',
    width: `${paperW_px}px`,
    height: `${paperH_px}px`,
    overflow: 'hidden',
    pointerEvents: 'none',
    opacity: '0',
    zIndex: '-1',
  })
  const sheet = document.createElement('div')
  host.appendChild(sheet)
  return { host, sheet }
}

interface CaptureSheetProps {
  paperW_px: number
  paperH_px: number
  printType: string
  previewLayout: PrintTypePreviewLayout
  layoutParams: PrintTypePreviewLayoutParams
  images: Record<number, string>
  imageFitModes: Record<number, GuideImageFit>
  guideImage: string
  guideImageFit: GuideImageFit
  guideImageRotation: number
  showHoleGuide: boolean
}

function CaptureSheet({
  paperW_px,
  paperH_px,
  printType,
  previewLayout,
  layoutParams,
  images,
  imageFitModes,
  guideImage,
  guideImageFit,
  guideImageRotation,
  showHoleGuide,
}: CaptureSheetProps) {
  const sheetStyle = captureSheetStyle(paperW_px, paperH_px)
  const isImagesMode = printType === 'images'
  const isBackgroundMode = printType === 'background'
  const slotRects = buildSlotRects(previewLayout)

  if (isImagesMode) {
    return (
      <div style={sheetStyle}>
        {slotRects.map((rect) => {
          const src = images[rect.index]
          if (!src) return null
          return (
            <div key={rect.index} style={captureSlotStyle(rect)}>
              <img
                src={src}
                alt=""
                data-fit-mode={imageFitModes[rect.index] ?? 'cover'}
                data-rotation="0"
                style={captureSlotImageStyle}
              />
            </div>
          )
        })}
        {showHoleGuide ? (
          <div style={captureOverlayLayerStyle}>
            <PrintTypePreview variant="frame" layoutParams={layoutParams} emphasized />
          </div>
        ) : null}
      </div>
    )
  }

  if (isBackgroundMode && guideImage) {
    return (
      <div style={sheetStyle}>
        <img
          src={guideImage}
          alt=""
          data-fit-mode={guideImageFit}
          data-rotation={String(guideImageRotation)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: guideImageFit,
            transform: `rotate(${guideImageRotation}deg)`,
            transformOrigin: 'center center',
          }}
        />
        <div style={captureOverlayLayerStyle}>
          <PrintTypePreview variant="frame" layoutParams={layoutParams} emphasized />
        </div>
      </div>
    )
  }

  const variant: PrintTypePreviewVariant =
    isBackgroundMode && !guideImage ? 'background' : previewVariantFor(printType)

  return (
    <div style={sheetStyle}>
      <PrintTypePreview variant={variant} layoutParams={layoutParams} emphasized />
    </div>
  )
}

export interface UseStep4CaptureParams {
  paperMetrics: { pageWmm: number; pageHmm: number }
  previewLayout: PrintTypePreviewLayout | null
  printType: string
  layoutParams: PrintTypePreviewLayoutParams
  images: Record<number, string>
  imageFitModes: Record<number, GuideImageFit>
  guideImage: string
  guideImageFit: GuideImageFit
  guideImageRotation: number
  showHoleGuide: boolean
  isImagesMode: boolean
  isBackgroundMode: boolean
}

export function useStep4Capture({
  paperMetrics,
  previewLayout,
  printType,
  layoutParams,
  images,
  imageFitModes,
  guideImage,
  guideImageFit,
  guideImageRotation,
  showHoleGuide,
  isImagesMode,
  isBackgroundMode,
}: UseStep4CaptureParams) {
  const capturePreview = useCallback(async (): Promise<CaptureShot | null> => {
    console.log('guideImageFit:', guideImageFit)

    if (!previewLayout) return null

    const { pageWmm, pageHmm } = paperMetrics
    const paperW_px = Math.round(mmToPx(pageWmm))
    const paperH_px = Math.round(mmToPx(pageHmm))

    const { host, sheet } = createOffscreenCaptureHost(paperW_px, paperH_px)
    let reactRoot: Root | null = null

    try {
      reactRoot = createRoot(sheet)
      reactRoot.render(
        <CaptureSheet
          paperW_px={paperW_px}
          paperH_px={paperH_px}
          printType={printType}
          previewLayout={previewLayout}
          layoutParams={layoutParams}
          images={images}
          imageFitModes={imageFitModes}
          guideImage={guideImage}
          guideImageFit={guideImageFit}
          guideImageRotation={guideImageRotation}
          showHoleGuide={showHoleGuide}
        />,
      )

      document.body.appendChild(host)
      await nextPaintFrames(2)
      await waitForImagesLoaded(sheet)

      const stripPaperFill =
        isImagesMode || (isBackgroundMode && Boolean(guideImage))
      if (stripPaperFill) {
        clearCaptureSvgPaperFills(sheet)
      }

      await rasterizeFitImagesForCapture(sheet)
      fixCaptureSvgDimensions(sheet, paperH_px)

      const canvas = await html2canvas(sheet, {
        scale: printCaptureScale(),
        width: paperW_px,
        height: paperH_px,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      return {
        dataUrl: canvas.toDataURL('image/png'),
        pxW: canvas.width,
        pxH: canvas.height,
      }
    } finally {
      reactRoot?.unmount()
      if (host.parentNode) {
        document.body.removeChild(host)
      }
    }
  }, [
    paperMetrics,
    previewLayout,
    printType,
    layoutParams,
    images,
    imageFitModes,
    guideImage,
    guideImageFit,
    guideImageRotation,
    showHoleGuide,
    isImagesMode,
    isBackgroundMode,
  ])

  const handleSavePdf = useCallback(async () => {
    console.log('handleSavePdf 開始')
    const shot = await capturePreview()
    console.log('shot:', shot)
    if (!shot) return
    const { pageWmm, pageHmm } = paperMetrics
    console.log('paperMetrics:', pageWmm, pageHmm)
    const orientation = pageWmm > pageHmm ? 'l' : 'p'
    const pdf = new jsPDF(orientation, 'mm', 'a4')
    const addImageArgs = [shot.dataUrl, 'PNG', 0, 0, pageWmm, pageHmm] as const
    console.log('pdf.addImage args:', {
      imageData: `(dataUrl, length=${shot.dataUrl.length})`,
      format: addImageArgs[1],
      x: addImageArgs[2],
      y: addImageArgs[3],
      width: addImageArgs[4],
      height: addImageArgs[5],
      compression: undefined,
    })
    pdf.addImage(...addImageArgs)
    const blob = pdf.output('blob')
    console.log('blob:', blob)
    const result = await openSheetPdfBlob(blob)
    console.log('result:', result)
    if (!result.ok) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'refill.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    }
  }, [capturePreview, paperMetrics])

  const handlePrint = useCallback(async () => {
    const shot = await capturePreview()
    if (!shot) return

    const { pageWmm, pageHmm } = paperMetrics
    const html = buildPrintPageHtml({
      dataUrl: shot.dataUrl,
      pxW: shot.pxW,
      pxH: shot.pxH,
      pageWmm,
      pageHmm,
    })
    await openPrintDocument(html)
  }, [capturePreview, paperMetrics])

  return { capturePreview, handleSavePdf, handlePrint }
}

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ExportOptions {
  title: string
  headers: string[]
  data: string[][]
  columnStyles?: { [key: number]: { cellWidth?: number; halign?: 'left' | 'center' | 'right' } }
  summary?: { label: string; value: string }[]
}

// Convert image URL to base64
async function getImageBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

// Crop image to get header or footer portion
async function cropImage(
  imageBase64: string,
  cropType: 'header' | 'footer',
  originalWidth: number,
  originalHeight: number
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (cropType === 'header') {
        // Crop top 15% of image for header
        const cropHeight = Math.floor(originalHeight * 0.15)
        canvas.width = originalWidth
        canvas.height = cropHeight
        ctx?.drawImage(img, 0, 0, originalWidth, cropHeight, 0, 0, originalWidth, cropHeight)
      } else {
        // Crop bottom 8% of image for footer
        const cropHeight = Math.floor(originalHeight * 0.08)
        const startY = originalHeight - cropHeight
        canvas.width = originalWidth
        canvas.height = cropHeight
        ctx?.drawImage(img, 0, startY, originalWidth, cropHeight, 0, 0, originalWidth, cropHeight)
      }

      resolve(canvas.toDataURL('image/png'))
    }
    img.src = imageBase64
  })
}

// Get image dimensions
function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.src = base64
  })
}

export async function exportToPDF(options: ExportOptions): Promise<jsPDF> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Try to load letterhead image
  let headerImage: string | null = null
  let footerImage: string | null = null

  // Try loading separate header/footer images first
  const headerOnly = await getImageBase64('/letterhead-header.png')
  const footerOnly = await getImageBase64('/letterhead-footer.png')

  if (headerOnly) {
    headerImage = headerOnly
  }
  if (footerOnly) {
    footerImage = footerOnly
  }

  // If no separate images, try loading full letterhead and crop
  if (!headerImage || !footerImage) {
    const fullLetterhead = await getImageBase64('/letterhead.png')
    if (fullLetterhead) {
      const dims = await getImageDimensions(fullLetterhead)
      if (!headerImage) {
        headerImage = await cropImage(fullLetterhead, 'header', dims.width, dims.height)
      }
      if (!footerImage) {
        footerImage = await cropImage(fullLetterhead, 'footer', dims.width, dims.height)
      }
    }
  }

  // Heights for header and footer (matching cropped image proportions)
  // Header image is 915x230 (18% of full letterhead), scales to ~50mm on A4
  const headerHeight = 50
  const footerHeight = 18

  // Function to draw header
  const drawHeader = () => {
    if (headerImage) {
      doc.addImage(headerImage, 'PNG', 0, 0, pageWidth, headerHeight)
    } else {
      drawTextHeader(doc, pageWidth)
    }
  }

  // Function to draw footer
  const drawFooter = (pageNum: number) => {
    if (footerImage) {
      doc.addImage(footerImage, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight)
    } else {
      drawTextFooter(doc, pageWidth, pageHeight, pageNum)
    }

    // Always add page number
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`Page ${pageNum}`, pageWidth - 20, pageHeight - 5)
  }

  // Draw header on first page
  drawHeader()

  // Report Title
  const startY = headerHeight + 5

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(50, 50, 50)
  doc.text(options.title, 14, startY)

  // Date and count
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  const dateStr = new Date().toLocaleDateString('en-GB') + ' ' +
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  doc.text(`Generated: ${dateStr}`, 14, startY + 5)
  doc.text(`Total: ${options.data.length} items`, pageWidth - 40, startY + 5)

  // Table
  autoTable(doc, {
    startY: startY + 10,
    head: [options.headers],
    body: options.data,
    theme: 'striped',
    headStyles: {
      fillColor: [60, 60, 120],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [40, 40, 40],
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250]
    },
    columnStyles: options.columnStyles || {},
    margin: {
      top: headerHeight + 10,
      bottom: footerHeight + 10,
      left: 14,
      right: 14
    },
    didDrawPage: (data) => {
      // Draw header on new pages
      if (data.pageNumber > 1) {
        drawHeader()
      }
      // Draw footer on each page
      drawFooter(data.pageNumber)
    }
  })

  // Summary section
  if (options.summary && options.summary.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY + 6

    if (finalY < pageHeight - footerHeight - 40) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(60, 60, 120)
      doc.text('Summary', 14, finalY)

      doc.setDrawColor(60, 60, 120)
      doc.setLineWidth(0.3)
      doc.line(14, finalY + 1, 40, finalY + 1)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(60, 60, 60)

      options.summary.forEach((item, index) => {
        const y = finalY + 7 + (index * 5)
        doc.text(`${item.label}:`, 14, y)
        doc.setFont('helvetica', 'bold')
        doc.text(item.value, 55, y)
        doc.setFont('helvetica', 'normal')
      })
    }
  }

  return doc
}

// Fallback text header
function drawTextHeader(doc: jsPDF, pageWidth: number) {
  // APEX oval logo on left
  doc.setDrawColor(40, 40, 40)
  doc.setLineWidth(1.2)
  doc.ellipse(20, 14, 12, 7, 'S')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('APEX', 20, 16, { align: 'center' })

  // Large APEX on right
  doc.setFontSize(28)
  doc.setTextColor(40, 40, 40)
  doc.text('A', pageWidth - 75, 16)
  doc.setTextColor(160, 0, 40)
  doc.text('PEX', pageWidth - 63, 16)

  // Company tagline
  doc.setFontSize(9)
  doc.text('Computer Technology (Pvt) Ltd', pageWidth - 75, 21)

  // Address line
  doc.setFontSize(7)
  doc.setTextColor(60, 60, 60)
  doc.text('#236/15,Wijayakumrathunga Mw,Colombo 05.  Tel: 011-2513040  Fax:011-2513040  Email:apex@isplanka.lk', pageWidth / 2, 28, { align: 'center' })

  // Blue/purple gradient bar
  doc.setFillColor(0, 50, 120)
  doc.rect(0, 32, pageWidth * 0.6, 3.5, 'F')
  doc.setFillColor(80, 50, 130)
  doc.rect(pageWidth * 0.6, 32, pageWidth * 0.4, 3.5, 'F')
}

// Fallback text footer
function drawTextFooter(doc: jsPDF, pageWidth: number, pageHeight: number, pageNum: number) {
  // Line
  doc.setDrawColor(120, 120, 120)
  doc.setLineWidth(0.3)
  doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18)

  // Brand names
  const brands = [
    { name: 'APEX', color: [40, 40, 40] },
    { name: 'D-Link', color: [0, 90, 50] },
    { name: 'EPSON', color: [0, 50, 100] },
    { name: 'hp', color: [0, 100, 160] },
    { name: 'Canon', color: [160, 0, 0] },
    { name: 'intel', color: [0, 80, 150] }
  ]

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')

  const startX = 20
  const spacing = (pageWidth - 50) / brands.length

  brands.forEach((brand, i) => {
    doc.setTextColor(brand.color[0], brand.color[1], brand.color[2])
    doc.text(brand.name, startX + (i * spacing), pageHeight - 10)
  })
}

// Helper to format currency
export function formatPDFCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/session"
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Get and validate params
    const { userId } = await params;
    if (!userId) {
      return new Response("Invalid user ID", { status: 400 })
    }

    // Check authentication
    const session = await getSession()
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Only allow users to access their own certificate
    if (session.user.id !== userId) {
      return new Response("Forbidden", { status: 403 })
    }

    // Get user data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        isCertificateEligible: true
      }
    })

    if (!user) {
      return new Response("User not found", { status: 404 })
    }

    if (!user.isCertificateEligible) {
      return new Response("User is not eligible for certificate", { status: 403 })
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create()
    
    // Register fontkit before any font operations
    pdfDoc.registerFontkit(fontkit)
    
    // Read the certificate template
    const templatePath = path.join(process.cwd(), 'public', 'images', 'sertifikat.jpeg')
    const templateBytes = await fs.readFile(templatePath)
    
    // Read both font files
    const seasonsPath = path.join(process.cwd(), 'public', 'fonts', 'the-seasons-font-family', 'the-seasons-bold.ttf')
    const poppinsPath = path.join(process.cwd(), 'public', 'fonts', 'poppins-latin-400-normal.woff')
    const [seasonsBytes, poppinsBytes] = await Promise.all([
      fs.readFile(seasonsPath),
      fs.readFile(poppinsPath)
    ])
    
    // Convert JPEG to PDF format and embed fonts
    const [templateImage, seasonsFont, poppinsFont] = await Promise.all([
      pdfDoc.embedJpg(templateBytes),
      pdfDoc.embedFont(seasonsBytes),
      pdfDoc.embedFont(poppinsBytes)
    ])
    
    // Add a page with template dimensions
    const page = pdfDoc.addPage([templateImage.width, templateImage.height])
    
    // Draw the template
    page.drawImage(templateImage, {
      x: 0,
      y: 0,
      width: templateImage.width,
      height: templateImage.height,
    })
    
    // Get page dimensions
    const { width, height } = page.getSize()
    
    // Generate serial number (4 digits padded with zeros)
    const lastFourDigits = userId.slice(-4).padStart(4, '0')
    const serialNumber = `PKA-0525-${lastFourDigits}`.toUpperCase()
    const serialFontSize = 25
    const serialWidth = poppinsFont.widthOfTextAtSize(serialNumber, serialFontSize)
    
    // Add serial number above name using Poppins and grey color
    page.drawText(serialNumber, {
      x: width / 2 - serialWidth / 2,
      y: height / 2 + 200,
      size: serialFontSize,
      font: poppinsFont,
      color: rgb(0.3, 0.3, 0.3) 
    })
    
    // Calculate appropriate font size for name
    const name = (user.name || 'Peserta').toUpperCase()
    const maxWidth = width * 0.7 // Use 70% of certificate width as maximum
    let fontSize = 100 // Start with desired size
    let textWidth = seasonsFont.widthOfTextAtSize(name, fontSize)
    
    // Reduce font size until text fits within maxWidth
    while (textWidth > maxWidth && fontSize > 40) {
      fontSize -= 5
      textWidth = seasonsFont.widthOfTextAtSize(name, fontSize)
    }
    
    // Position the name
    page.drawText(name, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - 50,
      size: fontSize,
      font: seasonsFont,
      color: rgb(0, 0, 0)
    })

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()

    // Set response headers
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set(
      'Content-Disposition',
      `attachment; filename="certificate-${serialNumber}.pdf"`
    )

    return new Response(pdfBytes, { headers })

  } catch (error) {
    console.error('Certificate generation error:', error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

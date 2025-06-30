import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Function to detect file type from URL
function detectFileTypeFromUrl(url: string): 'image' | 'audio' | 'unknown' {
  if (!url) return 'unknown'
  
  // Convert to lowercase for case-insensitive matching
  const lowerUrl = url.toLowerCase()
  
  // Check for audio file extensions
  const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma']
  if (audioExtensions.some(ext => lowerUrl.includes(ext))) {
    return 'audio'
  }
  
  // Check for image file extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
    return 'image'
  }
  
  // Check for common patterns in Cloudinary URLs
  if (lowerUrl.includes('cloudinary')) {
    // Cloudinary URLs often have format indicators
    if (lowerUrl.includes('/video/') || lowerUrl.includes('_video') || lowerUrl.includes('.mp3') || lowerUrl.includes('.wav')) {
      return 'audio'
    }
    if (lowerUrl.includes('/image/') || lowerUrl.includes('_image') || lowerUrl.includes('.jpg') || lowerUrl.includes('.png')) {
      return 'image'
    }
  }
  
  // Default fallback - if it contains common audio terms, assume audio
  if (lowerUrl.includes('audio') || lowerUrl.includes('sound') || lowerUrl.includes('music')) {
    return 'audio'
  }
  
  // Default fallback - if it contains common image terms, assume image
  if (lowerUrl.includes('image') || lowerUrl.includes('photo') || lowerUrl.includes('picture')) {
    return 'image'
  }
  
  return 'unknown'
}

async function migrateSoalAttachments() {
  console.log('Starting Soal attachments migration...')
  
  try {
    // Get all soals that have existing attachments
    const soalsWithAttachments = await prisma.soal.findMany({
      where: {
        attachmentUrl: {
          not: null
        }
      },
      select: {
        id: true,
        attachmentUrl: true,
        attachmentType: true
      }
    })

    console.log(`Found ${soalsWithAttachments.length} soals with existing attachments`)

    let imageCount = 0
    let audioCount = 0
    let unknownCount = 0

    // Migrate each soal's attachment to the appropriate new field
    for (const soal of soalsWithAttachments) {
      const updateData: any = {}
      let detectedType = 'unknown'
      
      // First try to use the existing attachmentType if it's valid
      if (soal.attachmentType === 'image' || soal.attachmentType === 'IMAGE') {
        updateData.imageUrl = soal.attachmentUrl
        detectedType = 'image'
        imageCount++
        console.log(`Migrating soal ${soal.id}: image attachment (from type)`)
      } else if (soal.attachmentType === 'audio' || soal.attachmentType === 'AUDIO') {
        updateData.audioUrl = soal.attachmentUrl
        detectedType = 'audio'
        audioCount++
        console.log(`Migrating soal ${soal.id}: audio attachment (from type)`)
      } else {
        // Try to detect from URL
        const urlType = detectFileTypeFromUrl(soal.attachmentUrl || '')
        
        if (urlType === 'audio') {
          updateData.audioUrl = soal.attachmentUrl
          detectedType = 'audio'
          audioCount++
          console.log(`Migrating soal ${soal.id}: audio attachment (detected from URL: ${soal.attachmentUrl})`)
        } else if (urlType === 'image') {
          updateData.imageUrl = soal.attachmentUrl
          detectedType = 'image'
          imageCount++
          console.log(`Migrating soal ${soal.id}: image attachment (detected from URL: ${soal.attachmentUrl})`)
        } else {
          // For truly unknown types, default to image but log for manual review
          updateData.imageUrl = soal.attachmentUrl
          detectedType = 'unknown'
          unknownCount++
          console.log(`Migrating soal ${soal.id}: UNKNOWN type, defaulting to image. URL: ${soal.attachmentUrl}`)
        }
      }

      // Update the soal with the new fields
      await prisma.soal.update({
        where: { id: soal.id },
        data: updateData
      })
    }

    console.log('Migration completed successfully!')
    console.log(`Migrated ${soalsWithAttachments.length} soal attachments:`)
    console.log(`  - Images: ${imageCount}`)
    console.log(`  - Audio: ${audioCount}`)
    console.log(`  - Unknown (defaulted to image): ${unknownCount}`)
    
    if (unknownCount > 0) {
      console.log('\n⚠️  WARNING: Some attachments could not be automatically categorized.')
      console.log('Please review the URLs marked as UNKNOWN above and manually update them if needed.')
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateSoalAttachments()
    .then(() => {
      console.log('Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration script failed:', error)
      process.exit(1)
    })
}

export { migrateSoalAttachments }

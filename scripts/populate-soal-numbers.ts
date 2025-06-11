import { db } from '../lib/db'

async function populateSoalNumbers() {
  console.log('Starting to populate soal numbers...')
  
  try {
    // Get all koleksi soal
    const koleksiSoals = await db.koleksiSoal.findMany({
      include: {
        soals: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    for (const koleksi of koleksiSoals) {
      console.log(`Processing koleksi: ${koleksi.nama} (${koleksi.soals.length} soals)`)
      
      // Update each soal with a number based on its order
      for (let i = 0; i < koleksi.soals.length; i++) {
        const soal = koleksi.soals[i]
        await db.soal.update({
          where: { id: soal.id },
          data: { 
            number: i + 1,
            // Also set default type if not already set
            type: soal.type || 'READING'
          }
        })
      }
    }

    console.log('Successfully populated all soal numbers!')
  } catch (error) {
    console.error('Error populating soal numbers:', error)
  } finally {
    await db.$disconnect()
  }
}

// Run the script if called directly
if (require.main === module) {
  populateSoalNumbers()
}

export { populateSoalNumbers }
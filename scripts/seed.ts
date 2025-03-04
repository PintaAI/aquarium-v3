import { PrismaClient, UserRoles, CourseLevel } from '@prisma/client'
import { faker } from '@faker-js/faker/locale/id_ID'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.vocabularyItem.deleteMany()
  await prisma.vocabularyCollection.deleteMany()
  await prisma.userModuleCompletion.deleteMany()
  await prisma.module.deleteMany()
  await prisma.room.deleteMany()
  await prisma.article.deleteMany()
  await prisma.course.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRoles.ADMIN,
      password: adminPassword,
    },
  })

  // Create multiple gurus
  const gurus = await Promise.all(
    Array(3).fill(null).map(async () => {
      const password = await hash(faker.internet.password(), 12)
      return prisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          role: UserRoles.GURU,
          password,
        },
      })
    })
  )

  // Create multiple students
  const students = await Promise.all(
    Array(10).fill(null).map(async () => {
      const password = await hash(faker.internet.password(), 12)
      return prisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          role: UserRoles.MURID,
          password,
        },
      })
    })
  )

  // Create courses for each guru
  for (const guru of gurus) {
    const courseLevels = [CourseLevel.BEGINNER, CourseLevel.INTERMEDIATE, CourseLevel.ADVANCED]
    
    for (const level of courseLevels) {
      const course = await prisma.course.create({
        data: {
          title: faker.company.catchPhrase(),
          description: faker.lorem.paragraph(),
          jsonDescription: JSON.stringify({ content: faker.lorem.paragraphs() }),
          htmlDescription: `<div>${faker.lorem.paragraphs()}</div>`,
          level,
          thumbnail: faker.image.url(),
          icon: faker.image.avatar(),
          authorId: guru.id,
          members: {
            connect: faker.helpers.arrayElements(students, { min: 3, max: 8 }).map(s => ({ id: s.id }))
          }
        }
      })

      // Create modules for each course
      const moduleCount = faker.number.int({ min: 3, max: 8 })
      for (let i = 0; i < moduleCount; i++) {
        await prisma.module.create({
          data: {
            title: faker.company.buzzPhrase(),
            description: faker.lorem.sentence(),
            jsonDescription: JSON.stringify({ content: faker.lorem.paragraph() }),
            htmlDescription: `<div>${faker.lorem.paragraph()}</div>`,
            order: i + 1,
            courseId: course.id
          }
        })
      }

      // Create rooms for each course
      const roomCount = faker.number.int({ min: 1, max: 3 })
      for (let i = 0; i < roomCount; i++) {
        await prisma.room.create({
          data: {
            name: faker.commerce.department(),
            description: faker.lorem.sentence(),
            creatorId: guru.id,
            courseId: course.id,
            participants: {
              connect: faker.helpers.arrayElements(students, { min: 2, max: 5 }).map(s => ({ id: s.id }))
            }
          }
        })
      }
    }

    // Create articles for each guru
    const articleCount = faker.number.int({ min: 2, max: 5 })
    for (let i = 0; i < articleCount; i++) {
      await prisma.article.create({
        data: {
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraph(),
          jsonDescription: JSON.stringify({ content: faker.lorem.paragraphs() }),
          htmlDescription: `<div>${faker.lorem.paragraphs()}</div>`,
          authorId: guru.id
        }
      })
    }
  }

  // Create vocabulary collections
  for (const student of students) {
    const collectionCount = faker.number.int({ min: 1, max: 3 })
    for (let i = 0; i < collectionCount; i++) {
      const collection = await prisma.vocabularyCollection.create({
        data: {
          title: faker.lorem.words({ min: 2, max: 4 }),
          description: faker.lorem.sentence(),
          isPublic: faker.datatype.boolean(),
          userId: student.id
        }
      })

      // Add vocabulary items
      const itemCount = faker.number.int({ min: 5, max: 15 })
      for (let j = 0; j < itemCount; j++) {
        await prisma.vocabularyItem.create({
          data: {
            korean: faker.lorem.word(),
            indonesian: faker.lorem.word(),
            isChecked: faker.datatype.boolean(),
            collectionId: collection.id
          }
        })
      }
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

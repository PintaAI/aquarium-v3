'use server'

import { currentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createTryout(
  guruId: string,
  koleksiSoalId: number,
  startTime: Date,
  endTime: Date,
  duration?: number // Optional since we have a default value in schema
) {
  const user = await currentUser()

  if (!user || user.role !== "GURU") {
    throw new Error("Unauthorized")
  }

  // Get koleksi name for tryout name
  const koleksi = await db.koleksiSoal.findUnique({
    where: { id: koleksiSoalId }
  })

  if (!koleksi) {
    throw new Error("Question collection not found")
  }

  const tryout = await db.tryout.create({
    data: {
      nama: `${koleksi.nama} - Tryout`,
      guruId,
      koleksiSoalId,
      startTime,
      endTime,
      duration: duration ?? 30, // Use provided duration or default to 30 minutes
      isActive: true
    }
  })

  revalidatePath("/tryout")
  return tryout
}

export async function getTryout(tryoutId: number) {
  const tryout = await db.tryout.findUnique({
    where: { id: tryoutId },
    include: {
      koleksiSoal: true,
      participants: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true
            }
          }
        }
      }
    }
  })

  if (!tryout) {
    throw new Error("Tryout not found")
  }

  return tryout
}

export async function joinTryout(tryoutId: number, userId: string) {
  const user = await currentUser()

  if (!user || user.role !== "MURID") {
    throw new Error("Unauthorized")
  }

  const tryout = await db.tryout.findUnique({
    where: { id: tryoutId },
    include: {
      koleksiSoal: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              members: {
                where: { id: userId },
                select: { id: true }
              }
            }
          }
        }
      },
      participants: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true
            }
          }
        }
      }
    }
  })

  if (!tryout) {
    throw new Error("Tryout not found")
  }

  // Check if user is a member of the course
  if (!tryout.koleksiSoal.course?.members || tryout.koleksiSoal.course.members.length === 0) {
    throw new Error(`Kamu bukan member dari ${tryout.koleksiSoal.course?.title || 'kursus ini'}, silahkan join terlebih dahulu`)
  }

  const now = new Date()

  if (now < tryout.startTime || now > tryout.endTime) {
    throw new Error("Tryout is not active")
  }

  // Check if already joined
  const existing = await db.tryoutParticipant.findUnique({
    where: {
      tryoutId_userId: {
        tryoutId,
        userId
      }
    }
  })

  if (existing) {
    throw new Error("Already joined this tryout")
  }

  const participant = await db.tryoutParticipant.create({
    data: {
      tryoutId,
      userId,
      score: 0
    }
  })

  revalidatePath(`/tryout/${tryoutId}`)
  return participant
}

export async function submitTryoutAnswers(
  tryoutId: number,
  userId: string,
  answers: number[],
  timeTakenSeconds: number
) {
  const user = await currentUser()

  if (!user || user.role !== "MURID") {
    throw new Error("Unauthorized")
  }

  const tryout = await db.tryout.findUnique({
    where: { id: tryoutId },
    include: {
      koleksiSoal: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              members: {
                where: { id: userId },
                select: { id: true }
              }
            }
          }
        }
      },
      participants: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true
            }
          }
        }
      }
    }
  })

  if (!tryout) {
    throw new Error("Tryout not found")
  }

  // Check if user is a member of the course
  if (!tryout.koleksiSoal.course?.members || tryout.koleksiSoal.course.members.length === 0) {
    throw new Error(`Kamu bukan member dari ${tryout.koleksiSoal.course?.title || 'kursus ini'}, silahkan join terlebih dahulu`)
  }

  const now = new Date()

  if (now < tryout.startTime || now > tryout.endTime) {
    throw new Error("Tryout is not active")
  }

  const participant = await db.tryoutParticipant.findUnique({
    where: {
      tryoutId_userId: {
        tryoutId,
        userId
      }
    }
  })

  if (!participant) {
    throw new Error("Not participating in this tryout")
  }

  if (participant.submittedAt) {
    throw new Error("Already submitted answers")
  }

  // Calculate score
  const questions = await db.soal.findMany({
    where: { koleksiId: tryout.koleksiSoalId },
    include: {
      opsis: {
        where: { isCorrect: true },
        select: { id: true }
      }
    }
  })

  if (answers.length !== questions.length) {
    throw new Error("Invalid number of answers")
  }

  let score = 0
  for (let i = 0; i < questions.length; i++) {
    const correctOpsiId = questions[i].opsis[0]?.id
    if (correctOpsiId && answers[i] === correctOpsiId) {
      score++
    }
  }

  // Update participant score
  const updated = await db.tryoutParticipant.update({
    where: {
      tryoutId_userId: {
        tryoutId,
        userId
      }
    },
    data: {
      score,
      submittedAt: now,
      timeTakenSeconds
    }
  })

  revalidatePath(`/tryout/${tryoutId}`)
  revalidatePath(`/tryout/${tryoutId}/leaderboard`)
  return updated
}

export async function getTryoutLeaderboard(tryoutId: number) {
  const user = await currentUser()
  if (!user?.id || !user?.role || !["GURU", "MURID", "ADMIN"].includes(user.role)) {
    return null
  }

  const leaderboard = await db.tryoutParticipant.findMany({
    where: {
      tryoutId,
      submittedAt: { not: null }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    },
    orderBy: [
      { score: 'desc' }
    ]
  })

  // Custom sort to handle both timeTakenSeconds and submittedAt
  return leaderboard.sort((a, b) => {
    // First sort by score (descending)
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    
    // If scores are equal, sort by time taken or submission time
    if (a.timeTakenSeconds !== null && b.timeTakenSeconds !== null) {
      return a.timeTakenSeconds - b.timeTakenSeconds; // faster completion first
    }
    
    // If one has timeTakenSeconds and the other doesn't, prioritize the one with timeTakenSeconds
    if (a.timeTakenSeconds !== null) return -1;
    if (b.timeTakenSeconds !== null) return 1;
    
    // If neither has timeTakenSeconds, use submittedAt
    if (a.submittedAt && b.submittedAt) {
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    }
    
    // If one doesn't have submittedAt, put it last
    if (!a.submittedAt) return 1;
    if (!b.submittedAt) return -1;
    return 0;
  });
}

export async function getAllTryouts() {
  const user = await currentUser()

  if (!user || user.role !== "GURU") {
    throw new Error("Unauthorized")
  }

  const tryouts = await db.tryout.findMany({
    include: {
      koleksiSoal: true,
      participants: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true
            }
          }
        }
      }
    },
    orderBy: { startTime: 'desc' }
  })

  return tryouts
}

export async function deleteTryout(tryoutId: number) {
  const user = await currentUser()

  if (!user || (user.role !== "GURU" && user.role !== "ADMIN")) {
    throw new Error("Unauthorized")
  }

  await db.tryoutParticipant.deleteMany({
    where: { tryoutId }
  })

  await db.tryout.delete({
    where: { id: tryoutId }
  })

  revalidatePath("/tryout")
}

export async function getUpcomingTryout() {
  const user = await currentUser()

  if (!user?.id || !user?.role) {
    throw new Error("Unauthorized")
  }

  const tryouts = await getTryoutForUser(user.id)
  
  const now = new Date()
  // Find active or upcoming tryout
  const activeTryout = tryouts
    .filter(tryout => {
      const startTime = new Date(tryout.startTime)
      const endTime = new Date(tryout.endTime)
      return now >= startTime && now <= endTime // Active
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0]

  if (activeTryout) return activeTryout

  // If no active tryout, find upcoming one
  const upcomingTryout = tryouts
    .filter(tryout => new Date(tryout.startTime) > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0]

  return upcomingTryout || null
}

export async function getTryoutForUser(userId: string | undefined) {
  const user = await currentUser()

  if (!user?.id || !user?.role) {
    throw new Error("Unauthorized")
  }

  if (user.role === "GURU" || user.role === "ADMIN") {
    return getAllTryouts()
  }

  // Return empty array if no userId provided
  if (!userId) {
    return []
  }

  // Validate the provided userId matches the authenticated user
  if (userId !== user.id) {
    throw new Error("Unauthorized: Cannot view other user's tryouts")
  }

  // Only show tryouts from courses the user is a member of
  const participatingTryouts = await db.tryout.findMany({
    where: {
      koleksiSoal: {
        course: {
          members: {
            some: {
              id: userId
            }
          }
        }
      }
    },
    include: {
      koleksiSoal: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              members: {
                where: { id: userId },
                select: { id: true }
              }
            }
          }
        }
      },
      participants: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true
            }
          }
        }
      }
    },
    orderBy: { startTime: 'desc' }
  })

  return participatingTryouts
}

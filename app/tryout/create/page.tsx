import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTryout } from "@/app/actions/tryout-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db } from "@/lib/db"

export default async function CreateTryoutPage() {
  const user = await currentUser()

  if (!user || user.role !== "GURU") {
    redirect("/tryout")
  }

  const koleksiSoals = await db.koleksiSoal.findMany({
    where: {
      soals: {
        some: {
          authorId: user.id
        }
      }
    }
  })

  async function create(formData: FormData) {
    "use server"

    if (!user) return

    const koleksiSoalId = parseInt(formData.get("koleksiSoalId") as string)
    const startTime = new Date(formData.get("startTime") as string)
    const endTime = new Date(formData.get("endTime") as string)

    await createTryout(
      user.id,
      koleksiSoalId,
      startTime,
      endTime
    )

    redirect("/tryout")
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Tryout</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={create} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="koleksiSoalId">Question Collection</Label>
              <select
                id="koleksiSoalId"
                name="koleksiSoalId"
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select a collection</option>
                {koleksiSoals.map((koleksi) => (
                  <option key={koleksi.id} value={koleksi.id}>
                    {koleksi.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                required
              />
            </div>

            <Button type="submit">Create Tryout</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

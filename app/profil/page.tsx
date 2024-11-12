"use client"

import { useSession } from "next-auth/react"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { Card } from "@/components/ui/card"

export default function ProfilPage() {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          
          {user && (
            <div className="space-y-4">
              {user.image && (
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  <img 
                    src={user.image} 
                    alt={user.name || "Profile"} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                {user.name && (
                  <div>
                    <span className="font-semibold">Name:</span> {user.name}
                  </div>
                )}
                {user.email && (
                  <div>
                    <span className="font-semibold">Email:</span> {user.email}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <SignOutButton 
                  variant="destructive"
                  className="w-full sm:w-auto"
                />
              </div>
            </div>
          )}

          {!user && (
            <div className="text-center py-4">
              Please sign in to view your profile.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

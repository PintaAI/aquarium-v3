"use client"

import { Settings, User, UserCircle, Mail } from "lucide-react"
import { useSession } from "next-auth/react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { AuthButton } from "@/components/auth/auth-button"
import { GuruTools } from "@/components/menu/guru-tools"
import { NotificationToggle } from "@/components/notification-toggle"
import Image from "next/image"

export default function ProfilPage() {
  const { data: session } = useSession()
  const user = session?.user

  if (!user) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-4">
            <UserCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to view your profile.</p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences and settings</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="relative pb-8 border-b bg-muted/10">
              <div className="flex items-center gap-6 flex-col sm:flex-row">
                {user.image ? (
                  <Image 
                    src={user.image} 
                    alt={user.name || "Profile"} 
                    className="w-24 h-24 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-semibold">{user.name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Badge variant="outline" className="capitalize">
                      {user.role?.toLowerCase() || "User"}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {user.plan || "Free"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-6">
              <div className="grid gap-6">
                <div className="space-y-4 pb-5">
                  <h3 className="text-lg font-bold mb-3">Account Information</h3>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Member Since</h4>
                    <span className="text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Account Status</h4>
                    <Badge className="capitalize">Active</Badge>
                  </div>
                </div>
              </div>
              
              {user.role === "GURU" && (
                <div className="pt-4 border-t mt-4">
                  <GuruTools role={user.role} />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t pt-6">
              <div className="flex items-center justify-between w-full gap-4">
                <AuthButton className="flex-1" />
                <ThemeToggle />
                <Button variant="outline" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Preferences</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                  <div className="space-y-0.5">
                    <h4 className="font-medium">Theme Preferences</h4>
                    <p className="text-muted-foreground text-sm">
                      Manage your theme settings
                    </p>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center pt-6 border-t">
                  <div className="space-y-0.5">
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-muted-foreground text-sm">
                      Enable or disable push notifications
                    </p>
                  </div>
                  <NotificationToggle />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

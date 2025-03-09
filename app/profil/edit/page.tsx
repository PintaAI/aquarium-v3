"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Upload } from "lucide-react"
import Image from "next/image"
import { updateProfile } from "@/app/actions/user-actions"
import { uploadImage } from "@/app/actions/upload-image"

const editProfileSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  image: z.string().optional(),
})

type EditProfileFormValues = z.infer<typeof editProfileSchema>

export default function EditProfilePage() {
  const { data: session, update, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const user = session?.user

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: "",
      image: "",
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        image: user.image || "",
      })
      
      if (user.image) {
        setPreviewImage(user.image);
      }
    }
  }, [user, form])

  // Handle image upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError("");
      
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      
      // Create FormData and upload
      const formData = new FormData();
      formData.append("file", file);
      
      const imageUrl = await uploadImage(formData);
      
      // Set the image URL in the form
      form.setValue("image", imageUrl);
      
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(error instanceof Error ? error.message : "Failed to upload image");
      // Revert to original image if there was one
      setPreviewImage(user?.image || null);
    } finally {
      setUploadingImage(false);
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push("/auth/login")
    return null
  }

async function onSubmit(data: EditProfileFormValues) {
  try {
    setError("")
    setIsLoading(true)
    
    const result = await updateProfile({
      name: data.name,
      image: data.image || undefined,
    })

    if (!result.success) {
      throw new Error(result.error)
    }

    // Update session and wait for it to complete
    await update()
    
    // Add a small delay to ensure session is updated
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Force a router refresh before redirect
    router.refresh()
    router.push("/profil")
  } catch (error) {
    console.error("Error updating profile:", error)
    setError(error instanceof Error ? error.message : "Failed to update profile")
  } finally {
    setIsLoading(false)
  }
}

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader className="space-y-1">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <p className="text-muted-foreground">
            Update your profile information
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center mb-6 space-y-4">
                {previewImage ? (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden">
                      <Image
                        src={previewImage}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          console.error("Image load error:", e);
                          setError("Failed to load image preview");
                          setPreviewImage(user?.image || null);
                        }}
                      />
                    </div>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex flex-col items-center">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                    onClick={() => document.getElementById('picture')?.click()}
                    disabled={uploadingImage || isLoading}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {previewImage ? "Change picture" : "Upload picture"}
                      </>
                    )}
                  </Button>
                  <input
                    id="picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage || isLoading}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hidden field to store the image URL */}
              <input type="hidden" {...form.register("image")} />

              {error && (
                <div className="bg-destructive/15 text-destructive p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || uploadingImage}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

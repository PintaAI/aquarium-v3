"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { registerUser } from "@/app/actions/auth-action"

type AuthMode = "login" | "register"

interface FormData {
  email: string
  password: string
  name?: string
}

export function AuthCard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const urlError = searchParams.get("error")
  const [error, setError] = useState<string>("")
  const [mode, setMode] = useState<AuthMode>("login")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
  })

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === "register") {
        const result = await registerUser(formData)
        if (result.error) {
          setError(result.error)
          return
        }
      }

      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (res?.error) {
        setError(res.error)
        return
      }

      router.push(callbackUrl)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"))
    // Reset form data and error when switching modes
    setFormData({ email: "", password: "", name: "" })
    setError("")
  }

  return (
    <div className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-6 shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">
          {mode === "login" ? "Login" : "Register"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "login"
            ? "Enter your credentials to continue"
            : "Create an account to get started"}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" && (
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="John Doe"
              required={mode === "register"}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="m@example.com"
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {(error || urlError) && (
          <div className="text-sm text-destructive">
            {error || (urlError === "CredentialsSignin"
              ? "Invalid email or password"
              : "Something went wrong")}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Loading..." : mode === "login" ? "Sign In" : "Sign Up"}
        </button>

        <button
          type="button"
          onClick={toggleMode}
          className="w-full text-sm text-muted-foreground hover:underline"
        >
          {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  )
}

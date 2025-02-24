"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { BackgroundBeams } from "@/components/ui/background-beams"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signup } = useAuth()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signup(email, password)
      router.push("/dashboard")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to create account")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary relative flex items-center justify-center px-4 py-8 sm:px-6 md:px-8">
      <BackgroundBeams />
      <div className="relative w-full max-w-[420px] mx-auto">
        {/* Mobile Back Navigation - Improved positioning */}
        <div className="w-full mb-8 flex items-center md:hidden">
          <Link 
            href="/" 
            className="text-muted-foreground hover:text-primary flex items-center transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </div>

        <Card className="w-full shadow-xl border-0">
          <CardHeader className="space-y-2 pt-8 pb-6">
            {/* Logo - Improved responsive sizing */}
            <div className="flex items-center justify-center mb-4">
              <Car className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              <span className="ml-2 text-lg sm:text-xl font-bold">Track-kar</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-center">
              Create your account
            </CardTitle>
            <CardDescription className="text-center text-sm text-muted-foreground">
              Enter your details to get started with Track-kar
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 pb-8 sm:px-6">
            <form onSubmit={handleSignup} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[50%] -translate-y-[50%] text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium mt-6"
              >
                Create Account
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-6">
                By clicking Create Account, you agree to our{" "}
                <Link href="#" className="text-primary hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-primary hover:underline font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


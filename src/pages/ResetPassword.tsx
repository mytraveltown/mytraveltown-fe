import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Lock, Eye, EyeOff, Globe, ArrowRight, Loader2, Check, AlertCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isExpired, setIsExpired] = useState(false)

  const passwordStrength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const isStrongPassword = Object.values(passwordStrength).every(Boolean)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!isStrongPassword) {
      setError("Password is not strong enough")
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      navigate("/login?reset=success")
    } catch (err) {
      setError("Failed to reset password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-brand to-primary mb-4">
              <Globe className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="fw-bold tracking-tight">Link expired</h1>
            <p className="text-muted-foreground mt-2">This password reset link has expired</p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-lg p-8 backdrop-blur-sm">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>

            <p className="text-center text-body-sm text-muted-foreground mb-6">
              For security reasons, password reset links expire after 24 hours. Please request a new one.
            </p>

            <Link
              to="/forgot-password"
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground fw-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              Request new reset link
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/login"
              className="w-full mt-3 py-3 px-4 rounded-lg border border-border hover:bg-muted transition fw-medium text-body-sm flex items-center justify-center gap-2"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-brand to-primary mb-4">
            <Globe className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="fw-bold tracking-tight">Set new password</h1>
          <p className="text-muted-foreground mt-2">Create a strong password to secure your account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-lg p-8 backdrop-blur-sm">
          <form onSubmit={handleReset} className="space-y-5">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-body-sm fw-medium mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="mt-2 space-y-1.5 text-caption">
                  <div className={`flex items-center gap-2 ${passwordStrength.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <Check className="h-3 w-3" />
                    At least 8 characters
                  </div>
                  <div className={`flex items-center gap-2 ${passwordStrength.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <Check className="h-3 w-3" />
                    Uppercase letter
                  </div>
                  <div className={`flex items-center gap-2 ${passwordStrength.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <Check className="h-3 w-3" />
                    Lowercase letter
                  </div>
                  <div className={`flex items-center gap-2 ${passwordStrength.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <Check className="h-3 w-3" />
                    Number
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-body-sm fw-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Match Indicator */}
              {confirmPassword && (
                <div className={`mt-2 text-caption flex items-center gap-2 ${password === confirmPassword ? 'text-green-600' : 'text-destructive'}`}>
                  <Check className="h-3 w-3" />
                  {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-body-sm">
              Your password must be strong and different from your previous passwords.
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-body-sm fw-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !isStrongPassword || password !== confirmPassword}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground fw-semibold hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                <>
                  Reset password
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Back Link */}
          <p className="text-center text-body-sm text-muted-foreground mt-6">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 fw-semibold">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-caption text-muted-foreground mt-6">
          This link will expire in 24 hours for security reasons.
        </p>
      </div>
    </div>
  )
}

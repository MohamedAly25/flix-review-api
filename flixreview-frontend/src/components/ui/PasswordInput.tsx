import { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={`w-full px-3 py-2 pr-10 bg-[rgba(255,255,255,0.05)] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-flix-accent/50 focus:border-flix-accent ${
            error ? 'border-red-500/50' : 'border-[rgba(255,255,255,0.1)]'
          } ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
        {error && (
          <p className="text-sm text-red-400 mt-1">{error}</p>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

// /app/components/auth/InputField.tsx

'use client'

import React, { useState, forwardRef } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: React.ReactNode
  error?: string
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, icon, type = 'text', error, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    return (
      <div className="space-y-1 w-full">
        {/* Label */}
        <label className="text-xs font-semibold uppercase text-foreground/80">
          {label}
        </label>

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Icon */}
          <span className="absolute left-3 text-foreground/60">{icon}</span>

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            {...props}
            className={`w-full border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm! outline-none focus:border-primary transition-colors text-foreground bg-transparent ${
              error ? 'border-red-500' : ''
            } ${className}`}
          />

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 text-foreground/60 hover:text-foreground cursor-pointer"
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  },
)

InputField.displayName = 'InputField'
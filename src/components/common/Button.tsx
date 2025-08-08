import React from 'react'
import clsx from 'clsx'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        'px-4 py-2 rounded-xl font-medium transition-all',
        variant === 'primary' && 'bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-400 hover:to-brand-600 text-white shadow-premium',
        variant === 'ghost' && 'bg-white/0 hover:bg-white/10 text-white/80',
        className
      )}
    />
  )
}

export function ComposeButton(props: Omit<ButtonProps, 'variant'>) {
  return (
    <Button
      {...props}
      className={clsx('w-full py-3 text-base')}
      variant="primary"
    />
  )
}



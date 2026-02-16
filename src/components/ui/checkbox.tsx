import * as React from "react"
import { cn } from "@/lib/utils"

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className="flex cursor-pointer items-center space-x-2">
        <input
          type="checkbox"
          className={cn(
            "rounded-sm border border-input bg-background text-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-4 w-4",
            className
          )}
          ref={ref}
          {...props}
        />
        <span className="text-sm text-foreground">{props.children}</span>
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox, CheckboxProps }
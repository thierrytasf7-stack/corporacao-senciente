import * as React from "react"
import { cn } from "@/lib/utils"

type RadioGroupProps = React.InputHTMLAttributes<HTMLInputElement> & {
  
}

const RadioGroup = React.forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className="flex cursor-pointer items-center space-x-2">
        <input
          type="radio"
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
RadioGroup.displayName = "RadioGroup"

export { RadioGroup, RadioGroupProps }
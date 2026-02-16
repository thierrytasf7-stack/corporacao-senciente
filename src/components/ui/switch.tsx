import * as React from "react"
import { cn } from "@/lib/utils"

type SwitchProps = React.InputHTMLAttributes<HTMLInputElement> & {
  
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className="flex cursor-pointer items-center space-x-2">
        <input
          type="checkbox"
          className={cn(
            "relative w-12 h-6 rounded-full border border-input bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
Switch.displayName = "Switch"

export { Switch, SwitchProps }
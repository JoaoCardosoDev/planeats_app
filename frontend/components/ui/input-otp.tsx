"use client"

import * as React from "react"
import { cn } from "./cn"

const OTPInputContext = React.createContext<{
  slots: Array<{
    char: string
    hasFakeCaret: boolean
    isActive: boolean
  }>
}>({
  slots: [],
})

const InputOTP = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex items-center", className)} {...props}>
      {children}
    </div>
  )
})
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  const [slots, setSlots] = React.useState<
    Array<{
      char: string
      hasFakeCaret: boolean
      isActive: boolean
    }>
  >([])

  React.useEffect(() => {
    const count = React.Children.count(children)
    setSlots(
      Array.from({ length: count }, (_, i) => ({
        char: "",
        hasFakeCaret: false,
        isActive: false,
      }))
    )
  }, [children])

  return (
    <OTPInputContext.Provider value={{ slots }}>
      <div
        ref={ref}
        className={cn("flex items-center has-[:disabled]:opacity-50", className)}
        {...props}
      >
        {children}
      </div>
    </OTPInputContext.Provider>
  )
})
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

const Dot = () => (
  <div className="h-1 w-1 rounded-full bg-border" />
)

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
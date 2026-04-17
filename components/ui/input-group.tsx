import * as React from "react"
import { cn } from "@/lib/utils"

function InputGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="input-group"
      className={cn("relative flex items-center", className)}
      {...props}
    />
  )
}

function InputGroupInlineEnd({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="input-group-inline-end"
      className={cn("absolute right-0 inset-y-0 flex items-center pr-2", className)}
      {...props}
    />
  )
}

export { InputGroup, InputGroupInlineEnd }

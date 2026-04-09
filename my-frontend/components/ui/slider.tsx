"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
  className="relative grow overflow-hidden rounded-full bg-slate-200 h-2"
  >
  <SliderPrimitive.Range
    className="absolute bg-[#2C7DA0] h-full"
  />
</SliderPrimitive.Track>

<SliderPrimitive.Thumb
  className="block h-5 w-5 rounded-full bg-[#2C7DA0] border-2 border-white shadow-md hover:scale-105 transition"
  />
      
    </SliderPrimitive.Root>
  )
}

export { Slider }

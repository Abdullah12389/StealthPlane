"use client"

import * as React from "react"
import {
  // Using the namespace alias for main component types
  Legend as RechartsLegend,
  Tooltip as RechartsTooltip,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  Area as RechartsArea,
  Line as RechartsLine,
  Bar as RechartsBar,
  ComposedChart as RechartsComposedChart,
  // Import basic types from the main export
  type TooltipProps as RechartsTooltipProps,
  type LegendProps as RechartsLegendProps,
} from "recharts"

// --- SAFELY DEFINED RECHARTS TYPES ---
// FIX TS2344: Removed ' | undefined' from ChartValueType and ChartNameType
// to satisfy Recharts' internal generic constraints for TooltipProps.
type ChartValueType = string | number | Array<string | number>
type ChartNameType = string | number

// Tooltip Payload structure (as passed to custom content)
interface ChartTooltipPayload<
    V extends ChartValueType = ChartValueType,
    N extends ChartNameType = ChartNameType,
> {
    name?: N
    value?: V
    color?: string
    dataKey?: string | number | ((data: any) => string | number)
    payload: any // The data object for the row
    unit?: string | number
}

// Legend Payload structure (as passed to custom content)
interface ChartLegendPayload {
    value: string // The name of the item
    id: string
    type?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye'
    color?: string
    payload?: ChartValueType // The data value
}
// --- END OF SAFELY DEFINED TYPES ---


// Placeholder utility function (assuming from a standard project setup)
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ')
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>{children}</div>
)
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("p-6 pt-0", className)}>{children}</div>
)
const CardFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("flex items-center p-6 pt-0", className)}>{children}</div>
)

// --- Tooltip Component Fixes ---

// 1. Corrected ChartTooltipContentProps interface using custom safe types
interface ChartTooltipContentProps<
    ValueType extends ChartValueType = ChartValueType,
    NameType extends ChartNameType = ChartNameType,
>
  extends Omit<RechartsTooltipProps<ValueType, NameType>, "content"> {
  payload?: ChartTooltipPayload<ValueType, NameType>[]
  label?: NameType
  className?: string // FIX TS2339: Added missing className prop
}

/**
 * Custom content component for Recharts Tooltip
 * @see https://recharts.org/en-US/api/Tooltip#content
 */
function ChartTooltipContent<
    ValueType extends ChartValueType = ChartValueType,
    NameType extends ChartNameType = ChartNameType,
>({
  active,
  payload, 
  label,
  formatter,
  labelFormatter,
  className, // className is now correctly destructured
  ...props
}: ChartTooltipContentProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const labelValue = labelFormatter ? labelFormatter(label, payload) : label;

  return (
    <Card className={cn("px-2 py-1 shadow-lg text-xs", className)} {...props}>
      <p className="font-medium text-foreground">{labelValue}</p>
      <div className="space-y-1">
        {payload.map((item, index) => {
          const finalValue = formatter && item?.value !== undefined && item.name
            ? formatter(item.value, item.name, item, index, item.payload)
            : item.value

          return (
            <div
              key={`item-${item.name}-${index}`}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <span className="font-medium text-foreground">{finalValue as React.ReactNode}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// --- Legend Component Fixes ---

// 2. Corrected ChartLegendProps interface using the main Recharts type and safe payload
interface ChartLegendProps extends Pick<RechartsLegendProps, "verticalAlign"> {
  className?: string
  // Payload is passed automatically when used as content
  payload?: ChartLegendPayload[]
}

/**
 * Custom content component for Recharts Legend
 * @see https://recharts.org/en-US/api/Legend#content
 */
function ChartLegend({ className, payload, verticalAlign = "bottom" }: ChartLegendProps) {
  const payloadArray: ChartLegendPayload[] | undefined = payload;

  if (!payloadArray || !payloadArray.length) {
    return null
  }

  return (
    <CardFooter>
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-4",
          verticalAlign === "top" ? "mb-6" : "mt-6",
          className
        )}
      >
        {payloadArray.map((item, index) => {
          return (
            <div
              key={`legend-${item.value}-${index}`}
              className="flex items-center gap-1.5"
            >
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.value}</span>
            </div>
          )
        })}
      </div>
    </CardFooter>
  )
}


// --- Main Chart Component (Placeholder) ---

interface ChartProps extends React.ComponentProps<typeof RechartsComposedChart> {
  data: any[] // Simplified for example
  type: 'line' | 'bar' | 'area' | 'composed'
  children: React.ReactNode
}

/**
 * Wrapper component for Recharts.
 * This is where the custom Tooltip and Legend content is integrated.
 */
export function Chart({ data, type, className, children, ...props }: ChartProps) {
  const chartProps = {
    data,
    margin: { top: 24, right: 24, left: 24, bottom: 24 },
    className: cn("w-full h-[300px]", className),
    ...props,
  }

  // Example integration of the fixed custom components
  return (
    <Card className="w-full">
      <CardContent className="h-[300px] p-4 sm:p-6">
        <RechartsComposedChart {...chartProps}>
          <RechartsXAxis dataKey="name" stroke="#6b7280" />
          <RechartsYAxis stroke="#6b7280" />

          {/* Integration of the corrected Tooltip component */}
          <RechartsTooltip content={<ChartTooltipContent />} />

          {children}

          {/* FIX for TS2739: Use RechartsLegend and pass ChartLegend as content */}
          <RechartsLegend verticalAlign="bottom" content={<ChartLegend />} /> 
          
        </RechartsComposedChart>
      </CardContent>
      {/* Remove the redundant standalone ChartLegend call from here */}
    </Card>
  )
}

// Exported Recharts components for flexible use
export const ChartArea = RechartsArea
export const ChartLine = RechartsLine
export const ChartBar = RechartsBar
export const ChartXAxis = RechartsXAxis
export const ChartYAxis = RechartsYAxis
export const ChartLegendPrimitive = RechartsLegend // Renamed to avoid confusion with wrapper

// Export the custom content components for direct use if needed
export { ChartTooltipContent, ChartLegend }


// Example App component to demonstrate usage
const mockData = [
    { name: 'Jan', uv: 400, pv: 2400, amt: 2400 },
    { name: 'Feb', uv: 300, pv: 1398, amt: 2210 },
    { name: 'Mar', uv: 200, pv: 9800, amt: 2290 },
    { name: 'Apr', uv: 278, pv: 3908, amt: 2000 },
    { name: 'May', uv: 189, pv: 4800, amt: 2181 },
    { name: 'Jun', uv: 239, pv: 3800, amt: 2500 },
    { name: 'Jul', uv: 349, pv: 4300, amt: 2100 },
];

export default function App() {
  return (
    <div className="p-8 flex justify-center items-center h-screen bg-gray-50">
        <Chart data={mockData} type="composed">
            <ChartArea dataKey="amt" fill="#3b82f6" stroke="#2563eb" name="Amount" />
            <ChartBar dataKey="uv" fill="#f87171" name="Users" />
            <ChartLine dataKey="pv" stroke="#10b981" name="Views" />
        </Chart>
    </div>
  )
}
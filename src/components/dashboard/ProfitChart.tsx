"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "motion/react";

interface DataPoint {
  date: string;
  profit: number;
}

interface ProfitChartProps {
  data: DataPoint[];
  isLoading?: boolean;
  title?: string;
  period: "7d" | "30d" | "90d";
  onPeriodChange: (period: "7d" | "30d" | "90d") => void;
}

export function ProfitChart({
  data,
  isLoading,
  title = "Profit Over Time",
  period,
  onPeriodChange,
}: ProfitChartProps) {
  if (isLoading) {
    return (
      <Card className="p-4 sm:p-5 md:p-6 border-border rounded-xl">
        <Skeleton className="h-5 w-32 sm:h-6 sm:w-40 mb-3 sm:mb-4" />
        <div className="h-48 sm:h-56 md:h-64 flex flex-col justify-end gap-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[95%]" />
          <Skeleton className="h-3 w-[90%]" />
          <Skeleton className="h-3 w-[85%]" />
          <Skeleton className="h-3 w-[80%]" />
          <Skeleton className="h-3 w-[75%]" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    day: d.date,
    value: d.profit,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="p-4 sm:p-5 md:p-6 border-border rounded-xl">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-3 sm:mb-4">
          <h3 className="font-medium text-sm sm:text-base">{title}</h3>
          <Tabs value={period} onValueChange={(v) => onPeriodChange(v as "7d" | "30d" | "90d")}>
            <TabsList className="h-8 sm:h-9">
              <TabsTrigger value="7d" className="text-xs sm:text-sm px-2 sm:px-3">7D</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs sm:text-sm px-2 sm:px-3">30D</TabsTrigger>
              <TabsTrigger value="90d" className="text-xs sm:text-sm px-2 sm:px-3">90D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="h-48 sm:h-56 md:h-64">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground flex items-center h-full">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="day"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fontSize: 10 }}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number | undefined) => [`$${Number(value ?? 0).toFixed(2)}`, "Profit"]}
                  labelFormatter={(label) => label}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--primary)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
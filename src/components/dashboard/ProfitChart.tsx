"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
      <Card className="p-6 border-border rounded-xl">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="h-64 flex flex-col justify-end gap-3">
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
      <Card className="p-6 border-border rounded-xl">
        <div className="mb-4">
          <h3 className="mb-2 font-medium">{title}</h3>
          <Tabs value={period} onValueChange={(v) => onPeriodChange(v as "7d" | "30d" | "90d")}>
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="h-64">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground flex items-center h-full">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="day"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number | undefined) => [`$${Number(value ?? 0).toFixed(2)}`, "Profit"]}
                  labelFormatter={(label) => label}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  isLoading?: boolean;
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = "neutral",
  isLoading,
  className,
}: KPICardProps) {
  if (isLoading) {
    return (
      <Card className={cn("p-4 sm:p-5 md:p-6", className)}>
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-3 w-16 sm:h-4 sm:w-24" />
          <Icon className="size-3.5 sm:size-4 text-muted-foreground" />
        </div>
        <Skeleton className="h-6 w-24 sm:h-8 sm:w-32 mb-2" />
        {subtitle && <Skeleton className="h-3 w-16 sm:w-20" />}
      </Card>
    );
  }

  const displayValue =
    typeof value === "number" ? formatCurrency(value) : value;
  const trendColor =
    trend === "up"
      ? "text-profit"
      : trend === "down"
        ? "text-loss"
        : "text-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className={cn("p-4 sm:p-5 md:p-6 border-border", className)}>
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <span className="text-xs sm:text-sm text-muted-foreground leading-tight pr-2 truncate">
            {title}
          </span>
          <Icon className="size-3.5 sm:size-4 text-primary shrink-0" />
        </div>
        <p className={cn("text-lg sm:text-xl md:text-2xl font-semibold truncate", trendColor)}>
          {displayValue}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
        )}
      </Card>
    </motion.div>
  );
}
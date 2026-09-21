import { Card } from "./Card";
import { ArrowUpRight, ArrowDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  isPrimary?: boolean;
}

export function KpiCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  isPrimary = false,
}: KpiCardProps) {
  const bgColor = isPrimary
    ? "bg-indigo-100 border border-indigo-200"
    : "bg-white border border-gray-200";
  const textColor = isPrimary ? "text-indigo-600" : "text-gray-800";

  return (
    <Card className={bgColor}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        <div className={`w-9 h-9 ${isPrimary ? "bg-indigo-50" : "bg-gray-50"} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${textColor}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800 tracking-tight font-mono">
        {value}
      </p>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
        {subtitle && (
          <p className="text-sm font-medium text-gray-500 truncate">
            {subtitle}
          </p>
        )}
        {change !== undefined && (
          <span
            className={`text-xs font-medium ${
              change > 0
                ? "text-green-600"
                : change < 0
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {change !== 0 ? (
              <>
                {change > 0 ? (
                  <ArrowUpRightDown className="w-3 h-3 inline" />
                ) : (
                  <Minus className="w-3 h-3 inline" />
                )}
                {Math.abs(change)}%
              </>
            ) : (
              <>
                <Minus className="w-3 h-3 inline" /> 0%
              </>
            )}
          </span>
        )}
      </div>
    </Card>
  );
}

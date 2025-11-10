import { TrendingUp } from "lucide-react";

interface StatCardProps {
  value: string;
  label: string;
  trend?: string;
}

export function StatCard({ value, label, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 mb-1">{label}</p>
          <p className="text-emerald-600">{value}</p>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-red-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}

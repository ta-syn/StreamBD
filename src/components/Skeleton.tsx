import { motion } from "framer-motion";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = "20px",
  borderRadius = "4px",
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}

export function SkeletonBanner() {
  return (
    <div className="w-full h-[260px] sm:h-[420px] relative overflow-hidden" style={{ background: "#0A0A0F" }}>
      <div className="absolute inset-0 flex items-center px-6 sm:px-12 lg:px-20">
        <div className="max-w-[600px] w-full flex flex-col gap-3">
          <Skeleton width="80px" height="22px" borderRadius="12px" />
          <Skeleton width="70%" height="48px" borderRadius="6px" />
          <Skeleton width="50%" height="16px" borderRadius="4px" />
          <div className="flex gap-3 mt-2">
            <Skeleton width="140px" height="48px" borderRadius="8px" />
            <Skeleton width="120px" height="48px" borderRadius="8px" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTabs() {
  return (
    <div className="flex items-center gap-2 px-6 h-[52px]" style={{ background: "#111118" }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton
          key={i}
          width={`${70 + (i % 4) * 12}px`}
          height="32px"
          borderRadius="20px"
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div
      className="rounded-[12px] overflow-hidden"
      style={{
        background: "#1A1A24",
        border: "1px solid #2A2A38",
      }}
    >
      <Skeleton width="100%" height="100%" borderRadius="0" className="absolute inset-0" />
      <div className="p-2.5 flex flex-col gap-2">
        <Skeleton width="75%" height="14px" borderRadius="4px" />
        <Skeleton width="40%" height="11px" borderRadius="3px" />
      </div>
    </div>
  );
}

export function SkeletonCardGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04 }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
    </div>
  );
}

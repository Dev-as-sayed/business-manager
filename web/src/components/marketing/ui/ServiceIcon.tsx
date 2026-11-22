import {
  FiCamera,
  FiMonitor,
  FiSearch,
  FiTool,
  FiTrendingUp,
} from "react-icons/fi";
import type { ServiceId } from "@/content/services";
import { cn } from "@/lib/utils";

const icons = {
  sourcing: FiSearch,
  development: FiTool,
  software: FiMonitor,
  content: FiCamera,
  marketing: FiTrendingUp,
};

export function ServiceIcon({
  service,
  className,
}: {
  service: ServiceId;
  className?: string;
}) {
  const Icon = icons[service];
  return <Icon aria-hidden="true" className={cn("h-5 w-5", className)} />;
}

"use client";

import type { IconType } from "react-icons";
import {
  FiAward,
  FiBarChart2,
  FiCamera,
  FiCpu,
  FiEdit3,
  FiEye,
  FiFileText,
  FiGlobe,
  FiLayers,
  FiMonitor,
  FiPackage,
  FiRepeat,
  FiShield,
  FiSmartphone,
  FiTarget,
  FiTool,
  FiTrendingUp,
  FiTruck,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import type { IconKey } from "@/lib/marketing-content";

const icons: Record<IconKey, IconType> = {
  package: FiPackage,
  tool: FiTool,
  monitor: FiMonitor,
  camera: FiCamera,
  trending: FiTrendingUp,
  globe: FiGlobe,
  truck: FiTruck,
  shield: FiShield,
  users: FiUsers,
  smartphone: FiSmartphone,
  chart: FiBarChart2,
  layers: FiLayers,
  zap: FiZap,
  target: FiTarget,
  edit: FiEdit3,
  cpu: FiCpu,
  award: FiAward,
  repeat: FiRepeat,
  file: FiFileText,
  eye: FiEye,
};

export default function Icon({
  name,
  className,
}: {
  name: IconKey;
  className?: string;
}) {
  const Component = icons[name] ?? FiZap;
  return <Component className={className} aria-hidden="true" />;
}

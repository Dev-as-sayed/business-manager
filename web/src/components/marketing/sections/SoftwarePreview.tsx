"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  FiBarChart2,
  FiLayers,
  FiPackage,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";
import {
  softwareTabs,
  type SoftwareTabId,
} from "@/content/home";
import { cn } from "@/lib/utils";

const tabIcons: Record<SoftwareTabId, IconType> = {
  storefront: FiShoppingBag,
  orders: FiPackage,
  inventory: FiLayers,
  crm: FiUsers,
  analytics: FiBarChart2,
};

const orderRows = [
  { id: "OM-1042", customer: "A. Rivera", status: "Paid", total: "$84.00" },
  { id: "OM-1041", customer: "J. Chen", status: "Packed", total: "$42.00" },
  { id: "OM-1040", customer: "M. Okafor", status: "Shipped", total: "$126.00" },
  { id: "OM-1039", customer: "L. Novak", status: "Paid", total: "$58.00" },
];

const inventoryRows = [
  { name: "Everyday tote", stock: "82 / 120", width: "68%" },
  { name: "Desk tray", stock: "34 / 80", width: "42%" },
  { name: "Travel pouch", stock: "12 / 60", width: "20%" },
];

const pipeline = [
  { title: "New", cards: ["Instagram comment", "Email signup"] },
  { title: "Warm", cards: ["Cart started", "DM replied"] },
  { title: "Customer", cards: ["Order OM-1042", "Repeat buyer"] },
];

const bars = [32, 46, 38, 58, 50, 72, 64, 84, 70, 92];

export function SoftwarePreview({ className }: { className?: string }) {
  const [active, setActive] = useState<SoftwareTabId>(softwareTabs[0].id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const reduceMotion = useReducedMotion();
  const activeTab =
    softwareTabs.find((tab) => tab.id === active) ?? softwareTabs[0];
  const tabIds = softwareTabs.map((tab) => tab.id);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = tabIds.indexOf(active);
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % tabIds.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabIds.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    const next = tabIds[nextIndex];
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-band p-2.5 shadow-lift sm:p-3">
        <div className="flex items-center justify-between gap-3 px-2 pb-2.5">
          <div aria-hidden="true" className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
          </div>
          <span className="truncate font-mono text-[8px] uppercase tracking-[0.16em] text-band-muted sm:text-[9px]">
            omnia.app / your dashboard
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-band-muted">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lime" />
            Demo
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Software preview sections"
          onKeyDown={handleKeyDown}
          className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-band-surface p-1"
        >
          {softwareTabs.map((tab) => {
            const Icon = tabIcons[tab.id];
            const selected = active === tab.id;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[tab.id] = node;
                }}
                type="button"
                role="tab"
                id={`software-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`software-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors",
                  selected
                    ? "bg-lime text-lime-contrast"
                    : "text-band-muted hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon aria-hidden="true" className="h-3 w-3" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative mt-2 overflow-hidden rounded-2xl bg-paper p-2.5 sm:p-3">
          <div className="relative overflow-hidden rounded-xl border border-line bg-surface lg:pr-32">
            <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-ink text-[8px] font-bold text-lime">
                  O
                </span>
                <span className="text-[10px] font-semibold text-ink">Omnia</span>
              </div>
              <div className="flex items-center gap-2 text-[8px] text-ink-muted">
                <span className="hidden sm:inline">Storefront</span>
                <span>Orders</span>
                <span>Inventory</span>
                <span>CRM</span>
                <span>Analytics</span>
              </div>
              <span className="rounded-full bg-lime-soft px-2 py-0.5 text-[8px] font-medium text-lime-ink">
                Live
              </span>
            </div>

            <div className="p-3 sm:p-4">
              <motion.div
                key={active}
                initial={reduceMotion ? false : { opacity: 0.55 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                role="tabpanel"
                id={`software-panel-${active}`}
                aria-labelledby={`software-tab-${active}`}
                tabIndex={0}
              >
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink-muted">
                  Preview
                </p>
                <h4 className="mt-1 font-display text-base font-semibold tracking-[-0.02em] text-ink">
                  {activeTab.title}
                </h4>
                <div className="mt-3">
                  {active === "storefront" ? <StorefrontPanel /> : null}
                  {active === "orders" ? <OrdersPanel /> : null}
                  {active === "inventory" ? <InventoryPanel /> : null}
                  {active === "crm" ? <CrmPanel /> : null}
                  {active === "analytics" ? <AnalyticsPanel /> : null}
                </div>
              </motion.div>
            </div>
          </div>

          <PhoneMock />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-2.5">
          <p className="max-w-md text-[11px] leading-relaxed text-band-muted">
            {activeTab.description}
          </p>
          <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-band-muted">
            Illustrative UI · Demo data
          </span>
        </div>
      </div>
    </div>
  );
}

function StorefrontPanel() {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-lime-strong" />
          <span className="font-display text-[11px] font-semibold text-ink">
            Your brand
          </span>
        </div>
        <div className="flex items-center gap-2 text-[8px] text-ink-muted">
          <span>Shop</span>
          <span className="hidden sm:inline">About</span>
          <span className="rounded-full bg-ink px-2 py-0.5 text-[7px] font-medium text-white">
            Cart 2
          </span>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-lg bg-lime-soft p-3">
          <p className="font-mono text-[7px] uppercase tracking-[0.16em] text-lime-ink">
            New drop
          </p>
          <p className="mt-1 font-display text-sm font-semibold leading-tight text-ink">
            Made for your everyday.
          </p>
          <span className="mt-2 inline-block rounded-full bg-ink px-2.5 py-1 text-[8px] font-semibold text-white">
            Shop now
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-line bg-surface p-1.5"
            >
              <div className="aspect-square rounded-md bg-gradient-to-br from-surface-2 to-line" />
              <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-line" />
              <div className="mt-1 h-1.5 w-1/2 rounded-full bg-line" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrdersPanel() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <p className="text-[10px] font-semibold text-ink">Orders</p>
        <span className="rounded-full bg-lime-soft px-2 py-0.5 font-mono text-[7px] text-lime-ink">
          12 open
        </span>
      </div>
      <div className="divide-y divide-line">
        {orderRows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 px-3 py-1.5 text-[8px]"
          >
            <span className="font-mono text-ink-muted">{row.id}</span>
            <span className="truncate text-ink">{row.customer}</span>
            <span className="flex items-center gap-2">
              <span
                className={
                  row.status === "Paid"
                    ? "rounded-full bg-lime-soft px-1.5 py-0.5 text-[7px] text-lime-ink"
                    : "rounded-full bg-surface-2 px-1.5 py-0.5 text-[7px] text-ink-muted"
                }
              >
                {row.status}
              </span>
              <span className="font-mono text-ink-muted">{row.total}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryPanel() {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-ink">Inventory</p>
        <span className="font-mono text-[7px] uppercase tracking-[0.14em] text-ink-muted">
          Live stock
        </span>
      </div>
      <div className="mt-3 space-y-3">
        {inventoryRows.map((row) => (
          <div key={row.name}>
            <div className="flex items-center justify-between gap-2 text-[8px]">
              <span className="text-ink">{row.name}</span>
              <span className="font-mono text-ink-muted">{row.stock}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-lime-strong"
                style={{ width: row.width }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-lime-soft px-2 py-1.5 text-[8px]">
        <span className="text-lime-ink">Travel pouch is low</span>
        <span className="font-mono text-lime-ink">Reorder</span>
      </div>
    </div>
  );
}

function CrmPanel() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {pipeline.map((column) => (
        <div
          key={column.title}
          className="rounded-xl border border-line bg-surface p-2"
        >
          <p className="font-mono text-[7px] uppercase tracking-[0.14em] text-ink-muted">
            {column.title}
          </p>
          <div className="mt-2 space-y-1.5">
            {column.cards.map((card) => (
              <div
                key={card}
                className="rounded-lg border border-line bg-surface-2 p-1.5 text-[7px] leading-snug text-ink"
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsPanel() {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-ink">Sales overview</p>
        <span className="font-mono text-[7px] uppercase tracking-[0.14em] text-ink-muted">
          Last 10 days
        </span>
      </div>
      <div className="mt-4 flex h-24 items-end gap-1.5">
        {bars.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t bg-lime-strong/70"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 border-t border-line pt-2 text-[7px] text-ink-muted">
        <span>Revenue</span>
        <span>Sessions</span>
        <span>Conversion</span>
      </div>
    </div>
  );
}

function PhoneMock() {
  return (
    <div
      aria-hidden="true"
      className="absolute bottom-4 right-3 hidden w-28 rounded-[1.4rem] border-4 border-ink bg-surface p-1 shadow-2xl lg:block"
    >
      <div className="mx-auto mb-1 h-1 w-8 rounded-full bg-ink/20" />
      <div className="overflow-hidden rounded-[1rem] border border-line">
        <div className="bg-lime-soft px-2 py-2">
          <p className="font-mono text-[6px] uppercase tracking-wider text-lime-ink">
            New drop
          </p>
          <p className="mt-0.5 font-display text-[9px] font-semibold leading-tight text-ink">
            Made for your everyday.
          </p>
          <span className="mt-1 inline-block rounded-full bg-ink px-1.5 py-0.5 text-[6px] font-semibold text-white">
            Shop
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 p-1.5">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="aspect-square rounded-md bg-gradient-to-br from-surface-2 to-line"
            />
          ))}
        </div>
        <div className="flex items-center justify-around border-t border-line px-1 py-1.5 text-[6px] text-ink-muted">
          <span className="font-semibold text-ink">Shop</span>
          <span>Cart</span>
          <span>Account</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import type { StrategyMetric, TicketMetric } from "@/types/api";

interface MetricsDashboardProps {
  perStrategy: StrategyMetric[];
  tickets?: TicketMetric[];
  totalOrders: number;
  isSimulating: boolean;
}

const STRATEGY_LABELS: Record<string, string> = {
  vulnerable: "Vulnerable",
  semi_resilient: "Semi Resilient",
  resilient: "Resilient",
};

const COLORS = {
  success: "#597864",
  failed: "#C83E4D",
  tickets: "#D4A574",
  vulnerable: "#C83E4D",
  semi_resilient: "#D4A574",
  resilient: "#597864",
};

const PIE_COLORS = ["#597864", "#D4A574", "#C83E4D"];

// Custom tooltip matching the velvet cream theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-[#2C2825] text-[#FDFBF7] px-3 py-2 rounded-lg shadow-xl border border-[#36322F] text-xs">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

export default function MetricsDashboard({
  perStrategy,
  tickets,
  totalOrders,
  isSimulating,
}: MetricsDashboardProps) {
  const capacity = tickets?.[0]?.totalCapacity || 0;

  // Live Terminal Logs State
  const [logs, setLogs] = useState<{ id: number; time: string; strategy: string; type: "success" | "error" | "warning"; message: string }[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      const strategies = ["VULNERABLE", "SEMI_RESILIENT", "RESILIENT"];
      const strategy = strategies[Math.floor(Math.random() * strategies.length)];
      const isVuln = strategy === "VULNERABLE";
      const isRes = strategy === "RESILIENT";
      
      let type: "success" | "error" | "warning" = "success";
      let message = "Lock acquired, Order saved";
      
      const rand = Math.random();
      if (isVuln && rand > 0.5) {
        type = "error";
        message = "Deadlock transaction detected";
      } else if (!isRes && !isVuln && rand > 0.7) {
        type = "warning";
        message = "Timeout acquiring lock";
      } else if (isRes) {
        type = "success";
        message = "Success: Lock acquired, Order saved";
      } else {
         type = "success";
         message = "Order placed successfully";
      }

      setLogs((prev) => {
        const newLogs = [...prev, {
          id: Date.now(),
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          strategy,
          type,
          message
        }];
        return newLogs.slice(-20); // Keep last 20 logs
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isSimulating]);

  useEffect(() => {
    // Auto-scroll to bottom of logs
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Bar chart data
  const barData = useMemo(
    () =>
      perStrategy.map((m) => ({
        name: STRATEGY_LABELS[m.strategy] || m.strategy,
        Success: m.successOrders,
        Failed: m.failedOrders,
      })),
    [perStrategy]
  );

  // Pie chart data (distribution of total orders per strategy)
  const pieData = useMemo(
    () =>
      perStrategy
        .filter((m) => m.totalOrders > 0)
        .map((m) => ({
          name: STRATEGY_LABELS[m.strategy] || m.strategy,
          value: m.totalOrders,
        })),
    [perStrategy]
  );

  // Radar chart data (multi-axis comparison)
  const radarData = useMemo(() => {
    const maxOrders = Math.max(...perStrategy.map((m) => m.totalOrders), 1);
    const maxTickets = Math.max(...perStrategy.map((m) => m.totalTicketsSold), 1);

    return [
      {
        metric: "Total Orders",
        ...Object.fromEntries(
          perStrategy.map((m) => [
            STRATEGY_LABELS[m.strategy],
            Math.round((m.totalOrders / maxOrders) * 100),
          ])
        ),
      },
      {
        metric: "Success Rate",
        ...Object.fromEntries(
          perStrategy.map((m) => [
            STRATEGY_LABELS[m.strategy],
            m.totalOrders ? Math.round((m.successOrders / m.totalOrders) * 100) : 0,
          ])
        ),
      },
      {
        metric: "Tickets Sold",
        ...Object.fromEntries(
          perStrategy.map((m) => [
            STRATEGY_LABELS[m.strategy],
            Math.round((m.totalTicketsSold / maxTickets) * 100),
          ])
        ),
      },
      {
        metric: "Failure Rate",
        ...Object.fromEntries(
          perStrategy.map((m) => [
            STRATEGY_LABELS[m.strategy],
            m.totalOrders ? Math.round((m.failedOrders / m.totalOrders) * 100) : 0,
          ])
        ),
      },
    ];
  }, [perStrategy]);

  const hasData = totalOrders > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-xl text-[#2C2825] dark:text-[#FDFBF7]">
            Strategy Comparison
          </h3>
          {isSimulating && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C83E4D]/10 text-[#C83E4D] text-xs font-semibold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C83E4D]" />
              Simulating...
            </span>
          )}
        </div>
        <span className="text-xs text-[#7A726D] dark:text-[#9C958E] font-medium">
          Total: {totalOrders.toLocaleString()} orders
        </span>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {perStrategy.map((metric) => {
          const successRate = metric.totalOrders
            ? ((metric.successOrders / metric.totalOrders) * 100).toFixed(1)
            : "0.0";
            
          const isOversold = capacity > 0 && metric.totalTicketsSold > capacity;
          const oversoldAmount = isOversold ? metric.totalTicketsSold - capacity : 0;
          const isWinner = capacity > 0 && !isOversold && metric.strategy === "resilient" && metric.totalOrders > 0;

          return (
            <div
              key={metric.strategy}
              className={`bg-[#FFFFFF] dark:bg-[#242220]/60 border ${isWinner ? 'border-[#597864] shadow-[0_0_15px_rgba(89,120,100,0.3)]' : 'border-[#EAE6E1] dark:border-[#36322F]'} rounded-xl p-5 shadow-sm relative overflow-hidden transition-all`}
            >
              {isSimulating && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C83E4D] to-transparent animate-pulse" />
              )}
              <div className="flex items-start justify-between">
                <p className="text-xs text-[#7A726D] dark:text-[#9C958E] uppercase tracking-wider font-semibold">
                  {STRATEGY_LABELS[metric.strategy]}
                </p>
                {isWinner && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#597864]/20 text-[#597864] border border-[#597864]/30 flex items-center gap-1">
                    🏆 Best Strategy
                  </span>
                )}
              </div>
              <p className="text-3xl font-extrabold text-[#2C2825] dark:text-[#FDFBF7] mt-1">
                {successRate}
                <span className="text-base font-medium text-[#7A726D] ml-0.5">%</span>
              </p>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-xs text-[#9C958E]">
                  {metric.successOrders.toLocaleString()} sukses &bull;{" "}
                  {metric.failedOrders.toLocaleString()} gagal
                </p>
                {isOversold ? (
                  <p className="text-xs font-semibold text-[#C83E4D] bg-[#C83E4D]/10 inline-block px-2 py-1 rounded w-fit mt-1">
                    ⚠️ Oversold by {oversoldAmount.toLocaleString()} tickets!
                  </p>
                ) : (
                  capacity > 0 && metric.totalTicketsSold > 0 && (
                    <p className="text-xs font-semibold text-[#597864] bg-[#597864]/10 inline-block px-2 py-1 rounded w-fit mt-1">
                      ✅ Safe (No Oversell)
                    </p>
                  )
                )}
              </div>
              {/* Mini progress bar */}
              <div className="w-full h-1.5 bg-[#EAE6E1] dark:bg-[#36322F] rounded-full overflow-hidden flex mt-3">
                <div
                  className="h-full bg-[#597864] transition-all duration-700"
                  style={{
                    width: `${metric.totalOrders ? (metric.successOrders / metric.totalOrders) * 100 : 0}%`,
                  }}
                />
                <div
                  className="h-full bg-[#C83E4D] transition-all duration-700"
                  style={{
                    width: `${metric.totalOrders ? (metric.failedOrders / metric.totalOrders) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Terminal Log */}
      {isSimulating && (
        <div className="bg-[#1A1817] rounded-xl border border-[#36322F] shadow-inner overflow-hidden flex flex-col h-48">
          <div className="bg-[#242220] px-4 py-2 border-b border-[#36322F] flex items-center justify-between">
            <p className="text-xs font-mono text-[#9C958E] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Transaction Logs
            </p>
            <p className="text-xs font-mono text-[#9C958E]">
              {logs.length} events
            </p>
          </div>
          <div className="p-4 overflow-y-auto font-mono text-[11px] leading-relaxed flex-1 space-y-1">
            {logs.map((log) => {
              let colorClass = "text-[#FDFBF7]";
              if (log.type === "error") colorClass = "text-[#C83E4D]";
              if (log.type === "warning") colorClass = "text-[#D4A574]";
              if (log.type === "success") colorClass = "text-[#597864]";

              return (
                <div key={log.id} className="flex items-start gap-3">
                  <span className="text-[#7A726D] shrink-0">[{log.time}]</span>
                  <span className="text-[#9C958E] shrink-0 w-[120px]">[{log.strategy}]</span>
                  <span className={`${colorClass} break-all`}>
                    {log.type === "error" && "🔴 "}
                    {log.type === "warning" && "🟡 "}
                    {log.type === "success" && "🟢 "}
                    {log.message}
                  </span>
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}

      {/* Charts Grid */}
      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart: Success vs Failed */}
          <div className="bg-[#FFFFFF] dark:bg-[#242220]/60 border border-[#EAE6E1] dark:border-[#36322F] rounded-xl p-5 shadow-sm">
            <p className="text-sm font-bold text-[#2C2825] dark:text-[#FDFBF7] mb-4">
              Success vs Failed Orders
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE6E1" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#7A726D" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#7A726D" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Success" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Failed" fill={COLORS.failed} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart: Order Distribution */}
          <div className="bg-[#FFFFFF] dark:bg-[#242220]/60 border border-[#EAE6E1] dark:border-[#36322F] rounded-xl p-5 shadow-sm">
            <p className="text-sm font-bold text-[#2C2825] dark:text-[#FDFBF7] mb-4">
              Order Distribution by Strategy
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-[#7A726D] dark:text-[#9C958E]">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart: Multi-Axis Comparison (Full Width) */}
          <div className="bg-[#FFFFFF] dark:bg-[#242220]/60 border border-[#EAE6E1] dark:border-[#36322F] rounded-xl p-5 shadow-sm lg:col-span-2">
            <p className="text-sm font-bold text-[#2C2825] dark:text-[#FDFBF7] mb-4">
              Multi-Axis Strategy Comparison
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#EAE6E1" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 11, fill: "#7A726D" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "#9C958E" }}
                />
                <Radar
                  name="Vulnerable"
                  dataKey="Vulnerable"
                  stroke={COLORS.vulnerable}
                  fill={COLORS.vulnerable}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name="Semi Resilient"
                  dataKey="Semi Resilient"
                  stroke={COLORS.semi_resilient}
                  fill={COLORS.semi_resilient}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name="Resilient"
                  dataKey="Resilient"
                  stroke={COLORS.resilient}
                  fill={COLORS.resilient}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-[#7A726D] dark:text-[#9C958E]">{value}</span>
                  )}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] dark:bg-[#242220]/60 border border-[#EAE6E1] dark:border-[#36322F] rounded-xl p-12 shadow-sm text-center">
          <div className="p-3 bg-[#EAE6E1] dark:bg-[#36322F] rounded-xl inline-block mb-3">
            <svg className="w-6 h-6 text-[#7A726D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#2C2825] dark:text-[#FDFBF7]">Belum ada data simulasi</p>
          <p className="text-xs text-[#7A726D] dark:text-[#9C958E] mt-1">
            Jalankan simulasi terlebih dahulu untuk melihat chart perbandingan antar strategi.
          </p>
        </div>
      )}
    </div>
  );
}

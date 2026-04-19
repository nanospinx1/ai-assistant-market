"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Headphones,
  TrendingUp,
  Palette,
  Calculator,
  BarChart3,
  Users,
  Monitor,
  Settings,
  Briefcase,
  Search,
  Star,
  Filter,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { AIEmployee } from "@/lib/types";
import { categories } from "@/data/employees";

const categoryConfig: Record<string, { icon: any; gradient: string }> = {
  "Customer Service": { icon: Headphones, gradient: "from-blue-500 to-cyan-500" },
  "Sales": { icon: TrendingUp, gradient: "from-emerald-500 to-teal-500" },
  "Marketing": { icon: Palette, gradient: "from-pink-500 to-rose-500" },
  "Finance": { icon: Calculator, gradient: "from-amber-500 to-orange-500" },
  "Analytics": { icon: BarChart3, gradient: "from-violet-500 to-purple-500" },
  "Human Resources": { icon: Users, gradient: "from-sky-500 to-blue-500" },
  "IT Support": { icon: Monitor, gradient: "from-slate-400 to-zinc-500" },
  "Operations": { icon: Settings, gradient: "from-indigo-500 to-blue-500" },
};

const defaultConfig = { icon: Briefcase, gradient: "from-gray-500 to-slate-500" };

function getCategoryConfig(category: string) {
  return categoryConfig[category] || defaultConfig;
}

export default function MarketplacePage() {
  const [employees, setEmployees] = useState<AIEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      const matchesCategory =
        activeCategory === "All" || emp.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [employees, activeCategory, searchQuery]);

  const activeFilterCount =
    (activeCategory !== "All" ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 text-[var(--text-primary)]">
          AI Employee Marketplace
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Find the perfect AI employee for your business
        </p>
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
        <div className="relative flex-1 w-full">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Search by name, role, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30 transition-all"
          />
        </div>
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20">
            <SlidersHorizontal size={14} className="text-[var(--primary)]" />
            <span className="text-xs font-medium text-[var(--primary)]">
              {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
            </span>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const config = getCategoryConfig(cat);
          const isActive = activeCategory === cat;
          const IconComponent = cat === "All" ? Briefcase : config.icon;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? `bg-gradient-to-r ${cat === "All" ? "from-indigo-500 to-violet-500" : config.gradient} text-white shadow-lg shadow-black/20`
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface)] border border-[var(--border)]"
              }`}
            >
              <IconComponent size={15} />
              {cat}
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[var(--text-muted)]">
          Showing <span className="text-[var(--text-primary)] font-semibold">{filtered.length}</span> employee{filtered.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Filter size={14} />
          <span>Sort by: Relevance</span>
        </div>
      </div>

      {/* Employee Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-[var(--bg-card)] animate-pulse border border-[var(--border)]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-[var(--text-muted)]" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">
            No employees found
          </h3>
          <p className="text-[var(--text-muted)]">
            Try adjusting your search or category filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((emp, idx) => {
            const config = getCategoryConfig(emp.category);
            const IconComponent = config.icon;

            return (
              <Link
                key={emp.id}
                href={`/marketplace/${emp.id}`}
                className="card-hover group rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex flex-col overflow-hidden animate-fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Gradient Strip + Category Badge */}
                <div className={`relative h-14 bg-gradient-to-r ${config.gradient} opacity-80`}>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/30 text-white backdrop-blur-sm">
                    {emp.category}
                  </span>
                </div>

                {/* Avatar Icon */}
                <div className="px-6 -mt-7 mb-3 relative z-10">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg border-2 border-[var(--bg-card)]`}>
                    <IconComponent size={24} className="text-white" />
                  </div>
                </div>

                {/* Role & Name */}
                <div className="px-6 flex-1">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-0.5 group-hover:text-white transition-colors">
                    {emp.role}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">
                    {emp.name}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">
                    {emp.description}
                  </p>
                </div>

                {/* Divider + Bottom Row */}
                <div className="px-6 pb-5">
                  <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <Star size={13} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {emp.rating}
                        </span>
                      </div>
                      {/* Price */}
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        ${emp.price_monthly}
                        <span className="text-xs font-normal text-[var(--text-muted)]">/mo</span>
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] group-hover:text-white transition-colors">
                      View Details
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

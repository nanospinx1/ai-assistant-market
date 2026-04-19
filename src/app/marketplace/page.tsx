"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Star, Filter, ArrowRight } from "lucide-react";
import { AIEmployee } from "@/lib/types";
import { categories } from "@/data/employees";

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

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Employee Marketplace</h1>
        <p className="text-[var(--text-secondary)]">
          Browse and hire pre-built AI employees ready to work for your business
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Search by name, role, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Filter size={16} />
          <span>{filtered.length} employees</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat
                ? "bg-[var(--primary)] text-white shadow-lg shadow-indigo-500/20"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card-hover)] border border-[var(--border)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Employee Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-[var(--bg-card)] animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-semibold mb-2">No employees found</h3>
          <p className="text-[var(--text-muted)]">
            Try adjusting your search or category filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((emp, idx) => (
            <div
              key={emp.id}
              className="card-hover rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6 flex flex-col animate-fade-in"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Avatar & Category */}
              <div className="flex items-start justify-between mb-4">
                <span className="text-5xl">{emp.avatar}</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary-light)] border border-[var(--primary)]/20">
                  {emp.category}
                </span>
              </div>

              {/* Name & Role */}
              <h3 className="text-lg font-semibold mb-1">{emp.name}</h3>
              <p className="text-sm text-[var(--primary-light)] mb-2">
                {emp.role}
              </p>

              {/* Description */}
              <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 flex-1">
                {emp.description}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(emp.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-[var(--text-muted)]"
                    }
                  />
                ))}
                <span className="text-sm text-[var(--text-secondary)] ml-1">
                  {emp.rating}
                </span>
                <span className="text-xs text-[var(--text-muted)] ml-1">
                  ({emp.reviews_count})
                </span>
              </div>

              {/* Price & CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <div>
                  <span className="text-xl font-bold">
                    ${emp.price_monthly}
                  </span>
                  <span className="text-sm text-[var(--text-muted)]">/mo</span>
                </div>
                <Link
                  href={`/marketplace/${emp.id}`}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
                >
                  View Details
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

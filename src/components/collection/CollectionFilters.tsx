import { useState, useRef, useEffect, useCallback } from "react";
import { Search, ArrowUpDown, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type BotSortOption = "default" | "name" | "rarity" | "owned" | "favorites";
/** @deprecated Use BotSortOption instead */
export type PetSortOption = BotSortOption;

const SORT_OPTIONS: { value: BotSortOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "name", label: "Name" },
  { value: "rarity", label: "Rarity" },
  { value: "owned", label: "Owned" },
  { value: "favorites", label: "Favorites" },
];

interface CollectionFiltersProps {
  activeTab: "bots" | "zones";
  onTabChange: (tab: "bots" | "zones") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: BotSortOption;
  onSortChange: (sort: BotSortOption) => void;
  botsStats: {
    unlocked: number;
    total: number;
  };
  zonesStats: {
    unlocked: number;
    total: number;
  };
}

export const CollectionFilters = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  botsStats,
  zonesStats,
}: CollectionFiltersProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Close sort dropdown on outside tap
  useEffect(() => {
    if (!showSortDropdown) return;
    const handleTap = (e: MouseEvent | TouchEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleTap);
    document.addEventListener("touchstart", handleTap);
    return () => {
      document.removeEventListener("mousedown", handleTap);
      document.removeEventListener("touchstart", handleTap);
    };
  }, [showSortDropdown]);

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    onSearchChange("");
  }, [onSearchChange]);

  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortOption)?.label || "Default";

  return (
    <div className="collection-header px-4 pt-3 pb-0">
      {/* Top row: Tabs + Actions */}
      <div className="flex items-end">
        {/* Tab Buttons */}
        <div className="flex flex-1 gap-0">
          <button
            onClick={() => onTabChange("bots")}
            className={cn("collection-tab flex-1 text-center", activeTab === "bots" && "active")}
          >
            <div>BOTS</div>
            <div className="collection-tab-count">
              {botsStats.unlocked}/{botsStats.total}
            </div>
          </button>
          <button
            onClick={() => onTabChange("zones")}
            className={cn("collection-tab flex-1 text-center", activeTab === "zones" && "active")}
          >
            <div>ZONES</div>
            <div className="collection-tab-count">
              {zonesStats.unlocked}/{zonesStats.total}
            </div>
          </button>
        </div>

        {/* Action buttons - always rendered to prevent layout shift, hidden on worlds tab */}
        <div className={cn(
          "flex items-center gap-2 pb-2.5 pl-3 transition-opacity duration-150",
          activeTab !== "bots" && "opacity-0 pointer-events-none"
        )}>
          {/* Search toggle */}
          <button
            onClick={() => showSearch ? handleCloseSearch() : setShowSearch(true)}
            className={cn("collection-search-toggle", showSearch && "active")}
            aria-label={showSearch ? "Close search" : "Search bots"}
            tabIndex={activeTab !== "bots" ? -1 : undefined}
          >
            {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Sort dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="collection-sort-btn"
              aria-label="Sort bots"
              tabIndex={activeTab !== "bots" ? -1 : undefined}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{activeSortLabel}</span>
            </button>

            {showSortDropdown && activeTab === "bots" && (
              <div className="collection-sort-dropdown">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onSortChange(opt.value);
                      setShowSortDropdown(false);
                    }}
                    className={cn(
                      "collection-sort-option w-full",
                      sortOption === opt.value && "active"
                    )}
                  >
                    <span>{opt.label}</span>
                    {sortOption === opt.value && (
                      <Check className="sort-check w-3.5 h-3.5" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable search bar */}
      {activeTab === "bots" && showSearch && (
        <div className="pt-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(260,15%,40%)]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search bots..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="collection-search-input"
            />
          </div>
        </div>
      )}

      {/* Divider line */}
      {!showSearch && activeTab === "bots" && <div className="h-3" />}
      {activeTab === "zones" && <div className="h-3" />}
    </div>
  );
};

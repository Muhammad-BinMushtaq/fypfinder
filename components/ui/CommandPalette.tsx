"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Users, Lightbulb, MessageSquare, Layout, ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [activeTab, setActiveTab] = useState<"ALL" | "STUDENTS" | "IDEAS" | "PAGES">("ALL");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  
  const [students, setStudents] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setStudents([]);
      setIdeas([]);
      setSelectedIndex(0);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!debouncedQuery) {
      setStudents([]);
      setIdeas([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [studentRes, ideaRes] = await Promise.all([
          fetch(`/api/discovery?search=${encodeURIComponent(debouncedQuery)}`),
          fetch(`/api/fyp-ideas/past?search=${encodeURIComponent(debouncedQuery)}`).catch(() => null)
        ]);

        if (studentRes.ok) {
          const sData = await studentRes.json();
          setStudents(sData.data?.slice(0, 5) || []);
        }
        
        if (ideaRes?.ok) {
          const iData = await ideaRes.json();
          setIdeas(iData.data?.slice(0, 5) || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [debouncedQuery]);

  const STATIC_PAGES = [
    { title: "Dashboard", url: "/dashboard", icon: Layout },
    { title: "Profile", url: "/dashboard/profile", icon: Users },
    { title: "Discovery", url: "/dashboard/discovery", icon: Search },
    { title: "FYP Ideas", url: "/dashboard/ideas", icon: Lightbulb },
    { title: "Requests", url: "/dashboard/requests", icon: MessageSquare },
  ];

  const filteredPages = STATIC_PAGES.filter(p => p.title.toLowerCase().includes(debouncedQuery.toLowerCase())).slice(0, 5);

  const getVisibleItems = () => {
    const items = [];
    if (activeTab === "ALL" || activeTab === "STUDENTS") items.push(...students.map(s => ({ type: "student", ...s })));
    if (activeTab === "ALL" || activeTab === "IDEAS") items.push(...ideas.map(i => ({ type: "idea", ...i })));
    if (activeTab === "ALL" || activeTab === "PAGES") items.push(...filteredPages.map(p => ({ type: "page", ...p })));
    return items;
  };

  const visibleItems = getVisibleItems();

  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery, activeTab]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (visibleItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + visibleItems.length) % (visibleItems.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = visibleItems[selectedIndex];
      if (selected) {
        if (selected.type === "page") router.push(selected.url);
        // Add other navigations if needed
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}>
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-gray-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search students, ideas, or pages..."
            className="flex-1 px-4 py-4 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500"
          />
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-2 py-2 border-b border-gray-200 dark:border-slate-800 gap-2">
          {["ALL", "STUDENTS", "IDEAS", "PAGES"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === tab ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800/50"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading && <div className="p-4 text-center text-sm text-gray-500">Searching...</div>}
          {!isLoading && visibleItems.length === 0 && debouncedQuery && (
            <div className="p-4 text-center text-sm text-gray-500">No results found for "{debouncedQuery}"</div>
          )}
          
          {!isLoading && visibleItems.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={index}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => {
                  if (item.type === "page") router.push(item.url);
                  setIsOpen(false);
                }}
                className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${
                  isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                {item.type === "page" && (
                  <>
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-blue-100 dark:bg-blue-900/40" : "bg-gray-100 dark:bg-slate-800"}`}>
                      <item.icon className={`w-4 h-4 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-500"}`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={`text-sm font-medium ${isSelected ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-white"}`}>{item.title}</p>
                    </div>
                    <span className="text-xs text-gray-400">Page</span>
                  </>
                )}
                {item.type === "student" && (
                  <>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? "bg-blue-100 dark:bg-blue-900/40" : "bg-gray-100 dark:bg-slate-800"}`}>
                      <Users className={`w-4 h-4 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-500"}`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={`text-sm font-medium ${isSelected ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-white"}`}>{item.name}</p>
                      <p className="text-xs text-gray-500">{item.department} • Semester {item.semester}</p>
                    </div>
                    <span className="text-xs text-gray-400">Student</span>
                  </>
                )}
                {item.type === "idea" && (
                  <>
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-blue-100 dark:bg-blue-900/40" : "bg-gray-100 dark:bg-slate-800"}`}>
                      <Lightbulb className={`w-4 h-4 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-500"}`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={`text-sm font-medium ${isSelected ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-white"}`}>{item.title}</p>
                    </div>
                    <span className="text-xs text-gray-400">FYP Idea</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

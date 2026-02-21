// app/dashboard/discovery/page.tsx
"use client";

/**
 * Discovery Page
 * --------------
 * Main page for discovering other students.
 * 
 * Responsibilities:
 * - Layout composition
 * - No direct data fetching
 * 
 * Note: Auth is enforced by DashboardLayout (parent)
 * 
 * Data Flow:
 * Page → useDiscovery() → discovery.service.ts → Backend
 */

import { useDiscovery } from "@/hooks/discovery/useDiscovery";
import { StudentCard } from "@/components/discovery/StudentCard";
import { DiscoveryFilters } from "@/components/discovery/DiscoveryFilters";

export default function DiscoveryPage() {
  // � Discovery data (auth is handled by dashboard layout)
  const {
    students,
    pagination,
    isLoading,
    isFetching,
    isError,
    error,
    pendingFilters,
    appliedFilters,
    hasUnappliedChanges,
    setDepartment,
    setSemester,
    setSkills,
    setAvailability,
    applyFilters,
    clearFilters,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage,
    prefetchNextPage,
  } = useDiscovery({ initialLimit: 12 });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                Discover Students
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                Find potential FYP partners based on skills and interests
              </p>
            </div>
            
            {/* Results count */}
            {pagination && !isLoading && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-gray-200/50 dark:border-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Showing{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {students.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {pagination.total}
                  </span>{" "}
                  students
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filters */}
        <div className="mb-6 sm:mb-8 relative z-20">
          <DiscoveryFilters
            pendingFilters={pendingFilters}
            appliedFilters={appliedFilters}
            hasUnappliedChanges={hasUnappliedChanges}
            onDepartmentChange={setDepartment}
            onSemesterChange={setSemester}
            onSkillsChange={setSkills}
            onAvailabilityChange={setAvailability}
            onApply={applyFilters}
            onClear={clearFilters}
            isLoading={isLoading}
            isFetching={isFetching}
          />
        </div>

        {/* Error State */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-400">Failed to load students</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State (only on first load) */}
        {isLoading && (
          <div className="py-16 text-center">
            <div className="relative inline-block">
              <div className="w-16 h-16 border-4 border-gray-200 dark:border-slate-700 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-gray-600 dark:border-slate-400 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-6 font-medium">Loading students...</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Finding potential FYP partners for you</p>
          </div>
        )}

        {/* Students Grid */}
        {!isLoading && students.length > 0 && (
          <>
            {/* Fetching overlay */}
            <div className={`relative z-10 ${isFetching ? "opacity-60" : ""} transition-opacity`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {students.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                {/* Previous Button */}
                <button
                  onClick={previousPage}
                  disabled={!hasPreviousPage || isFetching}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        disabled={isFetching}
                        className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                          currentPage === pageNum
                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                            : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                        } disabled:opacity-50`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => {
                    nextPage();
                    prefetchNextPage(); // Prefetch the page after next
                  }}
                  disabled={!hasNextPage || isFetching}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Floating loader for background fetching */}
            {isFetching && !isLoading && (
              <div className="fixed bottom-8 right-8 z-50">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 flex items-center gap-3 border border-gray-200/50 dark:border-slate-700">
                  <div className="relative">
                    <div className="w-8 h-8 border-3 border-gray-200 dark:border-slate-700 rounded-full"></div>
                    <div className="w-8 h-8 border-3 border-gray-600 dark:border-slate-400 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Updating results...</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && students.length === 0 && !isError && (
          <div className="py-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <span className="text-5xl">🔍</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No students found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {appliedFilters.department || appliedFilters.semester || appliedFilters.skills?.length
                ? "Try adjusting your filters to see more results"
                : "There are no available students matching your criteria at the moment"}
            </p>
            {(appliedFilters.department || appliedFilters.semester || appliedFilters.skills?.length) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

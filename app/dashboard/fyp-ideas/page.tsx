// app/dashboard/fyp-ideas/page.tsx
"use client";

import { useState } from "react";
import { Search, Filter, Calendar, User, Users, BookOpen, ChevronDown, AlertTriangle } from "lucide-react";

/**
 * Dummy FYP Ideas Data
 * ====================
 * This is sample data for demonstration purposes only.
 * In a future version, this will be fetched from the database.
 */
const DUMMY_FYP_IDEAS = [
  {
    id: "1",
    projectName: "AI-Powered Student Attendance System",
    description: "A comprehensive attendance management system using facial recognition technology. The system automatically marks attendance when students enter the classroom, reducing manual effort and preventing proxy attendance. Integrated with the university LMS for real-time reporting.",
    year: "2025",
    batch: "Fall 2025",
    department: "Software Engineering",
    supervisor: "Dr. Ahmed Khan",
    students: ["Ali Hassan", "Sara Ahmed", "Usman Malik"],
    tags: ["AI", "Machine Learning", "Computer Vision", "Python"],
  },
  {
    id: "2",
    projectName: "Smart Campus Navigation App",
    description: "A mobile application that helps students and visitors navigate the university campus efficiently. Features include indoor mapping, real-time location tracking, event notifications, and accessibility routes for differently-abled individuals.",
    year: "2025",
    batch: "Spring 2025",
    department: "Computer Science",
    supervisor: "Dr. Fatima Zahra",
    students: ["Hamza Iqbal", "Ayesha Siddiqi"],
    tags: ["Mobile App", "Flutter", "GPS", "Maps API"],
  },
  {
    id: "3",
    projectName: "Blockchain-Based Academic Credential Verification",
    description: "A decentralized system for issuing and verifying academic credentials. Universities can issue tamper-proof digital certificates that employers can instantly verify without contacting the institution. Built on Ethereum with smart contracts.",
    year: "2024",
    batch: "Fall 2024",
    department: "Computer Science",
    supervisor: "Dr. Imran Naseer",
    students: ["Zainab Fatima", "Bilal Ahmed", "Nadia Hussain"],
    tags: ["Blockchain", "Ethereum", "Smart Contracts", "Web3"],
  },
  {
    id: "4",
    projectName: "Mental Health Support Chatbot for Students",
    description: "An AI-powered chatbot that provides 24/7 mental health support to students. The bot can detect emotional distress, provide coping strategies, and escalate to human counselors when needed. Maintains user privacy while keeping anonymized analytics.",
    year: "2024",
    batch: "Spring 2024",
    department: "Artificial Intelligence",
    supervisor: "Dr. Sana Riaz",
    students: ["Tariq Mahmood", "Hira Khan"],
    tags: ["NLP", "Chatbot", "Mental Health", "Python", "TensorFlow"],
  },
  {
    id: "5",
    projectName: "IoT-Based Smart Parking System",
    description: "An intelligent parking management system using IoT sensors to detect available parking spots in real-time. Students can view available slots via mobile app, reserve spots, and get navigation to the nearest available parking. Includes analytics dashboard for administration.",
    year: "2024",
    batch: "Fall 2024",
    department: "Computer Engineering",
    supervisor: "Dr. Khalid Mehmood",
    students: ["Arslan Ali", "Maria Qureshi", "Fahad Raza", "Sobia Akram"],
    tags: ["IoT", "Arduino", "Mobile App", "Real-time"],
  },
  {
    id: "6",
    projectName: "E-Learning Platform with Adaptive Learning",
    description: "A personalized e-learning platform that adapts content difficulty based on student performance. Uses machine learning to identify knowledge gaps and recommends targeted content. Includes gamification elements to boost engagement.",
    year: "2023",
    batch: "Spring 2023",
    department: "Software Engineering",
    supervisor: "Dr. Asim Shahzad",
    students: ["Saad Haider", "Amna Tariq"],
    tags: ["E-Learning", "ML", "React", "Node.js", "Gamification"],
  },
  {
    id: "7",
    projectName: "Automated Timetable Scheduling System",
    description: "An intelligent system that automatically generates conflict-free timetables for university courses. Considers room availability, faculty preferences, student course loads, and constraint optimization. Reduces manual scheduling effort by 90%.",
    year: "2023",
    batch: "Fall 2023",
    department: "Data Science",
    supervisor: "Dr. Naveed Ahmad",
    students: ["Waqas Ahmed", "Mehreen Saleem", "Adil Khan"],
    tags: ["Optimization", "Algorithm", "Python", "Scheduling"],
  },
  {
    id: "8",
    projectName: "AR-Based Campus Virtual Tour",
    description: "An augmented reality application that provides interactive virtual tours of the campus. Prospective students can explore facilities remotely. Includes historical information about buildings, faculty introductions, and 360-degree views of classrooms and labs.",
    year: "2023",
    batch: "Spring 2023",
    department: "Interactive Media",
    supervisor: "Dr. Rabia Naseem",
    students: ["Owais Raza", "Sana Javed"],
    tags: ["AR", "Unity", "3D Modeling", "Mobile"],
  },
];

// Available years for filtering
const YEARS = ["All Years", "2025", "2024", "2023"];

// Available departments for filtering
const DEPARTMENTS = [
  "All Departments",
  "Software Engineering",
  "Computer Science",
  "Artificial Intelligence",
  "Computer Engineering",
  "Data Science",
  "Interactive Media",
];

export default function FYPIdeasPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter the dummy data
  const filteredIdeas = DUMMY_FYP_IDEAS.filter((idea) => {
    const matchesSearch =
      searchQuery === "" ||
      idea.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.supervisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.students.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      idea.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesYear = selectedYear === "All Years" || idea.year === selectedYear;
    const matchesDepartment = selectedDepartment === "All Departments" || idea.department === selectedDepartment;

    return matchesSearch && matchesYear && matchesDepartment;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%)] bg-[length:60px_60px]"></div>
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Previous FYP Ideas</h1>
              <p className="text-gray-300 mt-1">Browse past final year projects for inspiration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-20">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Coming Soon - Demo Preview</h3>
              <p className="text-white/90 text-sm sm:text-base">
                This feature is under development. The data shown below is <strong>dummy/sample data</strong> for 
                demonstration purposes only. In the future, this page will display actual FYP projects from our 
                university database to help you avoid duplicate ideas and get inspiration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by project name, supervisor, students, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Year Filter */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none w-full lg:w-40 pl-4 pr-10 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all cursor-pointer"
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="appearance-none w-full lg:w-56 pl-4 pr-10 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredIdeas.length}</span> of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{DUMMY_FYP_IDEAS.length}</span> projects
              <span className="ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                Demo Data
              </span>
            </p>
          </div>
        </div>

        {/* FYP Ideas List */}
        <div className="space-y-4">
          {filteredIdeas.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Projects Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
            </div>
          ) : (
            filteredIdeas.map((idea) => (
              <div
                key={idea.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-shadow hover:shadow-lg"
              >
                {/* Project Header */}
                <div
                  className="p-4 sm:p-6 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg">
                          {idea.batch}
                        </span>
                        <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-lg">
                          {idea.department}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {idea.projectName}
                      </h3>
                      <p className={`text-gray-600 dark:text-gray-400 text-sm ${expandedId === idea.id ? "" : "line-clamp-2"}`}>
                        {idea.description}
                      </p>
                    </div>
                    <button className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === idea.id ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {idea.tags.slice(0, expandedId === idea.id ? undefined : 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                    {!expandedId && idea.tags.length > 4 && (
                      <span className="px-2.5 py-1 text-gray-500 dark:text-gray-400 text-xs">
                        +{idea.tags.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === idea.id && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 border-t border-gray-100 dark:border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {/* Supervisor */}
                      <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                          <User className="w-4 h-4" />
                          Supervisor
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium">{idea.supervisor}</p>
                      </div>

                      {/* Students */}
                      <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                          <Users className="w-4 h-4" />
                          Team Members ({idea.students.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {idea.students.map((student) => (
                            <span
                              key={student}
                              className="px-2.5 py-1 bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg border border-gray-200 dark:border-slate-500"
                            >
                              {student}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Demo Data Notice */}
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl">
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        <strong>Note:</strong> This is sample data for demonstration. Real project data will be available once the feature is fully implemented.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-gray-100 dark:bg-slate-800 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Have a Completed FYP to Share?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto mb-4">
            In the future, you'll be able to submit your completed FYP project to help future students 
            avoid duplication and get inspired by your work.
          </p>
          <button
            disabled
            className="px-6 py-3 bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-gray-400 font-semibold rounded-xl cursor-not-allowed"
          >
            Submit Your FYP (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}

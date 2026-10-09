// components/admin/StudentProfileModal.tsx
"use client"

import { useState } from "react"
import {
  X,
  User,
  Mail,
  GraduationCap,
  Calendar,
  Phone,
  Linkedin,
  Github,
  Briefcase,
  Code,
  Target,
  Heart,
  Globe,
  Users,
  Loader2,
  Edit3,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useStudentDetails, useUpdateStudent, type StudentListItem } from "@/hooks/admin"

interface StudentProfileModalProps {
  student: StudentListItem
  onClose: () => void
}

export function StudentProfileModal({ student, onClose }: StudentProfileModalProps) {
  const { data: profile, isLoading, isError } = useStudentDetails(student.id)
  const updateMutation = useUpdateStudent()

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editSemester, setEditSemester] = useState<number>(1)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    skills: true,
    projects: true,
    internships: false,
    group: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const startEditing = () => {
    if (profile) {
      setEditName(profile.name)
      setEditSemester(profile.currentSemester)
    }
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!profile) return

    const updates: { name?: string; currentSemester?: number } = {}

    if (editName.trim() !== profile.name) {
      updates.name = editName.trim()
    }
    if (editSemester !== profile.currentSemester) {
      updates.currentSemester = editSemester
    }

    if (Object.keys(updates).length === 0) {
      setIsEditing(false)
      return
    }

    await updateMutation.mutateAsync({ studentId: student.id, updates })
    setIsEditing(false)
  }

  const statusConfig = {
    ACTIVE: { color: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300", dot: "bg-emerald-500" },
    SUSPENDED: { color: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300", dot: "bg-red-500" },
    DELETION_REQUESTED: { color: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300", dot: "bg-amber-500" },
  }

  const status = statusConfig[student.status] || statusConfig.ACTIVE

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 p-5">
          <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Student Details</h3>
          <div className="flex items-center gap-2">
            {profile && !isEditing && (
              <button
                onClick={startEditing}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Record
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-500" />
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Loading student details...</p>
              </div>
            </div>
          ) : isError || !profile ? (
            <div className="py-16 text-center">
              <User className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Failed to load profile</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="flex items-start gap-4">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xl font-bold ring-2 ring-slate-100 dark:ring-slate-800">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Current Semester</label>
                        <select
                          value={editSemester}
                          onChange={(e) => setEditSemester(Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                            <option key={s} value={s}>
                              Semester {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={updateMutation.isPending}
                          className="flex items-center gap-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          Save Updates
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={updateMutation.isPending}
                          className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{profile.name}</h4>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {profile.user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {profile.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Semester {profile.currentSemester}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${status.color}`}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {student.status === "DELETION_REQUESTED" ? "Pending Deletion" : student.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Joined {new Date(profile.user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Contact & Social Links */}
              {(profile.phone || profile.linkedinUrl || profile.githubUrl) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {profile.phone && (
                    <span className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 text-xs text-slate-700 dark:text-slate-300">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> {profile.phone}
                    </span>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Linkedin className="h-3.5 w-3.5 text-blue-500" /> LinkedIn
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Github className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" /> GitHub
                    </a>
                  )}
                </div>
              )}

              {/* Career & Objectives */}
              {(profile.interests || profile.careerGoal || profile.preferredTechStack || profile.industryPreference) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {profile.careerGoal && (
                    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 bg-slate-50/40 dark:bg-slate-850/40">
                      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <Target className="h-3.5 w-3.5" /> Career Goal
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-800 dark:text-slate-200">{profile.careerGoal}</p>
                    </div>
                  )}
                  {profile.preferredTechStack && (
                    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 bg-slate-50/40 dark:bg-slate-850/40">
                      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <Code className="h-3.5 w-3.5" /> Tech Stack
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-800 dark:text-slate-200">{profile.preferredTechStack}</p>
                    </div>
                  )}
                  {profile.industryPreference && (
                    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 bg-slate-50/40 dark:bg-slate-850/40">
                      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <Globe className="h-3.5 w-3.5" /> Industry
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-800 dark:text-slate-200">{profile.industryPreference}</p>
                    </div>
                  )}
                  {profile.interests && (
                    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 bg-slate-50/40 dark:bg-slate-850/40">
                      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <Heart className="h-3.5 w-3.5" /> Interests
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-800 dark:text-slate-200">{profile.interests}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Skills Section */}
              {profile.skills.length > 0 && (
                <CollapsibleSection
                  title="Skills"
                  icon={<Code className="h-4 w-4" />}
                  count={profile.skills.length}
                  isExpanded={expandedSections.skills}
                  onToggle={() => toggleSection("skills")}
                >
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">{skill.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {skill.level}
                        </span>
                      </span>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Projects Section */}
              {profile.projects.length > 0 && (
                <CollapsibleSection
                  title="Projects"
                  icon={<Briefcase className="h-4 w-4" />}
                  count={profile.projects.length}
                  isExpanded={expandedSections.projects}
                  onToggle={() => toggleSection("projects")}
                >
                  <div className="space-y-2.5">
                    {profile.projects.map((project) => (
                      <div
                        key={project.id}
                        className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 p-3"
                      >
                        <p className="font-semibold text-xs text-slate-900 dark:text-white">{project.name}</p>
                        {project.description && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{project.description}</p>
                        )}
                        <div className="mt-2 flex gap-3 text-xs">
                          {project.liveLink && (
                            <a
                              href={project.liveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-slate-700 dark:text-slate-300 hover:underline"
                            >
                              Live Demo →
                            </a>
                          )}
                          {project.githubLink && (
                            <a
                              href={project.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-slate-500 dark:text-slate-400 hover:underline"
                            >
                              Source Code →
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Internships Section */}
              {profile.internships.length > 0 && (
                <CollapsibleSection
                  title="Internships"
                  icon={<Briefcase className="h-4 w-4" />}
                  count={profile.internships.length}
                  isExpanded={expandedSections.internships}
                  onToggle={() => toggleSection("internships")}
                >
                  <div className="space-y-2.5">
                    {profile.internships.map((internship) => (
                      <div
                        key={internship.id}
                        className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 p-3"
                      >
                        <p className="font-semibold text-xs text-slate-900 dark:text-white">{internship.position}</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{internship.companyName} • <span className="text-slate-400">{internship.duration}</span></p>
                        {internship.description && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{internship.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Group Section */}
              {profile.groupMember && (
                <CollapsibleSection
                  title="FYP Team"
                  icon={<Users className="h-4 w-4" />}
                  count={profile.groupMember.group.members.length}
                  isExpanded={expandedSections.group}
                  onToggle={() => toggleSection("group")}
                >
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{profile.groupMember.group.projectName}</p>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        profile.groupMember.group.isLocked
                          ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      }`}>
                        {profile.groupMember.group.isLocked ? "Locked" : "Open"}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {profile.groupMember.group.members.map((member) => (
                        <div
                          key={member.student.id}
                          className="flex items-center justify-between text-xs py-0.5"
                        >
                          <span className={`${member.student.id === student.id ? "font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                            {member.student.name} {member.student.id === student.id ? "(Current)" : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleSection>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CollapsibleSection({
  title,
  icon,
  count,
  isExpanded,
  onToggle,
  children,
}: {
  title: string
  icon: React.ReactNode
  count: number
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-400 dark:text-slate-500">{icon}</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">{title}</span>
          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
            {count}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {isExpanded && <div className="border-t border-slate-200/80 dark:border-slate-800 p-3.5 bg-white dark:bg-slate-900">{children}</div>}
    </div>
  )
}

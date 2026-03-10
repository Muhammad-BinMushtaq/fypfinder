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
    ACTIVE: { color: "border-emerald-200 bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
    SUSPENDED: { color: "border-red-200 bg-red-100 text-red-700", dot: "bg-red-500" },
    DELETION_REQUESTED: { color: "border-amber-200 bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  }

  const status = statusConfig[student.status] || statusConfig.ACTIVE

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Student Profile</h3>
          <div className="flex items-center gap-2">
            {profile && !isEditing && (
              <button
                onClick={startEditing}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                <p className="mt-3 text-sm text-slate-500">Loading profile...</p>
              </div>
            </div>
          ) : isError || !profile ? (
            <div className="py-16 text-center">
              <User className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">Failed to load profile</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top: Avatar + Basic Info */}
              <div className="flex items-start gap-4">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="h-20 w-20 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-700"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 ring-4 ring-slate-100 dark:ring-slate-700">
                    <span className="text-2xl font-bold text-white">{profile.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Semester</label>
                        <select
                          value={editSemester}
                          onChange={(e) => setEditSemester(Number(e.target.value))}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
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
                          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={updateMutation.isPending}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white">{profile.name}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
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
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.color}`}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {student.status === "DELETION_REQUESTED" ? "Deletion Requested" : student.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          Joined {new Date(profile.user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Contact & Links */}
              {(profile.phone || profile.linkedinUrl || profile.githubUrl) && (
                <div className="flex flex-wrap gap-3">
                  {profile.phone && (
                    <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      <Phone className="h-3.5 w-3.5" /> {profile.phone}
                    </span>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
                    >
                      <Github className="h-3.5 w-3.5" /> GitHub
                    </a>
                  )}
                </div>
              )}

              {/* Career & Interests */}
              {(profile.interests || profile.careerGoal || profile.hobbies || profile.preferredTechStack || profile.industryPreference) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {profile.careerGoal && (
                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400">
                        <Target className="h-3.5 w-3.5" /> Career Goal
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{profile.careerGoal}</p>
                    </div>
                  )}
                  {profile.preferredTechStack && (
                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400">
                        <Code className="h-3.5 w-3.5" /> Tech Stack
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{profile.preferredTechStack}</p>
                    </div>
                  )}
                  {profile.industryPreference && (
                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400">
                        <Globe className="h-3.5 w-3.5" /> Industry Preference
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{profile.industryPreference}</p>
                    </div>
                  )}
                  {profile.interests && (
                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400">
                        <Heart className="h-3.5 w-3.5" /> Interests
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{profile.interests}</p>
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
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-sm dark:border-slate-700"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300">{skill.name}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                          skill.level === "ADVANCED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : skill.level === "INTERMEDIATE"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                        }`}>
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
                  <div className="space-y-3">
                    {profile.projects.map((project) => (
                      <div
                        key={project.id}
                        className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                      >
                        <p className="font-medium text-slate-900 dark:text-white">{project.name}</p>
                        {project.description && (
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
                        )}
                        <div className="mt-2 flex gap-2">
                          {project.liveLink && (
                            <a
                              href={project.liveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                              Live Demo
                            </a>
                          )}
                          {project.githubLink && (
                            <a
                              href={project.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-600 hover:underline dark:text-slate-400"
                            >
                              GitHub
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
                  <div className="space-y-3">
                    {profile.internships.map((internship) => (
                      <div
                        key={internship.id}
                        className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                      >
                        <p className="font-medium text-slate-900 dark:text-white">{internship.position}</p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">{internship.companyName}</p>
                        <p className="text-xs text-slate-400">{internship.duration}</p>
                        {internship.description && (
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{internship.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Group Section */}
              {profile.groupMember && (
                <CollapsibleSection
                  title="FYP Group"
                  icon={<Users className="h-4 w-4" />}
                  count={profile.groupMember.group.members.length}
                  isExpanded={expandedSections.group}
                  onToggle={() => toggleSection("group")}
                >
                  <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900 dark:text-white">{profile.groupMember.group.projectName}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        profile.groupMember.group.isLocked
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {profile.groupMember.group.isLocked ? "Locked" : "Open"}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {profile.groupMember.group.members.map((member) => (
                        <div
                          key={member.student.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className={`${member.student.id === student.id ? "font-semibold text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300"}`}>
                            {member.student.name}
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

// Reusable collapsible section
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
    <div className="rounded-xl border border-slate-200 dark:border-slate-700">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">{icon}</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
            {count}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {isExpanded && <div className="border-t border-slate-200 p-3 dark:border-slate-700">{children}</div>}
    </div>
  )
}

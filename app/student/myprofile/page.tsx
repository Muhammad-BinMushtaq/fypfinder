'use client';
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { IStudent } from "@/types/student";

// ✅ Define Zod Schema
const studentSchema = z.object({
  regNo: z.string(),
  institutionalEmail: z.string().email(),
  name: z.string().min(1, "Name is required"),
  dob: z.string().min(1, "Date of Birth is required"),
  gender: z.string().min(1, "Gender is required"),
  nationality: z.string().min(1, "Nationality is required"),
  cnic: z.string().min(13, "CNIC must be 13 digits"),
  personalEmail: z.string().email("Enter a valid email"),
  personalPhone: z.string().min(11, "Enter valid phone number"),
  fatherName: z.string().min(1, "Father name required"),
  motherName: z.string().min(1, "Mother name required"),
  presentAddress: z.string().min(1, "Address required"),
  religion: z.string().optional(),
  guardianMobile: z.string().optional(),
  bloodGroup: z.string().optional(),
});

type StudentForm = z.infer<typeof studentSchema>;

export default function StudentProfilePage() {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<IStudent>();

  const form = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: {},
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = form;

  // Redirect if not a student
  useEffect(() => {
    if (user && user.role !== "Student") {
      router.push("/unauthorized");
    }
  }, [user, router]);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient("/api/student/profile", { method: "GET" }, accessToken || "");
        setStudent(data.student);
        reset(data.student); // prefill form
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) fetchProfile();
  }, [accessToken, reset]);

  const onSubmit = async (values: StudentForm) => {
    try {
      await apiClient("/api/student/update-profile", {
        method: "PUT",
        body: JSON.stringify(values),
      }, accessToken || "");
      alert("Profile updated successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;
  if (!student) return <p className="text-center mt-10">No profile found.</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Student Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6">
        {/* Disabled Fields */}
        <div>
          <label className="font-semibold text-gray-700">Registration No</label>
          <input disabled {...register("regNo")} className="w-full border p-2 rounded bg-gray-100" />
        </div>
        <div>
          <label className="font-semibold text-gray-700">Institutional Email</label>
          <input disabled {...register("institutionalEmail")} className="w-full border p-2 rounded bg-gray-100" />
        </div>

        {/* Editable Fields */}
        {[
          { name: "name", label: "Full Name" },
          { name: "dob", label: "Date of Birth", type: "date" },
          { name: "gender", label: "Gender" },
          { name: "nationality", label: "Nationality" },
          { name: "cnic", label: "CNIC" },
          { name: "personalEmail", label: "Personal Email" },
          { name: "personalPhone", label: "Phone Number" },
          { name: "fatherName", label: "Father Name" },
          { name: "motherName", label: "Mother Name" },
          { name: "presentAddress", label: "Address" },
        ].map(({ name, label, type }) => (
          <div key={name}>
            <label className="font-semibold text-gray-700">{label}</label>
            <input
              type={type || "text"}
              {...register(name as keyof StudentForm)}
              className="w-full border p-2 rounded focus:ring focus:ring-blue-200"
            />
            {errors[name as keyof StudentForm] && (
              <p className="text-red-500 text-sm">
                {errors[name as keyof StudentForm]?.message as string}
              </p>
            )}
          </div>
        ))}

        {/* Optional */}
        <div>
          <label className="font-semibold text-gray-700">Religion</label>
          <input {...register("religion")} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="font-semibold text-gray-700">Guardian Mobile</label>
          <input {...register("guardianMobile")} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="font-semibold text-gray-700">Blood Group</label>
          <input {...register("bloodGroup")} className="w-full border p-2 rounded" />
        </div>

        <div className="col-span-2 text-right mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow transition"
          >
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

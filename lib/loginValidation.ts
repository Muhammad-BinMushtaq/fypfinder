import z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .regex(/^[A-Za-z0-9._%+-]+@edu\.pafiast\.pk$/, "Email must be @edu.pafiast.pk"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(30, "Password must not exceed 30 characters"),
});


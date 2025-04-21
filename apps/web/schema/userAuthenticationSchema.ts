import { z } from "zod";

export const userNameValidation = z
  .string()
  .min(3, "Username must be atleast 3 characters")
  .max(20, "Username cannot be more than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/);

export const signUpSchema = z.object({
  name: userNameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, "Password must be atleast 8 characters"),
});

export const singInSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});

import { z } from "zod";

export const RegisterRequestSchema = z.object({
  username: z.string().min(5).max(50),
  email: z.string().email().min(5).max(50),
  password: z.string().min(5).max(50).refine(
    (password) => /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{5,50}$/.test(password),
    {
      message: "Mật khẩu phải chứa ít nhất 1 chữ số và 1 ký tự đặc biệt",
    }
  ),
});

export const RegisterResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.object({
    email: z.string().email(),
    isPending: z.boolean(),
    key: z.string().optional(),
  }),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterRespone = z.infer<typeof RegisterResponseSchema>;

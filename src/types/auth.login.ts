import { z } from "zod";

// Login Request Schema
export const LoginRequestSchema = z.object({
  username: z.string().min(5).max(50),
  password: z.string().min(5).max(50).refine(
    (password) => /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{5,50}$/.test(password),
    {
      message: "Mật khẩu phải chứa ít nhất 1 chữ số và 1 ký tự đặc biệt",
    }
  ),
});

// Login Response Schema
export const LoginResponseSchema = z.object({
  status: z.enum(["success", "fail"]),
  message: z.string(),
  data: z
    .object({
      access_token: z.string(),
      refresh_token: z.string(),
      account: z.object({
        id: z.string(),
        email: z.string(),
        username: z.string(),
        role: z.string(),
      }),
      profile: z.object({
        id: z.string(),
        name: z.string(),
        avatar: z.string(),
      }),
    })
    .optional(),
});

// Types
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

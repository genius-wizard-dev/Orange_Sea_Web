import { z } from "zod";

// Profile type definition
export const ProfileSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  avatar: z.string().default(""),
  bio: z.string().default(""),
  phone: z.string().default(""),
  birthday: z.string().nullable().default(null),
  isSetup: z.boolean().default(false),
});

// Type derived from the schema
export type Profile = z.infer<typeof ProfileSchema>;

// Update profile schema (all fields optional except id)
export const UpdateProfileSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  birthday: z.string().nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// API Response schema
export const ProfileResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: ProfileSchema,
});

export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

// Helper function to validate profile
export const validateProfile = (profile: unknown): Profile => {
  return ProfileSchema.parse(profile);
};

// Helper function to validate update profile input
export const validateUpdateProfileInput = (
  input: unknown
): UpdateProfileInput => {
  return UpdateProfileSchema.parse(input);
};

// Helper function to validate profile response
export const validateProfileResponse = (response: unknown): ProfileResponse => {
  return ProfileResponseSchema.parse(response);
};

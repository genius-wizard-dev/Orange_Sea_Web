import { z } from "zod";

// Profile type definition
export const ProfileSchema = z.object({
  id: z.string(),
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .refine(
      (name) => /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/.test(name),
      {
        message: "Name should only contain Vietnamese and Latin characters"
      }
    )
    .default(""),
  avatar: z.string().default(""),
  bio: z.string().default(""),
  phone: z.string()
    .refine(
      (phone) => phone === "" || /^(0|\+84)[0-9]{9}$/.test(phone),
      {
        message: "Phone number must be a valid Vietnamese phone number (0xxxxxxxxx or +84xxxxxxxxx)"
      }
    )
    .default(""),
  gender: z.enum(["F", "M"])
    .describe("Gender (F for female, M for male)")
    .default("F"),
  birthday: z.string().nullable().optional()
  .refine(
    (date) => {
      if (!date) return true;
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 12;
      }
      return age >= 12;
    },
    {
      message: "You must be at least 12 years old"
    }
  ),
  email: z.string().default(""),
  username: z.string().default(""),
  isSetup: z.boolean().default(false),
  accountID: z.string().default(""),
});

// Type derived from the schema
export type Profile = z.infer<typeof ProfileSchema>;

// Update profile schema (all fields optional except id)
export const UpdateProfileSchema = z.object({
  id: z.string(),
  name: z.string()
  .min(2, "Name must be at least 2 characters")
  .refine(
    (name) => /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/.test(name),
    {
      message: "Name should only contain Vietnamese and Latin characters"
    }
  )
  .default(""),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string()
  .refine(
    (phone) => phone === "" || /^(0|\+84)[0-9]{9}$/.test(phone),
    {
      message: "Phone number must be a valid Vietnamese phone number (0xxxxxxxxx or +84xxxxxxxxx)"
    }
  )
  .default(""),
  birthday: z.string().nullable().optional()
    .refine(
      (date) => {
        if (!date) return true;
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          return age - 1 >= 12;
        }
        return age >= 12;
      },
      {
        message: "You must be at least 12 years old"
      }
    ),
  email: z.string().optional(),
  username: z.string().optional(),
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

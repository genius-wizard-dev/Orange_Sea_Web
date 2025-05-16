"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AppDispatch, RootState } from "@/redux/store";
import { profile, updateProfile } from "@/redux/thunks/profile";
import { Profile } from "@/types/profile";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Mail,
  Phone,
  Upload,
  User,
  VenusAndMars,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

// Hàm chuyển đổi định dạng ngày tháng
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Chưa cập nhật";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Hàm chuyển đổi ngày tháng sang định dạng YYYY-MM-DD cho input type="date"
const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileDialog = ({ open, onOpenChange }: ProfileDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile: userProfile } = useSelector(
    (state: RootState) => state.profile
  );
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Profile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    birthday?: string;
    gender?: string;
  }>({});

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
    }
  }, [userProfile]);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const validateName = (name: string): string | undefined => {
    if (name.length < 2) {
      return "Tên phải có ít nhất 2 ký tự";
    }
    if (
      !/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/.test(
        name
      )
    ) {
      return "Tên chỉ nên chứa chữ cái tiếng Việt và Latin";
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (phone === "") return undefined;
    if (!/^(0|\+84)[0-9]{9}$/.test(phone)) {
      return "Số điện thoại phải là số điện thoại Việt Nam hợp lệ (0xxxxxxxxx hoặc +84xxxxxxxxx)";
    }
    return undefined;
  };

  const validateBirthday = (
    birthday: string | null | undefined
  ): string | undefined => {
    if (!birthday) return undefined;

    const birthDate = new Date(birthday);
    const today = new Date();

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 12) {
      return "Bạn phải đủ 12 tuổi trở lên";
    }

    return undefined;
  };

  const handleChange = (field: keyof Profile, value: string) => {
    if (formData) {
      setFormData({
        ...formData,
        [field]: value,
      });

      // Clear error when user starts typing
      if (errors[field as keyof typeof errors]) {
        setErrors({
          ...errors,
          [field]: undefined,
        });
      }

      // Validate on change
      if (field === "name") {
        const nameError = validateName(value);
        if (nameError) {
          setErrors({ ...errors, name: nameError });
        }
      } else if (field === "phone") {
        const phoneError = validatePhone(value);
        if (phoneError) {
          setErrors({ ...errors, phone: phoneError });
        }
      } else if (field === "birthday") {
        const birthdayError = validateBirthday(value);
        if (birthdayError) {
          setErrors({ ...errors, birthday: birthdayError });
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    // Validate all fields
    const newErrors = {
      name: validateName(formData.name),
      phone: validatePhone(formData.phone || ""),
      birthday: validateBirthday(formData.birthday),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== undefined)) {
      const firstError = Object.values(newErrors).find(
        (error) => error !== undefined
      );
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    try {
      setIsSaving(true);

      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });

      if (selectedFile) {
        formDataToSend.append("avatar", selectedFile);
      }

      const result = await dispatch(
        updateProfile(formDataToSend as any)
      ).unwrap();
      if (result.statusCode === 200) {
        toast.success("Cập nhật thông tin thành công");
        setIsEditing(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        await dispatch(profile());
      } else {
        toast.error(result.message || "Cập nhật thông tin thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!userProfile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa thông tin cá nhân" : "Thông tin cá nhân"}
          </DialogTitle>
        </DialogHeader>
        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} mode="wait">
            {!isEditing ? (
              <motion.div
                key="view"
                initial={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 py-4"
              >
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={userProfile.avatar}
                      alt={userProfile.name}
                    />
                    <AvatarFallback>
                      {userProfile.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">
                      {userProfile.name}
                    </h3>
                    <p className="text-sm text-gray-500">{userProfile.bio}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{userProfile.username}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{userProfile.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">
                      {userProfile.phone || "Chưa cập nhật"}
                    </span>
                  </div>
                  {/* Gender */}

                  <div className="flex items-center space-x-3">
                    <VenusAndMars className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">
                      {userProfile.gender ? (userProfile.gender === "F" ? "Nữ" : "Nam") : "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">
                      {formatDate(userProfile.birthday)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ x: 300 }}
                animate={{ x: 0 }}
                exit={{ x: 300 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 py-4"
              >
                <div className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar
                        className="h-24 w-24 cursor-pointer"
                        onClick={handleAvatarClick}
                      >
                        <AvatarImage
                          src={previewUrl || userProfile.avatar}
                          alt={userProfile.name}
                        />
                        <AvatarFallback>
                          {userProfile.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={handleAvatarClick}
                        >
                          <Upload className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tên hiển thị</label>
                    <Input
                      value={formData?.name || ""}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Nhập tên hiển thị"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Giới thiệu</label>
                    <Input
                      value={formData?.bio || ""}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      placeholder="Nhập giới thiệu"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <Input
                      value={formData?.phone || ""}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Giới tính</label>
                    
                    <select
                      value={formData?.gender || ""}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className={`w-full rounded-md border ${
                        errors.gender ? "border-red-500" : "border-input"
                      } bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                    >
                      <option value="M">Nam</option>
                      <option value="F">Nữ</option>
                    </select>
                    {errors.gender && (
                      <p className="text-sm text-red-500">{errors.gender}</p>
                    )}

                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ngày sinh</label>
                    <Input
                      type="date"
                      value={formatDateForInput(formData?.birthday || null)}
                      onChange={(e) => handleChange("birthday", e.target.value)}
                      className={errors.birthday ? "border-red-500" : ""}
                    />
                    {errors.birthday && (
                      <p className="text-sm text-red-500">{errors.birthday}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleCancel}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={
                      isSaving ||
                      Object.values(errors).some((error) => error !== undefined)
                    }
                  >
                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;

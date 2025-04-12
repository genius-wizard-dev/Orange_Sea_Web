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
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

// Hàm chuyển đổi định dạng ngày tháng
const formatDate = (dateString: string | null) => {
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

  const handleChange = (field: keyof Profile, value: string) => {
    if (formData) {
      setFormData({
        ...formData,
        [field]: value,
      });
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

    try {
      setIsSaving(true);

      // Tạo FormData để gửi cả file và dữ liệu
      const formDataToSend = new FormData();

      // Thêm các trường dữ liệu
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });

      // Thêm file nếu có
      if (selectedFile) {
        formDataToSend.append("avatar", selectedFile);
      }

      const result = await dispatch(
        updateProfile(formDataToSend as any)
      ).unwrap();
      if (result.status === "success") {
        toast.success("Cập nhật thông tin thành công");
        setIsEditing(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        // Fetch lại thông tin profile sau khi cập nhật thành công
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
                    />
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
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ngày sinh</label>
                    <Input
                      type="date"
                      value={formatDateForInput(formData?.birthday || null)}
                      onChange={(e) => handleChange("birthday", e.target.value)}
                    />
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
                  <Button onClick={handleSave} disabled={isSaving}>
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

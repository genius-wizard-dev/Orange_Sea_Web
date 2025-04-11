"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  IconButton,
  Box,
  Divider,
  TextField,
  MenuItem,
  AppBar,
  Toolbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { AnimatePresence, motion } from "framer-motion";
import { Profile } from "@/types/profile";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const Modals: React.FC<ProfileModalProps> = ({ open = true, onClose }) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [formData, setFormData] = useState<Profile>({
    id: "user_001",
    name: "Phước Hải",
    phone: "+84 933 766 911",
    avatar: "https://i.pravatar.cc/150?img=6",
    bio: "",
    birthday: "2003-11-10",
    isSetup: true,
  });

  const handleNext = () => {
    setDirection(1);
    setStep(1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(0);
  };

  const handleChange = (
    field: keyof Profile | "day" | "month" | "year",
    value: string | number
  ) => {
    setFormData((prev) => {
      const updated: Profile = { ...prev };

      if (["day", "month", "year"].includes(field)) {
        const currentDate = prev.birthday ? new Date(prev.birthday) : new Date();
        const day = field === "day" ? value : currentDate.getDate();
        const month = field === "month" ? value : currentDate.getMonth() + 1;
        const year = field === "year" ? value : currentDate.getFullYear();

        updated.birthday = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      } else {
        updated[field as keyof Profile] = value as never;
      }

      return updated;
    });
  };

  const handleSave = async () => {
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      alert("Lưu thành công\n" + JSON.stringify(formData, null, 2));
      handleBack();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("Lỗi khi lưu thông tin");
    }
  };

  const birthDate = formData.birthday ? new Date(formData.birthday) : new Date();
  const birthDay = birthDate.getDate();
  const birthMonth = birthDate.getMonth() + 1;
  const birthYear = birthDate.getFullYear();

  return (
    <div className="mt-20">
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar
            sx={{
              justifyContent: "space-between",
              borderBottom: "1px solid #ddd",
              px: 2,
              py: 1,
            }}
          >
            <Typography variant="h6">
              {step === 0 ? "Thông tin tài khoản" : "Cập nhật thông tin cá nhân"}
            </Typography>
            <IconButton edge="end" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2, position: "relative" }}>
            <Avatar
              src={formData.avatar}
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.main",
                fontSize: 32,
              }}
            >
              {formData.name[0]}
            </Avatar>
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                right: `calc(50% - 40px - 8px)`,
                bottom: 0,
                bgcolor: "white",
                border: "1px solid #ccc",
                "&:hover": { bgcolor: "#f0f0f0" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ textAlign: "center", mt: 1, mb: 0.25 }}>
            <Typography variant="h6" display="inline">
              {formData.name}
            </Typography>
            <IconButton size="small" sx={{ ml: 1 }} onClick={handleNext}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ position: "relative", height: 260, overflow: "hidden", mt: 2 }}>
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: "absolute", width: "100%" }}
              >
                {step === 0 ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Thông tin cá nhân
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        <strong>Ngày sinh:</strong>{" "}
                        {formData.birthday
                          ? new Date(formData.birthday).toLocaleDateString("vi-VN")
                          : "Chưa cập nhật"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Điện thoại:</strong> {formData.phone}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Giới thiệu:</strong> {formData.bio || "Chưa cập nhật"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Chỉ bạn bè có lưu số của bạn trong danh bạ máy xem được số này
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                    <TextField
                      label="Tên hiển thị"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Giới thiệu"
                      value={formData.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                    />
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <TextField
                        label="Ngày"
                        select
                        value={birthDay}
                        onChange={(e) => handleChange("day", parseInt(e.target.value))}
                        fullWidth
                      >
                        {[...Array(31)].map((_, i) => (
                          <MenuItem key={i} value={i + 1}>
                            {i + 1}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Tháng"
                        select
                        value={birthMonth}
                        onChange={(e) => handleChange("month", parseInt(e.target.value))}
                        fullWidth
                      >
                        {[...Array(12)].map((_, i) => (
                          <MenuItem key={i} value={i + 1}>
                            {i + 1}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Năm"
                        select
                        value={birthYear}
                        onChange={(e) => handleChange("year", parseInt(e.target.value))}
                        fullWidth
                      >
                        {[...Array(50)].map((_, i) => (
                          <MenuItem key={i} value={1980 + i}>
                            {1980 + i}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Box>
                )}
              </motion.div>
            </AnimatePresence>
          </Box>

          <Box textAlign="center" mt={3}>
            {step === 0 ? (
              <Button variant="contained" color="primary" onClick={handleNext}>
                Cập nhật
              </Button>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button onClick={handleBack}>Quay lại</Button>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Lưu
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Modals;

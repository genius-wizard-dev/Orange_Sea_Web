"use client";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import { RegisterRequest, RegisterRespone } from "@/types/auth.register";
import { setEmailInCookies, setRegisterKeyInCookies } from "@/utils/token";
import { Check, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const RegisterPage: React.FC = () => {
  const router = useRouter(); // Changed variable name for clarity
  const [registerData, setRegisterData] = useState<RegisterRequest>({
    email: "",
    username: "",
    password: "",
    role: "USER",
  });
  const [repeatPassword, setRepeatPassword] = useState<string>("");
  const handleSubmit = async () => {
    if (registerData.password !== repeatPassword) {
      toast.error("Password nhập lại không khớp");
      return;
    }

    if (
      !registerData.email.trim() ||
      !registerData.username.trim() ||
      !registerData.password.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    try {
      const res: RegisterRespone = await apiService.post<RegisterRespone>(
        ENDPOINTS.AUTH.REGISTER,
        registerData
      );
      if (res.statusCode === 200 && res.data) {
        if (res.data.key) {
          Promise.all([
            toast.success("Đăng ký thành công!"),
            setRegisterKeyInCookies(res.data.key),
            setEmailInCookies(res.data.email),
            router.push("/otp")
          ]);
        } else {
          toast.error("Không tìm thấy key trong response");
          return;
        }
      }
    } catch (error) {
      console.error("Register Error", error);
      toast.error("Đăng ký thất bại, vui lòng thử lại sau");
    }
  };
  return (
    <div className="flex gap-4 flex-col">
      <h1 className="text-xl font-semibold text-center mb-5 w-full">
        One step away from something great
      </h1>

      <Input
        type="text"
        placeholder="Tên người dùng"
        startIcon={User}
        onChange={(e) =>
          setRegisterData({ ...registerData, username: e.target.value })
        }
        value={registerData.username}
      />
      <Input
        type="text"
        placeholder="Email"
        startIcon={Mail}
        onChange={(e) =>
          setRegisterData({ ...registerData, email: e.target.value })
        }
        value={registerData.email}
      />
      <Input
        type="password"
        placeholder="Mật khẩu"
        onChange={(e) =>
          setRegisterData({ ...registerData, password: e.target.value })
        }
        value={registerData.password}
      />
      <Input
        type="password"
        placeholder="Nhập lại mật khẩu"
        value={repeatPassword}
        onChange={(e) => setRepeatPassword(e.target.value)}
      />
      <div className="flex items-center">
        <Check className="text-primary" />
        <label
          htmlFor="remember"
          className="text-sm text-muted-foreground ml-2"
        >
          Khi ấn đăng nhậpm bạn đã đồng ý với {" "}
          <a href="#" className="text-primary hover:underline">
            Chinh sách sử dụng
          </a>{" "}
          vàvà {" "}
          <a href="#" className="text-primary hover:underline">
            Chính sách bảo mật
          </a>
          .
        </label>
      </div>
      <Button className="w-full" onClick={handleSubmit}>
        Tạo tài khoản
      </Button>
      <span className="block text-center text-gray-500">Đã có tài khoản?</span>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          window.location.href = "/login";
        }}
      >
        Đăng nhập
      </Button>
    </div>
  );
};

export default RegisterPage;

"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/Input";
// import { withGuest } from "@/hoc/withGuest";
import { AppDispatch, RootState } from "@/redux/store";
import { login } from "@/redux/thunks/auth";
import { profile } from "@/redux/thunks/profile";
import { LoginRequest } from "@/types/auth.login";
import { User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { status } = useSelector((state: RootState) => state.auth);

  const [loginData, setLoginData] = useState<LoginRequest>({
    username: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form inputs
    if (!loginData.username.trim()) {
      toast.error("Vui lòng nhập tên đăng nhập!");
      return;
    }

    if (!loginData.password.trim()) {
      toast.error("Vui lòng nhập mật khẩu!");
      return;
    }

    try {
      // showLoading();
      const result = await dispatch(login(loginData)).unwrap();
      if (result.status === "success") {
        const getProfile = await dispatch(profile()).unwrap();
        if (getProfile.status === "success") {
          toast.success("Đăng nhập thành công!");
          router.replace("/");
        } else {
          toast.error(result.message || "Lấy thông tin user thất bại!");
        }
      } else {
        // Hiển thị chính xác message lỗi trả về từ API
        toast.error(result.message || "Đăng nhập thất bại!");
      }
    } catch (error: any) {
      // Xử lý nhiều trường hợp lỗi khác nhau
      if (typeof error === "object" && error !== null) {
        // Nếu error là một đối tượng từ API response
        if (error.status === "fail" && error.message) {
          toast.error(error.message);
        }
        // Nếu là axios error với response data
        else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        }
        // Nếu có thuộc tính message
        else if (error.message) {
          toast.error(error.message);
        }
        // Fallback cho các trường hợp khác
        else {
          toast.error("Đăng nhập thất bại. Vui lòng thử lại sau!");
        }
      }
      // Nếu error là string
      else if (typeof error === "string") {
        toast.error(error);
      }
      // Fallback
      else {
        toast.error("Lỗi kết nối server. Vui lòng thử lại sau!");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 flex-col pb-4">
      <h1 className="text-xl font-semibold text-center mb-5 w-full">
        Sign in and start using awesome stuff
      </h1>

      <Input
        type="text"
        placeholder="Username"
        startIcon={User}
        name="username"
        value={loginData.username}
        onChange={handleInputChange}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        name="password"
        value={loginData.password}
        onChange={handleInputChange}
        required
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Checkbox id="remember" />
          <label
            htmlFor="remember"
            className="text-sm text-muted-foreground ml-2"
          >
            Keep me signed in on this device.
          </label>
        </div>
        <a href="/reset" className="text-sm text-primary hover:underline">
          Forgot password?
        </a>
      </div>
      <Button className="w-full" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
      </Button>
      <span className="block my-1 text-center text-gray-500">or</span>
      <Link href="/register">
        <Button variant="outline" className="w-full">
          CREATE A NEW ACCOUNT
        </Button>
      </Link>
    </form>
  );
};

// export default withGuest(LoginPage);
export default LoginPage;

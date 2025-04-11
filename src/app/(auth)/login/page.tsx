"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { withGuest } from "@/hoc/withGuest";
import { AppDispatch } from "@/redux/store";
import { profile } from "@/redux/thunks/profile";
import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import { LoginRequest, LoginResponse } from "@/types/auth.login";
import { ProfileResponse } from "@/types/profile";
import { setAccessToken, setRefreshToken } from "@/utils/token";
import { User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState<boolean>(false);

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

    try {
      setLoading(true);
      const result: LoginResponse = await apiService.post<LoginResponse>(
        ENDPOINTS.AUTH.LOGIN,
        loginData
      );
      if (result.status === "success" && result.data) {
        setAccessToken(result.data?.access_token);
        setRefreshToken(result.data.refresh_token);
        const profileRes: ProfileResponse = await dispatch(profile()).unwrap();
        if (profileRes.status === "success") {
          toast.success("Đăng nhập thành công!");
          setLoginData({
            username: "",
            password: "",
          });
          router.replace("/");
        } else {
          toast.error(profileRes.message || "Đăng nhập thất bại!");
        }
      } else {
        // Hiển thị chính xác message lỗi trả về từ API
        toast.error(result.message || "Đăng nhập thất bại!");
      }
    } catch (error: any) {
      if (typeof error === "object" && error !== null) {
        if (error.status === "fail" && error.message) {
          toast.error(error.message);
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("Đăng nhập thất bại. Vui lòng thử lại sau!");
        }
      } else if (typeof error === "string") {
        toast.error(error);
      } else {
        toast.error("Lỗi kết nối server. Vui lòng thử lại sau!");
      }
    } finally {
      setLoading(false);
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
        <Link
          href="/reset"
          className="text-sm text-primary hover:underline ml-auto"
        >
          Forgot password?
        </Link>
      </div>
      <Button
        className="w-full"
        type="submit"
        disabled={loading || !loginData.username || !loginData.password}
      >
        {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
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

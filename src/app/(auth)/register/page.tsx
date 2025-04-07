"use client";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/Input";
import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import { RegisterRequest, RegisterRespone } from "@/types/auth.register";
import { setEmailInCookies, setRegisterKeyInCookies } from "@/utils/token";
import { Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const RegisterPage: React.FC = () => {
  const router = useRouter(); // Changed variable name for clarity
  const [registerData, setRegisterData] = useState<RegisterRequest>({
    email: "",
    username: "",
    password: "",
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
      if (res.data) {
        if (res.data.key) {
          setRegisterKeyInCookies(res.data.key);
          setEmailInCookies(res.data.email);
        }

        toast.success(res.message);
        router.push("/otp");
      }
    } catch (error) {
      console.error("Register Error", error);
      toast.error("Registration failed. Please try again.");
    }
  };
  return (
    <div className="flex gap-4 flex-col">
      <h1 className="text-xl font-semibold text-center mb-5 w-full">
        One step away from something great
      </h1>

      <Input
        type="text"
        placeholder="Username"
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
        placeholder="Password"
        onChange={(e) =>
          setRegisterData({ ...registerData, password: e.target.value })
        }
        value={registerData.password}
      />
      <Input
        type="password"
        placeholder="Repeat Password"
        value={repeatPassword}
        onChange={(e) => setRepeatPassword(e.target.value)}
      />
      <div className="flex items-center">
        <Checkbox id="remember" />
        <label
          htmlFor="remember"
          className="text-sm text-muted-foreground ml-2"
        >
          By signing up, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </label>
      </div>
      <Button className="w-full" onClick={handleSubmit}>
        CREATE AN ACCOUNT
      </Button>
      <span className="block text-center text-gray-500">or</span>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          window.location.href = "/login";
        }}
      >
        I ALREADY HAVE AN ACCOUNT
      </Button>
    </div>
  );
};

export default RegisterPage;

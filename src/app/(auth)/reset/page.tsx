"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import { User } from "lucide-react";

const emailSchema = z
  .string()
  .email("Định dạng email không hợp lệ")
  .min(1, "Vui lòng nhập email");

const Reset: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        emailSchema.parse(email);
        setIsValid(true);
      } catch (err) {
        setIsValid(false);
        if (err instanceof z.ZodError) {
          toast.error(err.errors[0].message);
        }
      }
    }, 1000);

    return () => clearTimeout(handler);
  }, [email]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const res = await apiService.post<{ statusCode: number }>(
        ENDPOINTS.AUTH.FORGOT,
        { email }
      );

      if (res.statusCode === 200) {
        setSuccess(true);
        toast.success("Liên kết đặt lại mật khẩu đã được gửi tới email của bạn");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gửi email đặt lại mật khẩu thất bại"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-4 flex-col">
      <h1 className="text-xl font-semibold text-center mb-5 w-full">
        Quên mật khẩu? Đừng lo, chúng tôi sẽ giúp bạn!
      </h1>

      {!success ? (
        <>
          <Input
            type="text"
            placeholder="Nhập email của bạn"
            startIcon={User}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <div className="flex items-center">
            <label
              htmlFor="remember"
              className="text-sm text-muted-foreground ml-2"
            >
              Vui lòng chờ! Nếu tài khoản của bạn tồn tại, liên kết đặt lại mật khẩu sẽ được gửi tới email của bạn trong chốc lát.
            </label>
          </div>
          <Button
            className="w-full"
            disabled={!isValid || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? "ĐANG GỬI..." : "ĐẶT LẠI MẬT KHẨU"}
          </Button>
        </>
      ) : (
        <div className="text-center text-green-600 py-4">
          Liên kết đặt lại mật khẩu đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư đến.
        </div>
      )}

      <span className="block my-1 text-center text-gray-500">hoặc</span>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          window.location.href = "/login";
        }}
      >
        QUAY LẠI TRANG ĐĂNG NHẬP
      </Button>
    </div>
  );
};

export default Reset;

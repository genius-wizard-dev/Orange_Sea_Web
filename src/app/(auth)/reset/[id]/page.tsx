"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

const ConfirmReset = () => {
  const params = useParams();
  const router = useRouter();
  const token = params.id as string;
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setPasswordData((prev) => ({ ...prev, [name]: value }));
      // Clear error when user starts typing again
      if (error) setError("");
    },
    [error]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { password, confirmPassword } = passwordData;

    if (!password || !confirmPassword) {
      return; // Already handled by the disabled button
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      await apiService.post(ENDPOINTS.AUTH.RESET, {
        newPassword: password,
        token,
      });

      router.push("/login");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-center mb-5 w-full">
        Đặt lại mật khẩu
      </h1>
      <form onSubmit={handleSubmit} className="flex gap-4 flex-col">
        {error && <div className="text-red-500">{error}</div>}

        <Input
          type="password"
          name="password"
          placeholder="Mật khẩu mới"
          onChange={handleInputChange}
          value={passwordData.password}
          required
        />

        <Input
          type="password"
          name="confirmPassword"
          placeholder="Xác nhận mật khẩu mới"
          value={passwordData.confirmPassword}
          onChange={handleInputChange}
          required
        />

        <Button
          className="w-full"
          type="submit"
          disabled={
            loading || !passwordData.password || !passwordData.confirmPassword
          }
        >
          {loading ? "ĐANG XỬ LÝ..." : "ĐẶT LẠI MẬT KHẨU"}
        </Button>
      </form>
    </div>
  );
};

export default ConfirmReset;

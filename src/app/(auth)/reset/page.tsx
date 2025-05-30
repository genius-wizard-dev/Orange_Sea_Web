"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner"; // Assuming you use sonner for notifications
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import { User } from "lucide-react";

const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(1, "Email is required");

const Reset: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    try {
      emailSchema.parse(email);
      setIsValid(true);
    } catch (err) {
      setIsValid(false);
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    }
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
        toast.success("Reset password link has been sent to your email");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to send reset email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-4 flex-col">
      <h1 className="text-xl font-semibold text-center mb-5 w-full">
        Lost access? No worries, let is fix it!
      </h1>

      {!success ? (
        <>
          <Input
            type="text"
            placeholder="Enter email"
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
        Hang tight! If your account exists in our system, a reset link will be on its way faster than saying the word password.
            </label>
          </div>
          <Button
            className="w-full"
            disabled={!isValid || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? "SENDING..." : "RESET PASSWORD"}
          </Button>
        </>
      ) : (
        <div className="text-center text-green-600 py-4">
          Reset password link has been sent to your email. Please check your
          inbox.
        </div>
      )}

      <span className="block my-1 text-center text-gray-500">or</span>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          window.location.href = "/login";
        }}
      >
        BACK TO LOGIN PAGE
      </Button>
    </div>
  );
};

export default Reset;

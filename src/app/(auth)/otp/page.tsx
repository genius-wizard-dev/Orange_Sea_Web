"use client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import {
  getEmailFromCookies,
  removeEmailFromCookies,
  removeRegisterKeyFromCookies,
} from "@/utils/token";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const Otp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerifyOtp = async () => {
    try {
      if (!otp) {
        toast.error("Please enter OTP");
        return;
      }

      const email = getEmailFromCookies();
      if (!email) {
        toast.error("Email not found, please try again");
        router.push("/login");
        return;
      }

      setLoading(true);

      await apiService.post(ENDPOINTS.AUTH.VERIFY_OTP, {
        email,
        otp,
      });

      // Remove registration cookies after successful verification
      removeEmailFromCookies();
      removeRegisterKeyFromCookies();

      toast.success("OTP verified successfully");
      router.push("/login");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && 
        error.response !== null && 
        'data' in error.response && 
        typeof error.response.data === 'object' && 
        error.response.data !== null && 
        'message' in error.response.data && 
        typeof error.response.data.message === 'string' 
          ? error.response.data.message 
          : "Failed to verify OTP";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 flex-col">
      <h1 className="text-xl font-semibold text-center mb-5 w-full">
        One step away from something great
      </h1>

      <InputOTP maxLength={6} onChange={setOtp}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      <Button className="w-full" onClick={handleVerifyOtp} disabled={loading}>
        {loading ? "VERIFYING..." : "VERIFY OTP"}
      </Button>
    </div>
  );
};

export default Otp;

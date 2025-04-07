"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import {
  getEmailFromCookies,
  removeEmailFromCookies,
  removeRegisterKeyFromCookies,
} from "@/utils/token";
import { Key } from "lucide-react";
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 flex-col">
      <h1 className="text-xl font-semibold text-center mb-5 w-full">
        One step away from something great
      </h1>

      <Input
        type="number"
        startIcon={Key}
        placeholder="OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <Button className="w-full" onClick={handleVerifyOtp} disabled={loading}>
        {loading ? "VERIFYING..." : "VERIFY OTP"}
      </Button>
    </div>
  );
};

export default Otp;

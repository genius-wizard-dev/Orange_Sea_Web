"use client";
import React from "react";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const RegisterPage: React.FC = () => {
  return (
    <div className="flex gap-4 flex-col">
      <h1 className="text-xl font-semibold text-center mb-5 w-full">
        Lost access? No worries, let's fix it!
      </h1>

      <Input
        type="text"
        placeholder="Enter email, username or phone number"
        startIcon={User}
      />

      <div className="flex items-center">
        <label
          htmlFor="remember"
          className="text-sm text-muted-foreground ml-2"
        >
          Hang tight! If your account is in our system, we’ll send you a reset
          link faster than you can say ‘password’!
        </label>
      </div>
      <Button className="w-full">RESET PASSWORD</Button>
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

export default RegisterPage;

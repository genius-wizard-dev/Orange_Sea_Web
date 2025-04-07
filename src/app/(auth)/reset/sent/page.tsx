"use client";
import React from "react";

import { Button } from "@/components/ui/button";

const RegisterPage: React.FC = () => {
  return (
    <div className="flex gap-4 flex-col">
      <h1 className="text-xl font-semibold text-center mb-5 w-full">
        Boom! Reset link sent! Go check your email or phone and let’s get you
        back in! 😎
      </h1>

      <Button className="w-full">BACK TO LOGIN PAGE</Button>
    </div>
  );
};

export default RegisterPage;

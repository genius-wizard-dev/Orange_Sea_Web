"use client";
import React from "react";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";

const LoginPage: React.FC = () => {
  return (
    <div className="flex gap-4 flex-col pb-4">
      <h1 className="text-xl font-semibold text-center mb-5 w-full">
        Almost there! Just set a new password and you’re back in action! 😎
      </h1>

      <Input type="password" placeholder="New password" />
      <Input type="password" placeholder="Confirm new password" />
      <label htmlFor="remember" className="text-sm text-muted-foreground ml-2">
        Don’t let your new password be a mystery! Save it before you forget! 🔐
      </label>
      <Button className="w-full">RESET PASSWORD</Button>
    </div>
  );
};

export default LoginPage;

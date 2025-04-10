'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const TopNavigation: React.FC = () => {
  return (
    <div className="fixed top-0 w-screen flex items-center justify-between px-2 md:px-10 h-[60px] backdrop-filter backdrop-blur-sm bg-white/30 border-b">
      <div className="flex items-center space-x-4">
        <a href="/" className="text-lg font-semibold text-gray-800">
          <img src="/images/OrangeSEA Horizontal.png" alt="Logo" className="h-6 md:h-10 w-auto" />
        </a>

      </div>
      <div className="flex items-center space-x-4">
        <Button variant="outline" className="text-gray-800 hover:bg-gray-100">NEED HELP</Button>
        <Button variant="ghost" size="icon">
          <Bell className="text-gray-800" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="avatar" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}
export default TopNavigation;
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RootState } from "@/redux/store";
import { ENDPOINTS } from "@/service/api.endpoint";
import apiService from "@/service/api.service";
import {
  getAccessToken,
  removeAccessToken,
  removeRefreshToken,
} from "@/utils/token";
import { Bell, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChangePasswordDialog from "./ChangePasswordDialog";
import LoadingSpinner from "./LoadingSpinner";
import ProfileDialog from "./ProfileDialog";
import FriendDialog from "./user/FriendDialog";
import UserProfileDialog from "./user/UserProfileDialog";
import { closeUserModal, openUserModal } from "@/redux/slices/userModal";
import { fetchUserProfile } from "@/redux/thunks/userModal";

import { AppDispatch } from "@/redux/store";

const TopNavigation: React.FC = () => {
  
  const dispatch: AppDispatch = useDispatch();
  const { isModalOpen, modalProfile, status } = useSelector((state: RootState) => state.userModal);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFriendOpen, setIsFriendOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { profile: userProfile } = useSelector(
    (state: RootState) => state.profile
  );
  const isLoggedIn = !!getAccessToken();
  const router = useRouter();
  const handleProfileClick = () => {
    setIsProfileOpen(true);
    setIsDropdownOpen(false);
  };

  const handleProfileOpenChange = (open: boolean) => {
    setIsProfileOpen(open);
  };

  const handleFriendClick = () => {
    setIsFriendOpen(true);
    setIsDropdownOpen(false);
  }

  const handleProfileOpen = (id: string) => {
    dispatch(openUserModal(id));
    dispatch(fetchUserProfile(id));
  };

  const handleFriendOpenChange = (open: boolean) => {
    setIsFriendOpen(open);
  }

  const handleChangePasswordOpenChange = (open: boolean) => {
    setIsChangePasswordOpen(open);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await apiService.post(ENDPOINTS.AUTH.LOGOUT);
      removeAccessToken();
      removeRefreshToken();
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      // Vẫn xóa token và chuyển hướng ngay cả khi request thất bại
      removeAccessToken();
      removeRefreshToken();
      router.replace("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleChangePassword = () => {
    setIsChangePasswordOpen(true);
    setIsDropdownOpen(false);
  };

  if (isLoggingOut) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="fixed top-0 w-screen flex items-center justify-between px-2 md:px-10 h-[60px] backdrop-filter backdrop-blur-sm bg-white/30 border-b">
        <div className="flex items-center space-x-4">
          <a href="/" className="text-lg font-semibold text-gray-800">
            <img
              src="/images/OrangeSEA Horizontal.png"
              alt="Logo"
              className="h-6 md:h-10 w-auto"
            />
          </a>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="text-gray-800 hover:bg-gray-100">
            NEED HELP
          </Button>
          {isLoggedIn ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFriendClick}
                className="relative"
              >
                <Users className="text-gray-800" />
              </Button>
              {/* <Button variant="ghost" size="icon">
                <Bell className="text-gray-800" />
              </Button> */}
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`${userProfile?.avatar}`}
                        alt="avatar"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleChangePassword}>
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              variant="default"
              className="text-white"
              onClick={() => router.push("/login")}
            >
              LOGIN
            </Button>
          )}
        </div>
      </div>
      <ProfileDialog
        open={isProfileOpen}
        onOpenChange={handleProfileOpenChange}
      />
      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={handleChangePasswordOpenChange}
      />
      <FriendDialog
        isOpen={isFriendOpen}
        onOpenChange={handleFriendOpenChange}
      />

       {modalProfile && (
        <UserProfileDialog
          isOpen={isModalOpen}
          onOpenChange={() => dispatch(closeUserModal())}
          userProfile={modalProfile}
        />
      )}
    </>
  );
};

export default TopNavigation;

"use client";

import { AppDispatch, store } from "@/redux/store";
import { profile } from "@/redux/thunks/profile";
import { getAccessToken } from "@/utils/token";
import { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import LoadingSpinner from "./LoadingSpinner";

function InnerInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const hasToken = getAccessToken();
        if (hasToken) {
          await dispatch(profile());
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
        setInitialized(true);
      }
    };

    fetchProfile();
  }, [dispatch]);

  if (!initialized || isLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <InnerInitializer>{children}</InnerInitializer>
    </Provider>
  );
}

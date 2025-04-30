"use client";

import { AppDispatch, store } from "@/redux/store";
import { profile } from "@/redux/thunks/profile";
import { getAccessToken } from "@/utils/token";
import { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import LoadingSpinner from "./LoadingSpinner";
import OceanBackground from "./background/OceanBackground";
import { cn } from "@/lib/utils";
import { getFriend, getReceived, getRequested } from "@/redux/thunks/friend";

function InnerInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const hasToken = getAccessToken();
        if (hasToken) {
          await dispatch(profile());
          await Promise.all([
            dispatch(getFriend() as any),
            dispatch(getReceived() as any),
            dispatch(getRequested() as any),
          ]);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setInitialized(true);
        }, 1000); // Simulate a delay of 1 second
      }
    };
    fetchInitialData();
  }, [dispatch]);

  if (!initialized) {
    return <>
      <div
        className={cn(
          "fixed inset-0 flex items-center justify-center bg-white z-50 transition-opacity duration-1000",
          { "opacity-0 pointer-events-none": !isLoading, "opacity-100": isLoading }
        )}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="w-52 h-52 animate-[pulse_1.5s_ease-in-out_infinite]">
            <img
              src="/images/OrangeSEA.png"
              alt="Loading"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <OceanBackground speed={0.5} />
      </div>
    </>;
  } else {
    return (
      <>{children}</>
    );
  }
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

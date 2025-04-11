"use client";

import { AppDispatch, store } from "@/redux/store";
import { profile } from "@/redux/thunks/profile";
import { getAccessToken } from "@/utils/token";
import { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";

function InnerInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    const fetchProfile = async () => {
      const hasToken = getAccessToken();
      if (hasToken) {
        await dispatch(profile());
      }
      setInitialized(true);
    };

    fetchProfile();
  }, [dispatch]);

  if (!initialized) {
    return null;
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

"use client";

import { AppDispatch, RootState, store } from "@/redux/store";
import { profile } from "@/redux/thunks/profile";
import { getAccessToken } from "@/utils/token";
import { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";

function InnerInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [initialized, setInitialized] = useState(false);
  const profileStatus = useSelector((state: RootState) => state.profile.status);
  // return <>{children}</>
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

  // Only show children when profile loading was successful
  return profileStatus === "succeeded" ? <>{children}</> : null;
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

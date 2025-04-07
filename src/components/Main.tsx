"use client";

// import { useAuthInit } from "@/hooks/useAuthInit";
import { store } from "@/redux/store";
import { Provider } from "react-redux";

function InnerInitializer({ children }: { children: React.ReactNode }) {
  // useAuthInit();
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

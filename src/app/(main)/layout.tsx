import TopNavigation from "@/components/Header";


export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>
    <TopNavigation />
    {children}
  </div>;
}

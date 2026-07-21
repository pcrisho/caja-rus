export const metadata = {
  title: "Design System | CajaRUS",
};

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-zinc-950">
      {children}
    </div>
  );
}

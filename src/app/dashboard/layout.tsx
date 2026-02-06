// Dashboard Layout con auto-logout per inattività
import IdleTimeoutProvider from '@/components/IdleTimeoutProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IdleTimeoutProvider>
      {children}
    </IdleTimeoutProvider>
  );
}

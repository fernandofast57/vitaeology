import FeedbackButton from '@/components/ui/FeedbackButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <FeedbackButton />
    </>
  );
}

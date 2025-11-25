export const metadata = {
  title: 'Settings · Notifications'
};

export default function NotificationsSettingsPage() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-2xl font-semibold">Notifications</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Configure alert preferences and delivery channels. Add your notification toggles or schedules in this section.
      </p>
    </div>
  );
}


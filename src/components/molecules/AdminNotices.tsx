import { Notice } from './Notice';
export function AdminNotices({
  error,
  success,
  onDismiss,
}: {
  error: string;
  success: string;
  onDismiss: () => void;
}) {
  return (
    <>
      {error && (
        <Notice tone="error" onDismiss={onDismiss}>
          {error}
        </Notice>
      )}
      {success && <Notice tone="success">{success}</Notice>}
    </>
  );
}

import { type AdminModel } from '../../../hooks/useAdmin';
import { Button } from '../../atoms/Button';

type Props = Pick<AdminModel, 'setError' | 'busy' | 'setBusy' | 'confirm' | 'setConfirm' | 'fail'>;
export function ConfirmationDialog(props: Props) {
  const { setError, busy, setBusy, confirm, setConfirm, fail } = props;
  return (
    <>
      {confirm && (
        <div className="admin-overlay confirmation">
          <section
            className="admin-modal confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label={confirm.title}
          >
            <h2>{confirm.title}</h2>
            <p>{confirm.body}</p>
            <div className="admin-modal-footer">
              <Button className="admin-secondary" disabled={busy} onClick={() => setConfirm(null)}>
                Keep as is
              </Button>
              <Button
                variant="primary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError('');
                  try {
                    await confirm.action();
                    setConfirm(null);
                  } catch (e) {
                    fail(e);
                    setConfirm(null);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? 'Working…' : 'Confirm'}
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

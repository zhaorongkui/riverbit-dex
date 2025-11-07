import { Dialog } from "../Dialog";

export default function CreateAgentDialog({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
  return (
    <Dialog open={open} trigger={undefined}>
      <div>Share Dialog Content</div>
      <button onClick={() => handleClose()}>close</button>
    </Dialog>
  );
}

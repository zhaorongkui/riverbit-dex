import PrimaryButton from "./Button/PrimaryButton";
import { SecondaryButton } from "./Button/SecondaryButton";

type ConfirmCancelModalProps = {
  orderName: string; // 要取消的訂單名稱或標識
  onClose: () => void; // 關閉 modal
  onConfirm?: () => void; // 確認取消
};

const ConfirmCancelModal = ({
  orderName,
  onClose,
  onConfirm,
}: ConfirmCancelModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#000000B0]">
      <div className="w-full max-w-md mx-4 flex flex-col bg-[#272B2F] h-[100vh] md:h-auto rounded-lg border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <span className="text-white text-lg font-bold">Confirm Cancel</span>
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/73d3cc65_expires_30_days.png"
            className="w-11 h-11 object-fill cursor-pointer"
            onClick={onClose}
            alt="Close"
          />
        </div>

        {/* Body */}
        <div className="flex flex-col items-center flex-1 p-6">
          <span className="text-white text-base max-md:text-lg text-center">
            Are you sure you want to cancel order <strong>{orderName}</strong>?
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 p-6 border-t border-gray-700">
          <SecondaryButton size="large" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            size="large"
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
          >
            Confirm
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCancelModal;

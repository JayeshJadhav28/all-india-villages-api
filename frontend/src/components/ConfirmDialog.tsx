import React from 'react';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  loading?: boolean;
};

export const ConfirmDialog: React.FC<Props> = ({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  danger,
  loading,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white shadow-xl border">
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
          </div>
          <div className="px-5 pb-5 flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded border bg-white text-sm"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              className={`px-4 py-2 rounded text-sm text-white ${
                danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'
              } disabled:opacity-60`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Working…' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
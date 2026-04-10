import React from 'react';

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const Pagination: React.FC<Props> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-gray-600">
        Page <span className="font-semibold">{page}</span> of{' '}
        <span className="font-semibold">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="px-3 py-2 rounded border bg-white text-sm disabled:opacity-50"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </button>
        <button
          className="px-3 py-2 rounded border bg-white text-sm disabled:opacity-50"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
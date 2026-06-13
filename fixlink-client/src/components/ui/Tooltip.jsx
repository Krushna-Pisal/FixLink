import { useState } from 'react';

export function Tooltip({ children, content, side = 'top' }) {
  const [visible, setVisible] = useState(false);
  const posMap = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`absolute z-50 ${posMap[side]} whitespace-nowrap`}>
          <span className="bg-fl-border text-fl-primary text-xs px-2 py-1 rounded shadow-lg">
            {content}
          </span>
        </div>
      )}
    </div>
  );
}

import { ElementType, ReactElement } from 'react';

export function IconButton({
  Icon,
  isActive = false,
  color = '',
  children,
  ...props
}: {
  Icon: ElementType;
  isActive: boolean;
  color: string;
  children: ReactElement | null;
}) {
  return (
    <button
      className={`btn icon-btn ${isActive ? 'icon-btn-active' : ''} ${color}`}
      {...props}
    >
      <span className={`${children != null ? 'mr-1' : ''}`}>
        <Icon />
      </span>
      {children}
    </button>
  );
}

import React, { type ReactNode } from 'react';

export interface HeaderProps {
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  subtitle = 'Mesa de Ayuda y Gestión de Tickets',
  children,
  className = 'mb-4',
}) => {
  return (
    <header className={`bg-white border-bottom header-top-accent py-3 px-4 shadow-sm ${className}`}>
      <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <div className="brand-logo-badge">
            C
          </div>
          <div>
            <h5 className="mb-0 lh-sm">
              <span className="brand-title-coopya">Coopya</span>{' '}
              <span className="brand-title-sistemas">Sistemas</span>
            </h5>
            <small className="text-secondary">
              {subtitle}
            </small>
          </div>
        </div>

        {children && (
          <div className="d-flex align-items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

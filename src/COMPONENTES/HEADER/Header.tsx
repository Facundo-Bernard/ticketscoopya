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
    <header className={`bg-white border-bottom header-top-accent py-2 py-sm-3 px-3 px-sm-4 shadow-sm ${className}`}>
      <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap gap-2 px-0">
        <div className="d-flex align-items-center gap-2 gap-sm-3">
          <div className="brand-logo-badge">
            C
          </div>
          <div>
            <h5 className="mb-0 lh-sm" style={{ fontSize: '1.05rem' }}>
              <span className="brand-title-coopya">Coopya</span>{' '}
              <span className="brand-title-sistemas">Sistemas</span>
            </h5>
            <small className="text-secondary d-none d-sm-block">
              {subtitle}
            </small>
          </div>
        </div>

        {children && (
          <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
            {children}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

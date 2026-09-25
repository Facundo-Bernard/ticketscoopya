import React from 'react'

export interface PaginationBarProps {
  currentPage: number
  totalPages: number
  totalTickets: number
  pageSize: number
  isLoading?: boolean
  onPageChange: (page: number) => void
}

/**
 * Genera el array de números de página con elipsis inteligente ('…')
 */
function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '…', total]
  }
  if (current >= total - 3) {
    return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
  }
  return [1, '…', current - 1, current, current + 1, '…', total]
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalPages,
  totalTickets,
  pageSize,
  isLoading = false,
  onPageChange,
}) => {
  if (totalTickets <= 0) {
    return null
  }

  const from = (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, totalTickets)
  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav className="pagination-bar-wrapper" aria-label="Navegación de páginas de tickets">
      {/* Texto informativo */}
      <div className="pagination-info">
        Mostrando <span className="pagination-num">{from}</span> &ndash;{' '}
        <span className="pagination-num">{to}</span> de{' '}
        <span className="pagination-num">{totalTickets}</span> tickets
      </div>

      {/* Controles de paginación clásica */}
      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn pagination-nav-btn"
          disabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Página anterior"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
          </svg>
          <span>Anterior</span>
        </button>

        <div className="pagination-pages-list">
          {pages.map((p, idx) => {
            if (p === '…') {
              return (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis" aria-hidden="true">
                  &hellip;
                </span>
              )
            }
            const isCurrent = p === currentPage
            return (
              <button
                key={`page-${p}`}
                type="button"
                className={`pagination-page-btn ${isCurrent ? 'active' : ''}`}
                aria-current={isCurrent ? 'page' : undefined}
                disabled={isLoading}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="pagination-btn pagination-nav-btn"
          disabled={currentPage >= totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Página siguiente"
        >
          <span>Siguiente</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>
    </nav>
  )
}

export default PaginationBar

export function Card({
  header = null,
  footer = null,
  title = '',
  subtitle = '',
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  ...props
}) {
  const resolvedHeader = header ?? (title || subtitle ? (
    <div>
      {title && <h3 className="text-lg font-semibold text-text">{title}</h3>}
      {subtitle && <p className="text-sm text-text/60 mt-0.5">{subtitle}</p>}
    </div>
  ) : null);

  const hasHeader = resolvedHeader !== null;
  const hasFooter = footer !== null;

  const headerPadding = headerClassName.includes('p-') ? '' : 'p-5';
  const bodyPadding = bodyClassName.includes('p-') ? '' : 'p-5';
  const footerPadding = footerClassName.includes('p-') ? '' : 'p-5';

  return (
    <div className={`border border-primary/30 rounded-xl shadow-sm ${className}`} {...props}>
      {hasHeader && (
        <div className={`${headerPadding} border-b border-primary/20 bg-surface rounded-t-xl ${headerClassName}`}>
          {resolvedHeader}
        </div>
      )}
      <div
        className={`${bodyPadding} bg-surface ${!hasHeader ? 'rounded-t-xl' : ''} ${!hasFooter ? 'rounded-b-xl' : ''} ${bodyClassName}`}
      >
        {children}
      </div>
      {hasFooter && (
        <div className={`${footerPadding} border-t border-primary/20 bg-surface rounded-b-xl ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
}

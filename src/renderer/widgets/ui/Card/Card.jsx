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

  const headerPadding = /(^|\s)p-/.test(headerClassName) ? '' : 'p-5';
  const bodyPadding = /(^|\s)p-/.test(bodyClassName) ? '' : 'p-5';
  const footerPadding = /(^|\s)p-/.test(footerClassName) ? '' : 'p-5';

  return (
    <div className={`border border-border rounded-xl shadow-sm bg-surface ${className}`} {...props}>
      {hasHeader && (
        <div className={`${headerPadding} border-b border-border/40 rounded-t-xl ${headerClassName}`}>
          {resolvedHeader}
        </div>
      )}
      <div className={`${bodyPadding} ${bodyClassName}`}>
        {children}
      </div>
      {hasFooter && (
        <div className={`${footerPadding} border-t border-border/40 rounded-b-xl ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
}

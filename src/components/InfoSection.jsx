import { useId } from 'react';

function renderValue(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  return value;
}

function InfoSection({ title, items, isEditMode = false, onFieldChange }) {
  const titleId = useId();

  return (
    <section className="info-section" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      <dl className="info-list">
        {items.map((item) => (
          <div key={item.label} className="info-row">
            <dt>{item.label}</dt>
            <dd>
              {isEditMode && item.path ? (
                <input
                  className="inline-field"
                  aria-label={item.label}
                  value={item.value ?? ''}
                  onChange={(event) => onFieldChange(item.path, event.target.value)}
                />
              ) : (
                renderValue(item.value)
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default InfoSection;

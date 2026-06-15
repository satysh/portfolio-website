import { useId } from 'react';

function renderValue(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  return value;
}

function InfoSection({ title, items }) {
  const titleId = useId();

  return (
    <section className="info-section" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      <dl className="info-list">
        {items.map((item) => (
          <div key={item.label} className="info-row">
            <dt>{item.label}</dt>
            <dd>{renderValue(item.value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default InfoSection;

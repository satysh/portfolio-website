function buildDoiLink(doi) {
  const value = String(doi ?? '').trim();

  if (!value) {
    return null;
  }

  return `https://doi.org/${value.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')}`;
}

function EditableCell({ label, value, path, isEditMode, onFieldChange, children }) {
  return (
    <td data-label={label}>
      {isEditMode ? (
        <input
          className="table-input"
          aria-label={label}
          value={value ?? ''}
          onChange={(event) => onFieldChange(path, event.target.value)}
        />
      ) : (
        children ?? value ?? '—'
      )}
    </td>
  );
}

function PublicationsTable({ publications, isEditMode = false, onFieldChange }) {
  if (!publications.length) {
    return <p className="empty-state">Публикации не указаны.</p>;
  }

  return (
    <div className="table-scroll">
      <table>
        <caption className="visually-hidden">Публикации сотрудника</caption>
        <thead>
          <tr>
            <th>Год</th>
            <th>Название статьи</th>
            <th>Авторы</th>
            <th>Журнал</th>
            <th>DOI</th>
          </tr>
        </thead>
        <tbody>
          {publications.map((publication, index) => {
            const doiLink = buildDoiLink(publication.doi);

            return (
              <tr key={`${publication.year}-${publication.title}-${publication.doi}`}>
                <EditableCell
                  label="Год"
                  value={publication.year}
                  path={`publications.${index}.year`}
                  isEditMode={isEditMode}
                  onFieldChange={onFieldChange}
                />
                <EditableCell
                  label="Название статьи"
                  value={publication.title}
                  path={`publications.${index}.title`}
                  isEditMode={isEditMode}
                  onFieldChange={onFieldChange}
                />
                <EditableCell
                  label="Авторы"
                  value={publication.authors}
                  path={`publications.${index}.authors`}
                  isEditMode={isEditMode}
                  onFieldChange={onFieldChange}
                />
                <EditableCell
                  label="Журнал"
                  value={publication.journal}
                  path={`publications.${index}.journal`}
                  isEditMode={isEditMode}
                  onFieldChange={onFieldChange}
                />
                <EditableCell
                  label="DOI"
                  value={publication.doi}
                  path={`publications.${index}.doi`}
                  isEditMode={isEditMode}
                  onFieldChange={onFieldChange}
                >
                  {doiLink ? (
                    <a href={doiLink} target="_blank" rel="noreferrer">
                      {publication.doi}
                    </a>
                  ) : (
                    '—'
                  )}
                </EditableCell>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PublicationsTable;

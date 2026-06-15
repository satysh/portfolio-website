function buildDoiLink(doi) {
  const value = String(doi ?? '').trim();

  if (!value) {
    return null;
  }

  return `https://doi.org/${value.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')}`;
}

function PublicationsTable({ publications }) {
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
          {publications.map((publication) => {
            const doiLink = buildDoiLink(publication.doi);

            return (
              <tr key={`${publication.year}-${publication.title}-${publication.doi}`}>
                <td>{publication.year}</td>
                <td>{publication.title}</td>
                <td>{publication.authors}</td>
                <td>{publication.journal}</td>
                <td>
                  {doiLink ? (
                    <a href={doiLink} target="_blank" rel="noreferrer">
                      {publication.doi}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PublicationsTable;

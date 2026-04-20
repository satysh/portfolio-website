function calculateAge(birthDate) {
  const dateOfBirth = new Date(birthDate);

  if (Number.isNaN(dateOfBirth.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age -= 1;
  }

  return age;
}

function buildProfileLink(type, id) {
  if (!id) {
    return null;
  }

  const trimmedId = id.trim();

  if (type === 'scopus') {
    return `https://www.scopus.com/authid/detail.uri?authorId=${encodeURIComponent(trimmedId)}`;
  }

  if (type === 'wos') {
    return `https://www.webofscience.com/wos/author/record/${encodeURIComponent(trimmedId)}`;
  }

  return `https://orcid.org/${encodeURIComponent(trimmedId)}`;
}

function EmployeeProfile({ employee, onDownloadCv }) {
  const age = calculateAge(employee.birthDate);

  return (
    <section className="profile-card">
      <div className="profile-photo" aria-label="Фото сотрудника">
        👤
      </div>
      <div className="profile-details">
        <h1>{employee.fullName}</h1>
        <p><strong>Должность:</strong> {employee.position}</p>
        <p><strong>Лаборатория:</strong> {employee.laboratory}</p>
        <p><strong>Дата рождения:</strong> {employee.birthDate}</p>
        <p><strong>Возраст:</strong> {age ?? '—'}</p>
        <p><strong>Телефон:</strong> {employee.phone}</p>
        <p><strong>Email:</strong> {employee.email}</p>
        <p>
          <strong>Scopus ID:</strong>{' '}
          <a href={buildProfileLink('scopus', employee.scopusId)} target="_blank" rel="noreferrer">
            {employee.scopusId}
          </a>
        </p>
        <p>
          <strong>Web of Science ID:</strong>{' '}
          <a href={buildProfileLink('wos', employee.wosId)} target="_blank" rel="noreferrer">
            {employee.wosId}
          </a>
        </p>
        <p>
          <strong>ORCID ID:</strong>{' '}
          <a href={buildProfileLink('orcid', employee.orcidId)} target="_blank" rel="noreferrer">
            {employee.orcidId}
          </a>
        </p>
        <p><strong>Ученая степень:</strong> {employee.academicDegree.degree}</p>
        <p><strong>Год получения степени:</strong> {employee.academicDegree.year}</p>
        <p><strong>Место защиты:</strong> {employee.academicDegree.defensePlace}</p>
        <button type="button" className="search-button" onClick={onDownloadCv}>
          Скачать CV
        </button>
      </div>
    </section>
  );
}

export default EmployeeProfile;

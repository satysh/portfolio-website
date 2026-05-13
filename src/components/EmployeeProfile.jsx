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

function EmployeeProfile({ employee, isEditMode, onToggleEditMode, onFieldChange, onDownloadCv }) {
  const age = calculateAge(employee.birthDate);

  const renderTextField = (label, value, key) => (
    <p>
      <strong>{label}:</strong>{' '}
      {isEditMode ? (
        <input value={value} onChange={(event) => onFieldChange(key, event.target.value)} />
      ) : value}
    </p>
  );

  return (
    <section className="profile-card">
      <button type="button" className="edit-mode-button" onClick={onToggleEditMode}>
        {isEditMode ? 'Done' : 'Edit'}
      </button>
      <div className="profile-photo" aria-label="Фото сотрудника">
        👤
      </div>
      <div className="profile-details">
        {isEditMode ? (
          <input
            className="name-input"
            value={employee.fullName}
            onChange={(event) => onFieldChange('fullName', event.target.value)}
          />
        ) : (
          <h1>{employee.fullName}</h1>
        )}
        {renderTextField('Должность', employee.position, 'position')}
        {renderTextField('Лаборатория', employee.laboratory, 'laboratory')}
        {renderTextField('Дата рождения', employee.birthDate, 'birthDate')}
        <p><strong>Возраст:</strong> {age ?? '—'}</p>
        {renderTextField('Телефон', employee.phone, 'phone')}
        {renderTextField('Email', employee.email, 'email')}
        {renderTextField('Scopus ID', employee.scopusId, 'scopusId')}
        {!isEditMode && (
          <p>
            <strong>Scopus:</strong>{' '}
            <a href={buildProfileLink('scopus', employee.scopusId)} target="_blank" rel="noreferrer">
              Открыть профиль
            </a>
          </p>
        )}
        {renderTextField('Web of Science ID', employee.wosId, 'wosId')}
        {!isEditMode && (
          <p>
            <strong>Web of Science:</strong>{' '}
            <a href={buildProfileLink('wos', employee.wosId)} target="_blank" rel="noreferrer">
              Открыть профиль
            </a>
          </p>
        )}
        {renderTextField('ORCID ID', employee.orcidId, 'orcidId')}
        {!isEditMode && (
          <p>
            <strong>ORCID:</strong>{' '}
            <a href={buildProfileLink('orcid', employee.orcidId)} target="_blank" rel="noreferrer">
              Открыть профиль
            </a>
          </p>
        )}
        {renderTextField('Ученая степень', employee.academicDegree.degree, 'academicDegree.degree')}
        {renderTextField('Год получения степени', employee.academicDegree.year, 'academicDegree.year')}
        {renderTextField('Место защиты', employee.academicDegree.defensePlace, 'academicDegree.defensePlace')}
        <button type="button" className="search-button" onClick={onDownloadCv}>
          Скачать CV
        </button>
      </div>
    </section>
  );
}

export default EmployeeProfile;

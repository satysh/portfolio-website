import {
  buildMailTo,
  buildProfileLink,
  buildTelLink,
  calculateAge,
  formatDate,
  getInitials
} from '../utils/employees';

function ContactLink({ href, children }) {
  if (!href || !children) {
    return '—';
  }

  return <a href={href}>{children}</a>;
}

function ProfileLink({ type, id }) {
  const href = buildProfileLink(type, id);

  if (!href) {
    return '—';
  }

  return (
    <a href={href} target="_blank" rel="noreferrer">
      {id}
    </a>
  );
}

function EditableValue({ isEditMode, path, value, displayValue, onFieldChange, ariaLabel }) {
  if (isEditMode && path) {
    return (
      <input
        className="inline-field"
        aria-label={ariaLabel}
        value={value ?? ''}
        onChange={(event) => onFieldChange(path, event.target.value)}
      />
    );
  }

  return displayValue || value || '—';
}

function EmployeeProfile({ employee, isEditMode = false, onFieldChange, onDownloadCv }) {
  const age = calculateAge(employee.birthDate);
  const primaryFields = [
    { label: 'Должность', path: 'position', value: employee.position },
    { label: 'Лаборатория', path: 'laboratory', value: employee.laboratory },
    {
      label: 'Дата рождения',
      path: 'birthDate',
      value: employee.birthDate,
      displayValue: formatDate(employee.birthDate)
    },
    { label: 'Возраст', value: age ?? '—' },
    {
      label: 'Телефон',
      path: 'phone',
      value: employee.phone,
      displayValue: <ContactLink href={buildTelLink(employee.phone)}>{employee.phone}</ContactLink>
    },
    {
      label: 'Email',
      path: 'email',
      value: employee.email,
      displayValue: <ContactLink href={buildMailTo(employee.email)}>{employee.email}</ContactLink>
    },
    {
      label: 'Scopus ID',
      path: 'scopusId',
      value: employee.scopusId,
      displayValue: <ProfileLink type="scopus" id={employee.scopusId} />
    },
    {
      label: 'Web of Science ID',
      path: 'wosId',
      value: employee.wosId,
      displayValue: <ProfileLink type="wos" id={employee.wosId} />
    },
    {
      label: 'ORCID ID',
      path: 'orcidId',
      value: employee.orcidId,
      displayValue: <ProfileLink type="orcid" id={employee.orcidId} />
    },
    {
      label: 'Ученая степень',
      path: 'academicDegree.degree',
      value: employee.academicDegree.degree
    },
    {
      label: 'Год получения степени',
      path: 'academicDegree.year',
      value: employee.academicDegree.year
    },
    {
      label: 'Место защиты',
      path: 'academicDegree.defensePlace',
      value: employee.academicDegree.defensePlace
    }
  ];

  return (
    <section className="profile-card" aria-labelledby="employee-profile-title">
      <div className="profile-aside">
        <div className="profile-photo" aria-hidden="true">
          {getInitials(employee.fullName)}
        </div>
        <button type="button" className="primary-button" onClick={onDownloadCv}>
          Скачать CV
        </button>
      </div>
      <div className="profile-details">
        {isEditMode ? (
          <input
            id="employee-profile-title"
            className="name-input"
            aria-label="ФИО"
            value={employee.fullName}
            onChange={(event) => onFieldChange('fullName', event.target.value)}
          />
        ) : (
          <h1 id="employee-profile-title">{employee.fullName}</h1>
        )}
        <dl className="profile-meta">
          {primaryFields.map((field) => (
            <div key={field.label} className="profile-meta-row">
              <dt>{field.label}</dt>
              <dd>
                <EditableValue
                  isEditMode={isEditMode}
                  path={field.path}
                  value={field.value}
                  displayValue={field.displayValue}
                  onFieldChange={onFieldChange}
                  ariaLabel={field.label}
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default EmployeeProfile;

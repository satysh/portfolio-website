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

function EmployeeProfile({ employee, onDownloadCv }) {
  const age = calculateAge(employee.birthDate);
  const primaryFields = [
    { label: 'Должность', value: employee.position },
    { label: 'Лаборатория', value: employee.laboratory },
    { label: 'Дата рождения', value: formatDate(employee.birthDate) },
    { label: 'Возраст', value: age ?? '—' },
    {
      label: 'Телефон',
      value: <ContactLink href={buildTelLink(employee.phone)}>{employee.phone}</ContactLink>
    },
    {
      label: 'Email',
      value: <ContactLink href={buildMailTo(employee.email)}>{employee.email}</ContactLink>
    },
    { label: 'Scopus ID', value: <ProfileLink type="scopus" id={employee.scopusId} /> },
    { label: 'Web of Science ID', value: <ProfileLink type="wos" id={employee.wosId} /> },
    { label: 'ORCID ID', value: <ProfileLink type="orcid" id={employee.orcidId} /> },
    { label: 'Ученая степень', value: employee.academicDegree.degree },
    { label: 'Год получения степени', value: employee.academicDegree.year },
    { label: 'Место защиты', value: employee.academicDegree.defensePlace }
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
        <h1 id="employee-profile-title">{employee.fullName}</h1>
        <dl className="profile-meta">
          {primaryFields.map((field) => (
            <div key={field.label} className="profile-meta-row">
              <dt>{field.label}</dt>
              <dd>{field.value || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default EmployeeProfile;

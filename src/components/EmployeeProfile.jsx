function EmployeeProfile({ employee }) {
  return (
    <section className="profile-card">
      <div className="profile-photo" aria-label="Фото сотрудника">
        👤
      </div>
      <div className="profile-details">
        <h1>{employee.fullName}</h1>
        <p><strong>Должность:</strong> {employee.position}</p>
        <p><strong>Отдел:</strong> {employee.department}</p>
        <p><strong>Телефон:</strong> {employee.phone}</p>
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Scopus ID:</strong> {employee.scopusId}</p>
        <p><strong>WoS ID:</strong> {employee.wosId}</p>
        <p><strong>ORCID ID:</strong> {employee.orcidId}</p>
      </div>
    </section>
  );
}

export default EmployeeProfile;

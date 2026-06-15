import { Link } from 'react-router-dom';
import { buildMailTo, buildTelLink } from '../utils/employees';

function EmployeeTable({ employees }) {
  return (
    <section className="table-card" aria-labelledby="employees-table-title">
      <div className="table-header">
        <h2 id="employees-table-title">Результаты</h2>
      </div>

      <div className="table-scroll">
        <table>
          <caption className="visually-hidden">Список сотрудников</caption>
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Должность</th>
              <th>E-mail</th>
              <th>Телефон</th>
              <th>Лаборатория</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => {
              const mailTo = buildMailTo(employee.email);
              const telLink = buildTelLink(employee.phone);

              return (
                <tr key={employee.id}>
                  <td data-label="ФИО">
                    <Link to={`/employee/${employee.id}`} className="table-primary-link">
                      {employee.shortName}
                    </Link>
                  </td>
                  <td data-label="Должность">{employee.position}</td>
                  <td data-label="E-mail">
                    {mailTo ? <a href={mailTo}>{employee.email}</a> : '—'}
                  </td>
                  <td data-label="Телефон" className="phone-cell">
                    {telLink ? <a href={telLink}>{employee.phone}</a> : '—'}
                  </td>
                  <td data-label="Лаборатория">{employee.laboratory}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!employees.length && <p className="empty-state">Сотрудники не найдены.</p>}
    </section>
  );
}

export default EmployeeTable;

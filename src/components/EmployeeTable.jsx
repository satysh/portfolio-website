import { useNavigate } from 'react-router-dom';

function EmployeeTable({ employees }) {
  const navigate = useNavigate();

  return (
    <section className="table-card">
      <table>
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
          {employees.map((employee) => (
            <tr
              key={employee.id}
              onClick={() => navigate(`/employee/${employee.id}`)}
              className="clickable-row"
            >
              <td data-label="ФИО">{employee.shortName}</td>
              <td data-label="Должность">{employee.position}</td>
              <td data-label="E-mail">{employee.email}</td>
              <td data-label="Телефон" className="phone-cell">{employee.phone}</td>
              <td data-label="Лаборатория">{employee.laboratory}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!employees.length && <p className="empty-state">Сотрудники не найдены.</p>}
    </section>
  );
}

export default EmployeeTable;

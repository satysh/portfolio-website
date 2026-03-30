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
              <td>{employee.shortName}</td>
              <td>{employee.position}</td>
              <td>{employee.email}</td>
              <td>{employee.phone}</td>
              <td>{employee.laboratory}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!employees.length && <p className="empty-state">Сотрудники не найдены.</p>}
    </section>
  );
}

export default EmployeeTable;

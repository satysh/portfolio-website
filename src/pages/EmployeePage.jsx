import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import Header from '../components/Header';
import EmployeeProfile from '../components/EmployeeProfile';
import Tabs from '../components/Tabs';
import { employees } from '../data/employees';

const tabs = [
  { id: 'profile', label: 'Анкета' },
  { id: 'publications', label: 'Публикации' },
  { id: 'kazakhstan', label: 'Работы в Казахстане' }
];

function EmployeePage() {
  const { employeeId } = useParams();
  const [activeTab, setActiveTab] = useState('profile');

  const employee = useMemo(
    () => employees.find((item) => item.id === employeeId),
    [employeeId]
  );

  if (!employee) {
    return (
      <div className="page">
        <Header />
        <main className="content">
          <p>Сотрудник не найден.</p>
          <Link to="/" className="back-link">Вернуться к списку</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Header />
      <main className="content">
        <Link to="/" className="back-link">← Назад к таблице</Link>
        <EmployeeProfile employee={employee} />
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'profile' && (
          <section className="tab-content">
            <h2>Сфера деятельности</h2>
            <p><strong>Навыки:</strong> {employee.activity.skills}</p>
            <p><strong>Опыт работы:</strong> {employee.activity.experience}</p>
            <p><strong>Дата начала работы:</strong> {employee.activity.startDate}</p>
            <p><strong>Проекты / зоны ответственности:</strong> {employee.activity.projects}</p>

            <h2>Административное</h2>
            <p><strong>Тип договора:</strong> {employee.admin.contractType}</p>
            <p><strong>Срок окончания договора:</strong> {employee.admin.contractEndDate}</p>

            <h2>Будущие планы</h2>
            <p>
              Сделать для Казахстана все хорошо, а не плохо,
              и самое главное — от чистого сердца.
            </p>
          </section>
        )}

        {activeTab === 'publications' && (
          <section className="tab-content">
            <table>
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
                {employee.publications.map((publication) => (
                  <tr key={`${publication.year}-${publication.title}-${publication.doi}`}>
                    <td>{publication.year}</td>
                    <td>{publication.title}</td>
                    <td>{publication.authors}</td>
                    <td>{publication.journal}</td>
                    <td>{publication.doi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'kazakhstan' && (
          <section className="tab-content">
            <p>{employee.kazakhstanWorks}</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default EmployeePage;

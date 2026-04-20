import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import Header from '../components/Header';
import EmployeeProfile from '../components/EmployeeProfile';
import Tabs from '../components/Tabs';
import { employees } from '../data/employees';

const tabs = [
  { id: 'profile', label: 'Анкета' },
  { id: 'publications', label: 'Публикации' },
  { id: 'jinrActivity', label: 'Деятельность в ОИЯИ' },
  { id: 'kazakhstanActivity', label: 'Деятельность в Казахстане' }
];

function buildCvMarkdown(employee) {
  return `# CV: ${employee.fullName}

## Основная информация
- **ФИО:** ${employee.fullName}
- **Должность:** ${employee.position}
- **Лаборатория:** ${employee.laboratory}
- **Дата рождения:** ${employee.birthDate}
- **Email:** ${employee.email}
- **Телефон:** ${employee.phone}

## Научные профили
- **Scopus ID:** ${employee.scopusId}
- **Web of Science ID:** ${employee.wosId}
- **ORCID ID:** ${employee.orcidId}

## Научная квалификация
- **Ученая степень:** ${employee.academicDegree.degree}
- **Год получения степени:** ${employee.academicDegree.year}
- **Место защиты:** ${employee.academicDegree.defensePlace}

## Сфера деятельности
- **Навыки:** ${employee.activity.skills}
- **Опыт работы:** ${employee.activity.experience}
- **Дата начала работы:** ${employee.activity.startDate}
- **Проекты / зоны ответственности:** ${employee.activity.projects}

## Деятельность в ОИЯИ
${employee.jinrActivity}

## Деятельность в Казахстане
${employee.kazakhstanActivity}

## Руководитель в ОИЯИ
- **Лаборатория:** ${employee.supervisors.jinr.laboratory}
- **Должность:** ${employee.supervisors.jinr.position}
- **Email:** ${employee.supervisors.jinr.email}
- **Телефон:** ${employee.supervisors.jinr.phone}

## Руководитель в Казахстане
- **Лаборатория:** ${employee.supervisors.kazakhstan.laboratory}
- **Должность:** ${employee.supervisors.kazakhstan.position}
- **Email:** ${employee.supervisors.kazakhstan.email}
- **Телефон:** ${employee.supervisors.kazakhstan.phone}
`;
}

function downloadCv(employee) {
  const markdown = buildCvMarkdown(employee);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${employee.id}-cv.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

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
        <EmployeeProfile employee={employee} onDownloadCv={() => downloadCv(employee)} />
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

            <h2>Руководитель в ОИЯИ</h2>
            <p><strong>Лаборатория:</strong> {employee.supervisors.jinr.laboratory}</p>
            <p><strong>Должность:</strong> {employee.supervisors.jinr.position}</p>
            <p><strong>Email:</strong> {employee.supervisors.jinr.email}</p>
            <p><strong>Телефон:</strong> {employee.supervisors.jinr.phone}</p>

            <h2>Руководитель в Казахстане</h2>
            <p><strong>Лаборатория:</strong> {employee.supervisors.kazakhstan.laboratory}</p>
            <p><strong>Должность:</strong> {employee.supervisors.kazakhstan.position}</p>
            <p><strong>Email:</strong> {employee.supervisors.kazakhstan.email}</p>
            <p><strong>Телефон:</strong> {employee.supervisors.kazakhstan.phone}</p>
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

        {activeTab === 'jinrActivity' && (
          <section className="tab-content">
            <p>{employee.jinrActivity}</p>
          </section>
        )}

        {activeTab === 'kazakhstanActivity' && (
          <section className="tab-content">
            <p>{employee.kazakhstanActivity}</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default EmployeePage;

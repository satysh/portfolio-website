import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
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
  const [isEditMode, setIsEditMode] = useState(false);

  const employee = useMemo(
    () => employees.find((item) => item.id === employeeId),
    [employeeId]
  );

  const [employeeData, setEmployeeData] = useState(employee);

  useEffect(() => {
    if (!employeeId || !employee) {
      setEmployeeData(employee);
      return;
    }

    const localData = localStorage.getItem(`employee-profile-${employeeId}`);
    setEmployeeData(localData ? JSON.parse(localData) : employee);
  }, [employeeId, employee]);

  const updateEmployeeField = (path, value) => {
    setEmployeeData((previousData) => {
      if (!previousData) {
        return previousData;
      }

      const keys = path.split('.');
      const nextData = structuredClone(previousData);
      let current = nextData;

      for (let index = 0; index < keys.length - 1; index += 1) {
        current = current[keys[index]];
      }

      current[keys.at(-1)] = value;
      localStorage.setItem(`employee-profile-${employeeId}`, JSON.stringify(nextData));

      return nextData;
    });
  };

  if (!employeeData) {
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
        <EmployeeProfile
          employee={employeeData}
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode((previous) => !previous)}
          onFieldChange={updateEmployeeField}
          onDownloadCv={() => downloadCv(employeeData)}
        />
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'profile' && (
          <section className="tab-content">
            <h2>Сфера деятельности</h2>
            <p><strong>Навыки:</strong> {employeeData.activity.skills}</p>
            <p><strong>Опыт работы:</strong> {employeeData.activity.experience}</p>
            <p><strong>Дата начала работы:</strong> {employeeData.activity.startDate}</p>
            <p><strong>Проекты / зоны ответственности:</strong> {employeeData.activity.projects}</p>

            <h2>Административное</h2>
            <p><strong>Тип договора:</strong> {employeeData.admin.contractType}</p>
            <p><strong>Срок окончания договора:</strong> {employeeData.admin.contractEndDate}</p>

            <h2>Руководитель в ОИЯИ</h2>
            <p><strong>Лаборатория:</strong> {employeeData.supervisors.jinr.laboratory}</p>
            <p><strong>Должность:</strong> {employeeData.supervisors.jinr.position}</p>
            <p><strong>Email:</strong> {employeeData.supervisors.jinr.email}</p>
            <p><strong>Телефон:</strong> {employeeData.supervisors.jinr.phone}</p>

            <h2>Руководитель в Казахстане</h2>
            <p><strong>Лаборатория:</strong> {employeeData.supervisors.kazakhstan.laboratory}</p>
            <p><strong>Должность:</strong> {employeeData.supervisors.kazakhstan.position}</p>
            <p><strong>Email:</strong> {employeeData.supervisors.kazakhstan.email}</p>
            <p><strong>Телефон:</strong> {employeeData.supervisors.kazakhstan.phone}</p>
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
                {employeeData.publications.map((publication) => (
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
            <p>{employeeData.jinrActivity}</p>
          </section>
        )}

        {activeTab === 'kazakhstanActivity' && (
          <section className="tab-content">
            <p>{employeeData.kazakhstanActivity}</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default EmployeePage;

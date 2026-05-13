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
  const [editModes, setEditModes] = useState({
    profile: false,
    publications: false,
    jinrActivity: false,
    kazakhstanActivity: false
  });

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

  const toggleEditMode = (sectionId) => {
    setEditModes((previous) => ({
      ...previous,
      [sectionId]: !previous[sectionId]
    }));
  };

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
        <div className="employee-page-header">
          <Link to="/" className="back-link">← Назад к таблице</Link>
          <button type="button" className="edit-mode-button" onClick={() => toggleEditMode(activeTab)}>
            {editModes[activeTab] ? 'Done' : 'Edit'}
          </button>
        </div>
        <EmployeeProfile
          employee={employeeData}
          isEditMode={editModes.profile}
          onFieldChange={updateEmployeeField}
          onDownloadCv={() => downloadCv(employeeData)}
        />
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'profile' && (
          <section className="tab-content">
            <h2>Сфера деятельности</h2>
            <p><strong>Навыки:</strong> {editModes.profile ? (
              <input value={employeeData.activity.skills} onChange={(event) => updateEmployeeField('activity.skills', event.target.value)} />
            ) : employeeData.activity.skills}</p>
            <p><strong>Опыт работы:</strong> {editModes.profile ? (
              <input value={employeeData.activity.experience} onChange={(event) => updateEmployeeField('activity.experience', event.target.value)} />
            ) : employeeData.activity.experience}</p>
            <p><strong>Дата начала работы:</strong> {editModes.profile ? (
              <input value={employeeData.activity.startDate} onChange={(event) => updateEmployeeField('activity.startDate', event.target.value)} />
            ) : employeeData.activity.startDate}</p>
            <p><strong>Проекты / зоны ответственности:</strong> {editModes.profile ? (
              <input value={employeeData.activity.projects} onChange={(event) => updateEmployeeField('activity.projects', event.target.value)} />
            ) : employeeData.activity.projects}</p>

            <h2>Административное</h2>
            <p><strong>Тип договора:</strong> {editModes.profile ? (
              <input value={employeeData.admin.contractType} onChange={(event) => updateEmployeeField('admin.contractType', event.target.value)} />
            ) : employeeData.admin.contractType}</p>
            <p><strong>Срок окончания договора:</strong> {editModes.profile ? (
              <input value={employeeData.admin.contractEndDate} onChange={(event) => updateEmployeeField('admin.contractEndDate', event.target.value)} />
            ) : employeeData.admin.contractEndDate}</p>

            <h2>Руководитель в ОИЯИ</h2>
            <p><strong>Лаборатория:</strong> {editModes.profile ? (
              <input value={employeeData.supervisors.jinr.laboratory} onChange={(event) => updateEmployeeField('supervisors.jinr.laboratory', event.target.value)} />
            ) : employeeData.supervisors.jinr.laboratory}</p>
            <p><strong>Должность:</strong> {editModes.profile ? (
              <input value={employeeData.supervisors.jinr.position} onChange={(event) => updateEmployeeField('supervisors.jinr.position', event.target.value)} />
            ) : employeeData.supervisors.jinr.position}</p>
            <p><strong>Email:</strong> {editModes.profile ? (
              <input value={employeeData.supervisors.jinr.email} onChange={(event) => updateEmployeeField('supervisors.jinr.email', event.target.value)} />
            ) : employeeData.supervisors.jinr.email}</p>
            <p><strong>Телефон:</strong> {editModes.profile ? (
              <input value={employeeData.supervisors.jinr.phone} onChange={(event) => updateEmployeeField('supervisors.jinr.phone', event.target.value)} />
            ) : employeeData.supervisors.jinr.phone}</p>

            <h2>Руководитель в Казахстане</h2>
            <p><strong>Лаборатория:</strong> {editModes.profile ? (
              <input value={employeeData.supervisors.kazakhstan.laboratory} onChange={(event) => updateEmployeeField('supervisors.kazakhstan.laboratory', event.target.value)} />
            ) : employeeData.supervisors.kazakhstan.laboratory}</p>
            <p><strong>Должность:</strong> {editModes.profile ? (
              <input value={employeeData.supervisors.kazakhstan.position} onChange={(event) => updateEmployeeField('supervisors.kazakhstan.position', event.target.value)} />
            ) : employeeData.supervisors.kazakhstan.position}</p>
            <p><strong>Email:</strong> {editModes.profile ? (
              <input value={employeeData.supervisors.kazakhstan.email} onChange={(event) => updateEmployeeField('supervisors.kazakhstan.email', event.target.value)} />
            ) : employeeData.supervisors.kazakhstan.email}</p>
            <p><strong>Телефон:</strong> {editModes.profile ? (
              <input value={employeeData.supervisors.kazakhstan.phone} onChange={(event) => updateEmployeeField('supervisors.kazakhstan.phone', event.target.value)} />
            ) : employeeData.supervisors.kazakhstan.phone}</p>
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
                {employeeData.publications.map((publication, index) => (
                  <tr key={`${publication.year}-${publication.title}-${publication.doi}`}>
                    <td>{editModes.publications ? (<input value={publication.year} onChange={(event) => updateEmployeeField(`publications.${index}.year`, event.target.value)} />) : publication.year}</td>
                    <td>{editModes.publications ? (<input value={publication.title} onChange={(event) => updateEmployeeField(`publications.${index}.title`, event.target.value)} />) : publication.title}</td>
                    <td>{editModes.publications ? (<input value={publication.authors} onChange={(event) => updateEmployeeField(`publications.${index}.authors`, event.target.value)} />) : publication.authors}</td>
                    <td>{editModes.publications ? (<input value={publication.journal} onChange={(event) => updateEmployeeField(`publications.${index}.journal`, event.target.value)} />) : publication.journal}</td>
                    <td>{editModes.publications ? (<input value={publication.doi} onChange={(event) => updateEmployeeField(`publications.${index}.doi`, event.target.value)} />) : publication.doi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'jinrActivity' && (
          <section className="tab-content">
            {editModes.jinrActivity ? (
              <textarea value={employeeData.jinrActivity} onChange={(event) => updateEmployeeField('jinrActivity', event.target.value)} rows={6} />
            ) : (
              <p>{employeeData.jinrActivity}</p>
            )}
          </section>
        )}

        {activeTab === 'kazakhstanActivity' && (
          <section className="tab-content">
            {editModes.kazakhstanActivity ? (
              <textarea value={employeeData.kazakhstanActivity} onChange={(event) => updateEmployeeField('kazakhstanActivity', event.target.value)} rows={6} />
            ) : (
              <p>{employeeData.kazakhstanActivity}</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default EmployeePage;

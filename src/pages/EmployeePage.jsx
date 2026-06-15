import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import Header from '../components/Header';
import EmployeeProfile from '../components/EmployeeProfile';
import InfoSection from '../components/InfoSection';
import PublicationsTable from '../components/PublicationsTable';
import Tabs from '../components/Tabs';
import { employees } from '../data/employees';
import { downloadEmployeeCv } from '../utils/cv';

const tabs = [
  { id: 'profile', label: 'Анкета' },
  { id: 'publications', label: 'Публикации' },
  { id: 'jinrActivity', label: 'Деятельность в ОИЯИ' },
  { id: 'kazakhstanActivity', label: 'Деятельность в Казахстане' }
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
        <main className="content empty-page">
          <h1>Сотрудник не найден</h1>
          <Link to="/" className="back-link">Вернуться к списку</Link>
        </main>
      </div>
    );
  }

  const activityItems = [
    { label: 'Навыки', value: employee.activity.skills },
    { label: 'Опыт работы', value: employee.activity.experience },
    { label: 'Дата начала работы', value: employee.activity.startDate },
    { label: 'Проекты / зоны ответственности', value: employee.activity.projects }
  ];
  const adminItems = [
    { label: 'Тип договора', value: employee.admin.contractType },
    { label: 'Срок окончания договора', value: employee.admin.contractEndDate }
  ];
  const jinrSupervisorItems = [
    { label: 'Лаборатория', value: employee.supervisors.jinr.laboratory },
    { label: 'Должность', value: employee.supervisors.jinr.position },
    { label: 'Email', value: employee.supervisors.jinr.email },
    { label: 'Телефон', value: employee.supervisors.jinr.phone }
  ];
  const kazakhstanSupervisorItems = [
    { label: 'Лаборатория', value: employee.supervisors.kazakhstan.laboratory },
    { label: 'Должность', value: employee.supervisors.kazakhstan.position },
    { label: 'Email', value: employee.supervisors.kazakhstan.email },
    { label: 'Телефон', value: employee.supervisors.kazakhstan.phone }
  ];

  return (
    <div className="page">
      <Header />
      <main className="content">
        <Link to="/" className="back-link">← Назад к таблице</Link>
        <EmployeeProfile employee={employee} onDownloadCv={() => downloadEmployeeCv(employee)} />
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'profile' && (
          <section
            id="panel-profile"
            className="tab-content"
            role="tabpanel"
            aria-labelledby="tab-profile"
          >
            <div className="detail-grid">
              <InfoSection title="Сфера деятельности" items={activityItems} />
              <InfoSection title="Административное" items={adminItems} />
              <InfoSection title="Руководитель в ОИЯИ" items={jinrSupervisorItems} />
              <InfoSection title="Руководитель в Казахстане" items={kazakhstanSupervisorItems} />
            </div>
          </section>
        )}

        {activeTab === 'publications' && (
          <section
            id="panel-publications"
            className="tab-content"
            role="tabpanel"
            aria-labelledby="tab-publications"
          >
            <PublicationsTable publications={employee.publications} />
          </section>
        )}

        {activeTab === 'jinrActivity' && (
          <section
            id="panel-jinrActivity"
            className="tab-content prose"
            role="tabpanel"
            aria-labelledby="tab-jinrActivity"
          >
            <p>{employee.jinrActivity}</p>
          </section>
        )}

        {activeTab === 'kazakhstanActivity' && (
          <section
            id="panel-kazakhstanActivity"
            className="tab-content prose"
            role="tabpanel"
            aria-labelledby="tab-kazakhstanActivity"
          >
            <p>{employee.kazakhstanActivity}</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default EmployeePage;

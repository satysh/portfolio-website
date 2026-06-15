import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
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

const defaultEditModes = {
  profile: false,
  publications: false,
  jinrActivity: false,
  kazakhstanActivity: false
};

function cloneData(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function loadEmployeeOverride(employeeId, employee) {
  if (!employeeId || !employee) {
    return employee ?? null;
  }

  try {
    const localData = localStorage.getItem(`employee-profile-${employeeId}`);
    return localData ? JSON.parse(localData) : employee;
  } catch {
    return employee;
  }
}

function EmployeePage() {
  const { employeeId } = useParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [editModes, setEditModes] = useState(defaultEditModes);

  const employee = useMemo(
    () => employees.find((item) => item.id === employeeId),
    [employeeId]
  );

  const [employeeData, setEmployeeData] = useState(() => loadEmployeeOverride(employeeId, employee));

  useEffect(() => {
    setEmployeeData(loadEmployeeOverride(employeeId, employee));
    setEditModes(defaultEditModes);
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
      const nextData = cloneData(previousData);
      let current = nextData;

      for (let index = 0; index < keys.length - 1; index += 1) {
        current = current[keys[index]];
      }

      current[keys.at(-1)] = value;

      try {
        localStorage.setItem(`employee-profile-${employeeId}`, JSON.stringify(nextData));
      } catch {
        // Local edits are best-effort until a backend exists.
      }

      return nextData;
    });
  };

  if (!employeeData) {
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
    { label: 'Навыки', path: 'activity.skills', value: employeeData.activity.skills },
    { label: 'Опыт работы', path: 'activity.experience', value: employeeData.activity.experience },
    { label: 'Дата начала работы', path: 'activity.startDate', value: employeeData.activity.startDate },
    {
      label: 'Проекты / зоны ответственности',
      path: 'activity.projects',
      value: employeeData.activity.projects
    }
  ];
  const adminItems = [
    { label: 'Тип договора', path: 'admin.contractType', value: employeeData.admin.contractType },
    {
      label: 'Срок окончания договора',
      path: 'admin.contractEndDate',
      value: employeeData.admin.contractEndDate
    }
  ];
  const jinrSupervisorItems = [
    {
      label: 'Лаборатория',
      path: 'supervisors.jinr.laboratory',
      value: employeeData.supervisors.jinr.laboratory
    },
    {
      label: 'Должность',
      path: 'supervisors.jinr.position',
      value: employeeData.supervisors.jinr.position
    },
    {
      label: 'Email',
      path: 'supervisors.jinr.email',
      value: employeeData.supervisors.jinr.email
    },
    {
      label: 'Телефон',
      path: 'supervisors.jinr.phone',
      value: employeeData.supervisors.jinr.phone
    }
  ];
  const kazakhstanSupervisorItems = [
    {
      label: 'Лаборатория',
      path: 'supervisors.kazakhstan.laboratory',
      value: employeeData.supervisors.kazakhstan.laboratory
    },
    {
      label: 'Должность',
      path: 'supervisors.kazakhstan.position',
      value: employeeData.supervisors.kazakhstan.position
    },
    {
      label: 'Email',
      path: 'supervisors.kazakhstan.email',
      value: employeeData.supervisors.kazakhstan.email
    },
    {
      label: 'Телефон',
      path: 'supervisors.kazakhstan.phone',
      value: employeeData.supervisors.kazakhstan.phone
    }
  ];

  return (
    <div className="page">
      <Header />
      <main className="content">
        <div className="employee-page-header">
          <Link to="/" className="back-link">← Назад к таблице</Link>
          <button type="button" className="secondary-button" onClick={() => toggleEditMode(activeTab)}>
            {editModes[activeTab] ? 'Готово' : 'Редактировать'}
          </button>
        </div>

        <EmployeeProfile
          employee={employeeData}
          isEditMode={editModes.profile}
          onFieldChange={updateEmployeeField}
          onDownloadCv={() => downloadEmployeeCv(employeeData)}
        />
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'profile' && (
          <section
            id="panel-profile"
            className="tab-content"
            role="tabpanel"
            aria-labelledby="tab-profile"
          >
            <div className="detail-grid">
              <InfoSection
                title="Сфера деятельности"
                items={activityItems}
                isEditMode={editModes.profile}
                onFieldChange={updateEmployeeField}
              />
              <InfoSection
                title="Административное"
                items={adminItems}
                isEditMode={editModes.profile}
                onFieldChange={updateEmployeeField}
              />
              <InfoSection
                title="Руководитель в ОИЯИ"
                items={jinrSupervisorItems}
                isEditMode={editModes.profile}
                onFieldChange={updateEmployeeField}
              />
              <InfoSection
                title="Руководитель в Казахстане"
                items={kazakhstanSupervisorItems}
                isEditMode={editModes.profile}
                onFieldChange={updateEmployeeField}
              />
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
            <PublicationsTable
              publications={employeeData.publications}
              isEditMode={editModes.publications}
              onFieldChange={updateEmployeeField}
            />
          </section>
        )}

        {activeTab === 'jinrActivity' && (
          <section
            id="panel-jinrActivity"
            className="tab-content prose"
            role="tabpanel"
            aria-labelledby="tab-jinrActivity"
          >
            {editModes.jinrActivity ? (
              <textarea
                className="inline-textarea"
                aria-label="Деятельность в ОИЯИ"
                value={employeeData.jinrActivity}
                onChange={(event) => updateEmployeeField('jinrActivity', event.target.value)}
                rows={6}
              />
            ) : (
              <p>{employeeData.jinrActivity}</p>
            )}
          </section>
        )}

        {activeTab === 'kazakhstanActivity' && (
          <section
            id="panel-kazakhstanActivity"
            className="tab-content prose"
            role="tabpanel"
            aria-labelledby="tab-kazakhstanActivity"
          >
            {editModes.kazakhstanActivity ? (
              <textarea
                className="inline-textarea"
                aria-label="Деятельность в Казахстане"
                value={employeeData.kazakhstanActivity}
                onChange={(event) => updateEmployeeField('kazakhstanActivity', event.target.value)}
                rows={6}
              />
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

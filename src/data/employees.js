const basePublications = [
  {
    year: 2021,
    title: 'Тайны старого замка',
    authors: 'С. Дум',
    journal: 'Mystery Journal',
    doi: '10.1234/mystery.2021.001'
  },
  {
    year: 2020,
    title: 'Спасение острова',
    authors: 'Б. Панчирз',
    journal: 'Adventure Science',
    doi: '10.1234/adventure.2020.002'
  }
];

function buildEmployee(data) {
  return {
    ...data,
    academicDegree: {
      degree: data.academicDegree.degree,
      year: data.academicDegree.year,
      defensePlace: data.academicDegree.defensePlace
    },
    publications: basePublications,
    supervisors: {
      jinr: {
        laboratory: data.supervisors.jinr.laboratory,
        position: data.supervisors.jinr.position,
        email: data.supervisors.jinr.email,
        phone: data.supervisors.jinr.phone
      },
      kazakhstan: {
        laboratory: data.supervisors.kazakhstan.laboratory,
        position: data.supervisors.kazakhstan.position,
        email: data.supervisors.kazakhstan.email,
        phone: data.supervisors.kazakhstan.phone
      }
    }
  };
}

export const employees = [
  buildEmployee({
    id: 'scooby-doo',
    shortName: 'Скуби-Ду',
    fullName: 'Скуби-Ду Скубинович',
    position: 'Старший исследователь тайн',
    email: 'scooby@portal.local',
    phone: '+7 (701) 100-00-01',
    laboratory: 'Лаборатория прикладной криптозоологии',
    birthDate: '1990-02-12',
    scopusId: '572100001',
    wosId: 'AAB-1200-2022',
    orcidId: '0000-0002-1234-5678',
    academicDegree: {
      degree: 'Кандидат физико-математических наук',
      year: '2018',
      defensePlace: 'КазНУ имени аль-Фараби'
    },
    activity: {
      skills: 'Полевая аналитика, сбор доказательств, координация команды.',
      experience: 'Более 10 лет участия в междисциплинарных расследованиях.',
      startDate: '15 марта 2015',
      projects: 'Руководство программой верификации инцидентов по регионам.'
    },
    admin: {
      contractType: 'Трудовой договор, полный рабочий день',
      contractEndDate: '31 декабря 2028'
    },
    jinrActivity: 'Координация работ по интеграции исследовательских протоколов ОИЯИ.',
    kazakhstanActivity: 'Сопровождение внедрения методик в научных организациях Казахстана.',
    supervisors: {
      jinr: {
        laboratory: 'Лаборатория ядерных проблем ОИЯИ',
        position: 'Научный руководитель проекта',
        email: 'jinr.supervisor1@jinr.local',
        phone: '+7 (495) 100-00-01'
      },
      kazakhstan: {
        laboratory: 'Национальная ядерная лаборатория РК',
        position: 'Региональный научный координатор',
        email: 'kz.supervisor1@rk.local',
        phone: '+7 (7172) 100-00-01'
      }
    }
  }),
  buildEmployee({
    id: 'spongebob-squarepants',
    shortName: 'Спанч Боб Квадратные Штаны',
    fullName: 'Спанч Боб Квадратные Штаны',
    position: 'Инженер лабораторных процессов',
    email: 'spongebob@portal.local',
    phone: '+7 (701) 100-00-02',
    laboratory: 'Лаборатория водных технологий',
    birthDate: '1994-07-03',
    scopusId: '572100002',
    wosId: 'AAC-1300-2022',
    orcidId: '0000-0002-2234-5678',
    academicDegree: {
      degree: 'Магистр технических наук',
      year: '2020',
      defensePlace: 'Satbayev University'
    },
    activity: {
      skills: 'Оптимизация процессов, документооборот, контроль качества.',
      experience: '8 лет практической работы в производственных лабораториях.',
      startDate: '1 сентября 2018',
      projects: 'Аудит технологической дисциплины лабораторных циклов.'
    },
    admin: {
      contractType: 'Трудовой договор, полный рабочий день',
      contractEndDate: '31 декабря 2027'
    },
    jinrActivity: 'Поддержка лабораторных процессов в совместных экспериментальных стендах ОИЯИ.',
    kazakhstanActivity: 'Обучение инженерных команд Казахстана процессному контролю.',
    supervisors: {
      jinr: {
        laboratory: 'Лаборатория информационных технологий ОИЯИ',
        position: 'Руководитель инженерной группы',
        email: 'jinr.supervisor2@jinr.local',
        phone: '+7 (495) 100-00-02'
      },
      kazakhstan: {
        laboratory: 'Институт ядерной физики РК',
        position: 'Технический консультант программы',
        email: 'kz.supervisor2@rk.local',
        phone: '+7 (727) 100-00-02'
      }
    }
  }),
  buildEmployee({
    id: 'shrek',
    shortName: 'Шрек',
    fullName: 'Шрек Огрович',
    position: 'Руководитель проектного офиса',
    email: 'shrek@portal.local',
    phone: '+7 (701) 100-00-03',
    laboratory: 'Лаборатория стратегических инициатив',
    birthDate: '1986-11-19',
    scopusId: '572100003',
    wosId: 'AAD-1400-2022',
    orcidId: '0000-0002-3234-5678',
    academicDegree: {
      degree: 'Доктор PhD',
      year: '2014',
      defensePlace: 'НИЯУ МИФИ'
    },
    activity: {
      skills: 'Управление проектами, бюджетирование, межфункциональная координация.',
      experience: '12 лет управления программами организационного развития.',
      startDate: '10 января 2014',
      projects: 'Внедрение единых стандартов реализации внутренних проектов.'
    },
    admin: {
      contractType: 'Контракт руководителя проекта',
      contractEndDate: '30 июня 2029'
    },
    jinrActivity: 'Управление дорожной картой совместных инициатив лабораторий ОИЯИ.',
    kazakhstanActivity: 'Координация программ трансфера практик управления в организации Казахстана.',
    supervisors: {
      jinr: {
        laboratory: 'Лаборатория теоретической физики ОИЯИ',
        position: 'Директор направления',
        email: 'jinr.supervisor3@jinr.local',
        phone: '+7 (495) 100-00-03'
      },
      kazakhstan: {
        laboratory: 'Казахстанский центр ядерных технологий',
        position: 'Руководитель партнерских программ',
        email: 'kz.supervisor3@rk.local',
        phone: '+7 (7172) 100-00-03'
      }
    }
  }),
  buildEmployee({
    id: 'pikachu',
    shortName: 'Пикачу',
    fullName: 'Пикачу Электрович',
    position: 'Научный сотрудник по данным',
    email: 'pikachu@portal.local',
    phone: '+7 (701) 100-00-04',
    laboratory: 'Лаборатория цифровой аналитики',
    birthDate: '1998-04-28',
    scopusId: '572100004',
    wosId: 'AAE-1500-2022',
    orcidId: '0000-0002-4234-5678',
    academicDegree: {
      degree: 'Магистр компьютерных наук',
      year: '2022',
      defensePlace: 'Astana IT University'
    },
    activity: {
      skills: 'Анализ данных, визуализация, валидация источников.',
      experience: '6 лет участия в аналитических и статистических проектах.',
      startDate: '12 апреля 2020',
      projects: 'Разработка дашбордов для оперативного мониторинга KPI.'
    },
    admin: {
      contractType: 'Срочный трудовой договор',
      contractEndDate: '1 февраля 2028'
    },
    jinrActivity: 'Разработка аналитических пайплайнов для исследовательских данных ОИЯИ.',
    kazakhstanActivity: 'Внедрение инструментов мониторинга показателей в лабораториях Казахстана.',
    supervisors: {
      jinr: {
        laboratory: 'Лаборатория вычислительной физики ОИЯИ',
        position: 'Ведущий научный сотрудник',
        email: 'jinr.supervisor4@jinr.local',
        phone: '+7 (495) 100-00-04'
      },
      kazakhstan: {
        laboratory: 'Центр научных данных РК',
        position: 'Куратор аналитического трека',
        email: 'kz.supervisor4@rk.local',
        phone: '+7 (727) 100-00-04'
      }
    }
  }),
  buildEmployee({
    id: 'homer-simpson',
    shortName: 'Гомер Симпсон',
    fullName: 'Гомер Джей Симпсон',
    position: 'Специалист по операционной поддержке',
    email: 'homer@portal.local',
    phone: '+7 (701) 100-00-05',
    laboratory: 'Лаборатория производственной безопасности',
    birthDate: '1988-09-09',
    scopusId: '572100005',
    wosId: 'AAF-1600-2022',
    orcidId: '0000-0002-5234-5678',
    academicDegree: {
      degree: 'Кандидат технических наук',
      year: '2016',
      defensePlace: 'Карагандинский технический университет'
    },
    activity: {
      skills: 'Регламентные процедуры, контроль исполнения, отчетность.',
      experience: '9 лет операционного сопровождения лабораторных площадок.',
      startDate: '20 ноября 2016',
      projects: 'Сопровождение программы по улучшению производственной дисциплины.'
    },
    admin: {
      contractType: 'Трудовой договор, сменный график',
      contractEndDate: '31 августа 2027'
    },
    jinrActivity: 'Организация операционной поддержки инфраструктуры исследовательских объектов ОИЯИ.',
    kazakhstanActivity: 'Консалтинг по производственной безопасности для лабораторных площадок Казахстана.',
    supervisors: {
      jinr: {
        laboratory: 'Лаборатория радиационной безопасности ОИЯИ',
        position: 'Начальник операционной службы',
        email: 'jinr.supervisor5@jinr.local',
        phone: '+7 (495) 100-00-05'
      },
      kazakhstan: {
        laboratory: 'Национальный центр безопасности РК',
        position: 'Главный эксперт направления',
        email: 'kz.supervisor5@rk.local',
        phone: '+7 (7172) 100-00-05'
      }
    }
  }),
  buildEmployee({
    id: 'donald-duck',
    shortName: 'Дональд Дак',
    fullName: 'Дональд Фаунтлерой Дак',
    position: 'Эксперт по международным программам',
    email: 'donald@portal.local',
    phone: '+7 (701) 100-00-06',
    laboratory: 'Лаборатория международного сотрудничества',
    birthDate: '1987-01-25',
    scopusId: '572100006',
    wosId: 'AAG-1700-2022',
    orcidId: '0000-0002-6234-5678',
    academicDegree: {
      degree: 'Доктор политических наук',
      year: '2013',
      defensePlace: 'МГИМО'
    },
    activity: {
      skills: 'Международные коммуникации, договорная работа, аналитика рисков.',
      experience: '11 лет сопровождения международных исследовательских инициатив.',
      startDate: '5 мая 2013',
      projects: 'Координация двусторонних программ с зарубежными партнерами.'
    },
    admin: {
      contractType: 'Трудовой договор, полный рабочий день',
      contractEndDate: '31 декабря 2029'
    },
    jinrActivity: 'Координация внешних соглашений ОИЯИ с международными научными центрами.',
    kazakhstanActivity: 'Сопровождение межгосударственных программ научного сотрудничества с Казахстаном.',
    supervisors: {
      jinr: {
        laboratory: 'Управление международных связей ОИЯИ',
        position: 'Заместитель руководителя управления',
        email: 'jinr.supervisor6@jinr.local',
        phone: '+7 (495) 100-00-06'
      },
      kazakhstan: {
        laboratory: 'Министерство науки и высшего образования РК',
        position: 'Координатор международных научных проектов',
        email: 'kz.supervisor6@rk.local',
        phone: '+7 (7172) 100-00-06'
      }
    }
  })
];

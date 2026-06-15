function valueOrDash(value) {
  return value || '—';
}

export function buildCvMarkdown(employee) {
  return `# CV: ${employee.fullName}

## Основная информация
- **ФИО:** ${valueOrDash(employee.fullName)}
- **Должность:** ${valueOrDash(employee.position)}
- **Лаборатория:** ${valueOrDash(employee.laboratory)}
- **Дата рождения:** ${valueOrDash(employee.birthDate)}
- **Email:** ${valueOrDash(employee.email)}
- **Телефон:** ${valueOrDash(employee.phone)}

## Научные профили
- **Scopus ID:** ${valueOrDash(employee.scopusId)}
- **Web of Science ID:** ${valueOrDash(employee.wosId)}
- **ORCID ID:** ${valueOrDash(employee.orcidId)}

## Научная квалификация
- **Ученая степень:** ${valueOrDash(employee.academicDegree?.degree)}
- **Год получения степени:** ${valueOrDash(employee.academicDegree?.year)}
- **Место защиты:** ${valueOrDash(employee.academicDegree?.defensePlace)}

## Сфера деятельности
- **Навыки:** ${valueOrDash(employee.activity?.skills)}
- **Опыт работы:** ${valueOrDash(employee.activity?.experience)}
- **Дата начала работы:** ${valueOrDash(employee.activity?.startDate)}
- **Проекты / зоны ответственности:** ${valueOrDash(employee.activity?.projects)}

## Деятельность в ОИЯИ
${valueOrDash(employee.jinrActivity)}

## Деятельность в Казахстане
${valueOrDash(employee.kazakhstanActivity)}

## Руководитель в ОИЯИ
- **Лаборатория:** ${valueOrDash(employee.supervisors?.jinr?.laboratory)}
- **Должность:** ${valueOrDash(employee.supervisors?.jinr?.position)}
- **Email:** ${valueOrDash(employee.supervisors?.jinr?.email)}
- **Телефон:** ${valueOrDash(employee.supervisors?.jinr?.phone)}

## Руководитель в Казахстане
- **Лаборатория:** ${valueOrDash(employee.supervisors?.kazakhstan?.laboratory)}
- **Должность:** ${valueOrDash(employee.supervisors?.kazakhstan?.position)}
- **Email:** ${valueOrDash(employee.supervisors?.kazakhstan?.email)}
- **Телефон:** ${valueOrDash(employee.supervisors?.kazakhstan?.phone)}
`;
}

export function downloadTextFile({ content, fileName, type = 'text/plain;charset=utf-8' }) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadEmployeeCv(employee) {
  downloadTextFile({
    content: buildCvMarkdown(employee),
    fileName: `${employee.id}-cv.md`,
    type: 'text/markdown;charset=utf-8'
  });
}

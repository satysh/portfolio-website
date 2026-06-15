export function normalizeSearchValue(value) {
  return String(value ?? '').trim().toLocaleLowerCase('ru-RU');
}

export function getContractEndYear(contractEndDate) {
  const match = String(contractEndDate ?? '').match(/\d{4}/);
  return match ? match[0] : '';
}

export function hasActiveFilters(filters) {
  return Object.values(filters).some((value) => String(value ?? '').trim() !== '');
}

export function employeeMatchesFilters(employee, filters) {
  const fullName = normalizeSearchValue(employee.fullName);
  const position = normalizeSearchValue(employee.position);
  const laboratory = normalizeSearchValue(employee.laboratory);
  const contractEndYear = getContractEndYear(employee.admin?.contractEndDate);

  return (
    fullName.includes(normalizeSearchValue(filters.fullName)) &&
    position.includes(normalizeSearchValue(filters.position)) &&
    laboratory.includes(normalizeSearchValue(filters.laboratory)) &&
    contractEndYear.includes(String(filters.contractEndYear ?? '').trim())
  );
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (isoDate) {
    const [, year, month, day] = isoDate;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function calculateAge(birthDate, referenceDate = new Date()) {
  const dateOfBirth = parseDate(birthDate);

  if (!dateOfBirth) {
    return null;
  }

  let age = referenceDate.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = referenceDate.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < dateOfBirth.getDate())) {
    age -= 1;
  }

  return age;
}

export function formatDate(value) {
  const date = parseDate(value);

  if (!date) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function buildProfileLink(type, id) {
  const trimmedId = String(id ?? '').trim();

  if (!trimmedId) {
    return null;
  }

  if (type === 'scopus') {
    return `https://www.scopus.com/authid/detail.uri?authorId=${encodeURIComponent(trimmedId)}`;
  }

  if (type === 'wos') {
    return `https://www.webofscience.com/wos/author/record/${encodeURIComponent(trimmedId)}`;
  }

  return `https://orcid.org/${encodeURIComponent(trimmedId)}`;
}

export function buildMailTo(email) {
  const value = String(email ?? '').trim();
  return value ? `mailto:${value}` : null;
}

export function buildTelLink(phone) {
  const value = String(phone ?? '').replace(/[^\d+]/g, '');
  return value ? `tel:${value}` : null;
}

export function getInitials(fullName) {
  const initials = String(fullName ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('ru-RU');

  return initials || '—';
}

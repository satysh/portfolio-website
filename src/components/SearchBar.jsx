import { hasActiveFilters } from '../utils/employees';

function SearchBar({ filters, resultCount, totalCount, onFilterChange, onReset }) {
  const inputs = [
    { key: 'fullName', label: 'ФИО', autoComplete: 'name' },
    { key: 'position', label: 'Должность', autoComplete: 'organization-title' },
    { key: 'laboratory', label: 'Лаборатория', autoComplete: 'organization' },
    { key: 'contractEndYear', label: 'Год окончания контракта', inputMode: 'numeric', maxLength: 4 }
  ];
  const filtersActive = hasActiveFilters(filters);

  return (
    <section className="search-panel" aria-label="Поиск сотрудников">
      <div className="section-heading">
        <div>
          <h1>Сотрудники</h1>
          <p>{resultCount} из {totalCount}</p>
        </div>
      </div>

      <form className="search-grid" onSubmit={(event) => event.preventDefault()}>
        {inputs.map((item) => (
          <label key={item.key} className="search-field">
            <span>{item.label}</span>
            <input
              type="text"
              value={filters[item.key]}
              inputMode={item.inputMode}
              maxLength={item.maxLength}
              autoComplete={item.autoComplete}
              onChange={(event) => onFilterChange(item.key, event.target.value)}
              placeholder={`Введите ${item.label.toLowerCase()}`}
            />
          </label>
        ))}
        <button
          type="button"
          className="secondary-button"
          disabled={!filtersActive}
          onClick={onReset}
        >
          Сбросить
        </button>
      </form>
    </section>
  );
}

export default SearchBar;

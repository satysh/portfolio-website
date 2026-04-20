function SearchBar({ filters, onFilterChange }) {
  const inputs = [
    { key: 'fullName', label: 'ФИО' },
    { key: 'position', label: 'Должность' },
    { key: 'laboratory', label: 'Лаборатория' },
    { key: 'contractEndYear', label: 'Год окончания контракта' }
  ];

  return (
    <section className="search-panel" aria-label="Поиск сотрудников">
      <div className="search-grid">
        {inputs.map((item) => (
          <label key={item.key} className="search-field">
            <span>{item.label}</span>
            <input
              type="text"
              value={filters[item.key]}
              onChange={(event) => onFilterChange(item.key, event.target.value)}
              placeholder={`Введите ${item.label.toLowerCase()}`}
            />
          </label>
        ))}
        <button type="button" className="search-button">
          Найти
        </button>
      </div>
    </section>
  );
}

export default SearchBar;

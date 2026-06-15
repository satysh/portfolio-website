import { useMemo, useState } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import EmployeeTable from '../components/EmployeeTable';
import { employees } from '../data/employees';
import { employeeMatchesFilters } from '../utils/employees';

const defaultFilters = {
  fullName: '',
  position: '',
  laboratory: '',
  contractEndYear: ''
};

function HomePage() {
  const [filters, setFilters] = useState(defaultFilters);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => employeeMatchesFilters(employee, filters));
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <div className="page">
      <Header />
      <main className="content">
        <SearchBar
          filters={filters}
          resultCount={filteredEmployees.length}
          totalCount={employees.length}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
        <EmployeeTable employees={filteredEmployees} />
      </main>
    </div>
  );
}

export default HomePage;

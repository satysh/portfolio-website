import { useMemo, useState } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import EmployeeTable from '../components/EmployeeTable';
import { employees } from '../data/employees';

const defaultFilters = {
  fullName: '',
  position: '',
  laboratory: '',
  contractEndYear: ''
};

function getContractEndYear(contractEndDate) {
  const match = contractEndDate.match(/\d{4}/);
  return match ? match[0] : '';
}

function HomePage() {
  const [filters, setFilters] = useState(defaultFilters);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const contractEndYear = getContractEndYear(employee.admin.contractEndDate);

      return (
        employee.fullName.toLowerCase().includes(filters.fullName.toLowerCase()) &&
        employee.position.toLowerCase().includes(filters.position.toLowerCase()) &&
        employee.laboratory.toLowerCase().includes(filters.laboratory.toLowerCase()) &&
        contractEndYear.includes(filters.contractEndYear.trim())
      );
    });
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="page">
      <Header />
      <main className="content">
        <SearchBar filters={filters} onFilterChange={handleFilterChange} />
        <EmployeeTable employees={filteredEmployees} />
      </main>
    </div>
  );
}

export default HomePage;

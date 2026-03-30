import { useMemo, useState } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import EmployeeTable from '../components/EmployeeTable';
import { employees } from '../data/employees';

const defaultFilters = {
  fullName: '',
  position: '',
  email: '',
  phone: ''
};

function HomePage() {
  const [filters, setFilters] = useState(defaultFilters);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      return (
        employee.fullName.toLowerCase().includes(filters.fullName.toLowerCase()) &&
        employee.position.toLowerCase().includes(filters.position.toLowerCase()) &&
        employee.email.toLowerCase().includes(filters.email.toLowerCase()) &&
        employee.phone.toLowerCase().includes(filters.phone.toLowerCase())
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

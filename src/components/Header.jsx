import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <Link to="/" className="header-home-link" aria-label="Перейти на главную страницу">
        <div className="logo" aria-hidden="true">
          IN
        </div>
        <div className="org-name">Внутренний портал сотрудников</div>
      </Link>
    </header>
  );
}

export default Header;

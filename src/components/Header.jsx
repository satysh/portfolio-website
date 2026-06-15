import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <Link to="/" className="header-home-link" aria-label="Перейти на главную страницу">
        <div className="brand-mark" aria-hidden="true">
          ПС
        </div>
        <div>
          <div className="org-name">Портал сотрудников</div>
          <div className="org-caption">Научные профили и контакты</div>
        </div>
      </Link>
    </header>
  );
}

export default Header;

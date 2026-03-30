function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="tabs-wrap" role="tablist" aria-label="Разделы сотрудника">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={activeTab === tab.id ? 'tab-button active' : 'tab-button'}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default Tabs;

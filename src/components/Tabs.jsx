function Tabs({ tabs, activeTab, onTabChange }) {
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  const selectTab = (index) => {
    const tab = tabs[index];

    if (!tab) {
      return;
    }

    onTabChange(tab.id);
    requestAnimationFrame(() => {
      document.getElementById(`tab-${tab.id}`)?.focus();
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectTab((activeIndex + 1) % tabs.length);
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectTab((activeIndex - 1 + tabs.length) % tabs.length);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      selectTab(0);
    }

    if (event.key === 'End') {
      event.preventDefault();
      selectTab(tabs.length - 1);
    }
  };

  return (
    <div className="tabs-wrap" role="tablist" aria-label="Разделы сотрудника">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          className={activeTab === tab.id ? 'tab-button active' : 'tab-button'}
          onClick={() => onTabChange(tab.id)}
          onKeyDown={handleKeyDown}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default Tabs;

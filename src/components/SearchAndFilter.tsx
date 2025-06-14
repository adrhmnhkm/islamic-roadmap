import React, { useState, useEffect } from 'react';

interface Resource {
  title: string;
  author: string;
  description: string;
  type: string;
  language: string;
  level?: string;
}

interface SearchAndFilterProps {
  resources: Resource[];
}

interface FilterOptions {
  language: string[];
  level: string[];
  type: string[];
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ resources }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    language: [],
    level: [],
    type: []
  });

  useEffect(() => {
    filterResources();
  }, [searchQuery, filters]);

  const filterResources = () => {
    const resourceElements = document.querySelectorAll('[data-resource]');
    resourceElements.forEach(resourceElement => {
      const resourceData = resourceElement.getAttribute('data-resource');
      if (!resourceData) return;
      
      const resource = JSON.parse(resourceData);
      const searchText = `${resource.title} ${resource.author} ${resource.description}`.toLowerCase();
      const matchesSearch = searchQuery === '' || searchText.includes(searchQuery.toLowerCase());
      
      let matchesFilters = true;
      if (filters.language.length > 0) {
        matchesFilters = matchesFilters && filters.language.includes(resource.language);
      }
      if (filters.level.length > 0) {
        matchesFilters = matchesFilters && filters.level.includes(resource.level);
      }
      if (filters.type.length > 0) {
        matchesFilters = matchesFilters && filters.type.includes(resource.type);
      }

      (resourceElement as HTMLElement).style.display = matchesSearch && matchesFilters ? '' : 'none';
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (category: keyof FilterOptions, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[category].includes(value)) {
        newFilters[category] = newFilters[category].filter(v => v !== value);
      } else {
        newFilters[category] = [...newFilters[category], value];
      }
      return newFilters;
    });
  };

  // Get unique values for filters
  const languages = Array.from(new Set(resources.map(r => r.language)));
  const levels = Array.from(new Set(resources.filter(r => r.level).map(r => r.level as string)));
  const types = Array.from(new Set(resources.map(r => r.type)));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="mb-6">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Cari Sumber Belajar
        </label>
        <input
          type="text"
          id="search"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Cari berdasarkan judul, penulis, atau deskripsi..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Bahasa</h4>
          <div className="space-y-2">
            {languages.map(lang => (
              <label key={lang} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.language.includes(lang)}
                  onChange={() => handleFilterChange('language', lang)}
                  className="rounded text-accent focus:ring-accent mr-2"
                />
                <span className="text-sm text-gray-600">{lang}</span>
              </label>
            ))}
          </div>
        </div>

        {levels.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tingkat</h4>
            <div className="space-y-2">
              {levels.map(level => (
                <label key={level} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.level.includes(level)}
                    onChange={() => handleFilterChange('level', level)}
                    className="rounded text-accent focus:ring-accent mr-2"
                  />
                  <span className="text-sm text-gray-600">{level}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Jenis</h4>
          <div className="space-y-2">
            {types.map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.type.includes(type)}
                  onChange={() => handleFilterChange('type', type)}
                  className="rounded text-accent focus:ring-accent mr-2"
                />
                <span className="text-sm text-gray-600">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
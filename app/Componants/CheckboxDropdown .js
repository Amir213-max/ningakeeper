'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from '@heroicons/react/20/solid';
import { useTranslation } from '../contexts/TranslationContext';

export default function FilterDropdown({ attributeValues, onFilterChange }) {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [showMore, setShowMore] = useState(false);
  const {t} = useTranslation();
  const toggleOption = (attribute, value) => {
    setSelectedFilters((prev) => {
      const current = prev[attribute] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      const newFilters = {
        ...prev,
        [attribute]: updated,
      };

      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const visibleFilters = attributeValues.slice(0, 4);
  const hiddenFilters = attributeValues.slice(4);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[...visibleFilters, ...(showMore ? hiddenFilters : [])].map(
          ({ attribute, values }) => (
            <Dropdown
              key={attribute}
              attribute={attribute}
              values={values}
              selected={selectedFilters[attribute] || []}
              onConfirm={(newSelected) => {
                const newFilters = {
                  ...selectedFilters,
                  [attribute]: newSelected,
                };
                setSelectedFilters(newFilters);
                onFilterChange(newFilters);
              }}
            />
          )
        )}
      </div>

      {hiddenFilters.length > 0 && (

        <div>
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded hover:bg-gray-200 duration-150 cursor-pointer transition"
          >
            {showMore ? (
              <>
                <ChevronUpIcon className="w-4 h-4 mr-1" />
               {t('More Filters')}
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4 mr-1" />
               {t('More Filters')}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function Dropdown({ attribute, values, selected, onConfirm }) {
  const {t} = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState(selected);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setTempSelected(selected);
  }, [selected]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setTempSelected(selected);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, selected]);

  const toggleTempOption = (value) => {
    setTempSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const confirm = () => {
    onConfirm(tempSelected);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full sm:w-64 md:w-48" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center cursor-pointer px-3 py-2 text-sm text-neutral-700 font-medium bg-white border border-gray-300 rounded shadow hover:bg-gray-50 focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{attribute} {selected.length > 0 && `(${selected.length})`}</span>
        <ChevronDownIcon
          className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
        `}
        style={{ transformOrigin: 'top center' }}
      >
        <div className="p-3 space-y-2 text-gray-800 text-sm">
          {values.map((value) => (
            <label
              key={value}
              className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded-md px-2 py-1"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={tempSelected.includes(value)}
                  onChange={() => toggleTempOption(value)}
                  className="accent-blue-600"
                />
                <span>{value}</span>
              </div>
              {tempSelected.includes(value) && <CheckIcon className="w-4 h-4 text-blue-600" />}
            </label>
          ))}

          <div className="flex justify-end mt-4">
            <button
              onClick={confirm}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
             { t("Done ✔")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

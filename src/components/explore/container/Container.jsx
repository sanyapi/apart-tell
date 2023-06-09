import React, { useState, useEffect } from 'react';
import Checklist from '../checklist/Checklist';
import Listing from '../listing/Listing';
import './container.scss';

const Container = ({ isLoaded, type }) => {
  const [containerClass, setContainerClass] = useState('main-container');

  const updateContainerClass = (isDropdownVisible) => {
    const newContainerClass =
      isDropdownVisible && window.innerWidth <= 1000
        ? 'main-container filtered'
        : 'main-container';
    setContainerClass(newContainerClass);
  };

  const [filterValues, setFilterValues] = useState({
    selectedOption: 'Select a type',
    rentalFeeRoom: {},
    rentalFeeHead: {},
    amenities: {},
    crType: {},
    occupants: {},
    nearby: {},
    additional: {}
  });

  const updateFilters = (newFilters) => {
    setFilterValues(newFilters);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1000) {
        setContainerClass('main-container');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <div className="explore-page-container">
        <div className={containerClass}>
          <Checklist
            updateContainerClass={updateContainerClass}
            updateFilters={updateFilters}
            isLoaded={isLoaded}
            type={type}
          />
          <div className="headline-listing-section">
            <Listing
              isLoaded={isLoaded}
              type={type}
              filterValues={filterValues}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Container;

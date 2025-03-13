import React, { createContext, useState } from 'react';

export const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [isCustomer, setIsCustomer] = useState(false);
  return (
    <CustomerContext.Provider value={{ isCustomer, setIsCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
};
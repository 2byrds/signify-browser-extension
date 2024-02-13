import React, { useState } from "react";
import styled from "styled-components";

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
  z-index: 50;
`;

const DropdownButton = styled.button`
  padding: 10px;
  border: none;
  cursor: pointer;
  width: 100%;
  border-radius: 4px;
  color: ${({ theme }) => theme?.colors?.bodyColor};
  background: ${({ theme }) => theme?.colors?.bodyBg};
  border: ${({ theme }) => `1px solid ${theme?.colors?.bodyBorder}`};
`;

const DropdownList = styled.ul`
  width: 100%;
  position: absolute;
  top: 100%;
  left: 0;
  list-style: none;
  padding: 0;
  margin: 0;
  background: ${({ theme }) => theme?.colors?.bodyBg};
  color: ${({ theme }) => theme?.colors?.bodyColor};
  border: ${({ theme }) => `1px solid ${theme?.colors?.bodyBorder}`};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const DropdownItem = styled.li`
  padding: 10px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme?.colors?.secondary};
    color: ${({ theme }) => theme?.colors?.subtext};
  }
`;

export const Dropdown = ({ selectedOption, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDropdownClick = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setIsOpen(false);
    onSelect(option);
  };

  return (
    <DropdownWrapper>
      <DropdownButton onClick={handleDropdownClick}>
        {selectedOption?.label}
      </DropdownButton>
      {isOpen && (
        <DropdownList>
          {options.map((option) => (
            <DropdownItem
              key={option?.value}
              onClick={() => handleOptionClick(option)}
            >
              {option?.label}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </DropdownWrapper>
  );
};

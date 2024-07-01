import React from 'react';

interface ButtonProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, disabled, onClick }) => {
  return (
    <button className="stack-button" disabled={disabled} onClick={onClick}>
      {label}
    </button>
  );
};

export default Button;

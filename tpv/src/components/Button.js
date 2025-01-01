import React from 'react';

const Button = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);

export default Button;

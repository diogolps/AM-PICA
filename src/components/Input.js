import React from "react";

const Input = ({ label, type, name, register, required }) => {
  return (
    <div>
      <label>{label}</label>
      <input type={type} name={name} {...register(name, { required })} />
    </div>
  );
};

export default Input;

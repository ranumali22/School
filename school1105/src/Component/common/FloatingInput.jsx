import React from "react";

const labelClasses = " absolute left-3 -top-2 bg-white px-1 text-[12px] font-medium text-slate-700 transition-all peer-placeholder-shown:-top-3 peer-placeholder-shown:text-slate-700 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2 peer-focus:text-[12px] peer-focus:font-medium peer-focus:text-slate-700";

const Label = ({ label, required }) => (
  <span className="flex items-center gap-0.5">
    {label}
    {required && typeof label === "string" && <span className="text-red-500 ml-0.5 text-[10px]">*</span>}
  </span>
);

export const FloatingInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  error = "",
  className = "",
  placeholder = " ",
  required = false,
}) => {
  return (
    <div className="relative w-full">
      <input
        id={name}
        name={name}
        type={type}
        {...(type !== "file" ? { value: value || "" } : {})}
        onChange={onChange}
        placeholder={placeholder}
        className={`peer w-full border capitalize rounded-xl px-4 py-3 text-sm text-slate-900 outline-none transition-all
        ${error ? "border-red-500" : "border-slate-300"}
        ${error ? "focus:border-red-500" : "focus:border-[#0860C4] focus:ring-2 focus:ring-blue-500/10"}
        ${className}`}
      />
      <label htmlFor={name} className={`${labelClasses} ${error ? "text-red-500 peer-focus:text-red-500" : ""}`}>
        <Label label={label} required={required} />
      </label>
    </div>
  );
};

export const FloatingInputs = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  className = "",
  placeholder = " ",
  required = false,
  ...props
}) => {
  return (
    <div className="relative w-full">
      <input
        id={name}
        name={name}
        type={type}
        {...(type !== "file" ? { value: value || "" } : {})}
        onChange={onChange}
        placeholder={placeholder}
        className={`peer w-full border rounded-xl px-4 capitalize py-3 text-sm text-slate-900 outline-none transition-all border-slate-300 focus:border-[#0860C4] focus:ring-2 focus:ring-blue-500/10 ${className}`}
        {...props}
      />
      <label htmlFor={name} className={labelClasses}>
        <Label label={label} required={required} />
      </label>
    </div>
  );
};

export const FloatingSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error = "",
  className = "",
  required = false,
}) => {
  return (
    <div className="relative w-full">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className={`peer w-full border capitalize rounded-xl px-4 py-3 text-sm text-slate-900 outline-none transition-all
        ${error ? "border-red-500" : "border-slate-300"}
        ${error ? "focus:border-red-500" : "focus:border-[#0860C4] focus:ring-2 focus:ring-blue-500/10"}
        ${className}`}
      >
        <option value="" disabled hidden></option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <label htmlFor={name} className={`${labelClasses} ${error ? "text-red-500 peer-focus:text-red-500" : ""}`}>
        <Label label={label} required={required} />
      </label>
    </div>
  );
};

export const FloatingSelects = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error = "",
  className = "",
  required = false,
}) => {
  return (
    <div className="relative w-full">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className={`peer w-full border capitalize rounded-xl px-4 py-3 text-sm text-slate-900 outline-none transition-all
        ${error ? "border-red-500" : "border-slate-300"}
        ${error ? "focus:border-red-500" : "focus:border-[#0860C4] focus:ring-2 focus:ring-blue-500/10"}
        ${className}`}
      >
        <option value="" disabled hidden></option>
        {options.map((opt, i) => (
          <option key={i} value={typeof opt === "object" ? opt.value : opt}>
            {typeof opt === "object" ? opt.label : opt}
          </option>
        ))}
      </select>
      <label htmlFor={name} className={`${labelClasses} ${error ? "text-red-500 peer-focus:text-red-500" : ""}`}>
        <Label label={label} required={required} />
      </label>
    </div>
  );
};

export const FloatingSelectR = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error = "",
  className = "",
  required = false,
}) => {
  return (
    <div className="relative w-full">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className={`peer w-full border capitalize rounded-xl px-4 py-3 text-sm text-black outline-none transition-all
        ${error ? "border-red-500" : "border-slate-300"}
        ${error ? "focus:border-red-500" : "focus:border-[#0860C4] focus:ring-2 focus:ring-blue-500/10"}
        ${className}`}
      >
        <option value="" disabled hidden></option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <label htmlFor={name} className={`${labelClasses} ${error ? "text-red-500 peer-focus:text-red-500" : ""}`}>
        <Label label={label} required={required} />
      </label>
    </div>
  );
};

export const ClassSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error = "",
  className = "",
  required = false,
}) => {
  return (
    <div className="relative w-full">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className={`peer w-full border capitalize rounded-xl px-4 py-3 text-sm text-black outline-none transition-all
        ${error ? "border-red-500" : "border-slate-300"}
        ${error ? "focus:border-red-500" : "focus:border-[#0860C4] focus:ring-2 focus:ring-blue-500/10"}
        ${className}`}
      >
        {options.map((opt, index) => (
          <option key={index} value={typeof opt === "object" ? opt.value : opt}>
            {typeof opt === "object" ? opt.label : opt}
          </option>
        ))}
      </select>
      <label htmlFor={name} className={`${labelClasses} ${error ? "text-red-500 peer-focus:text-red-500" : ""}`}>
        <Label label={label} required={required} />
      </label>
    </div>
  );
};

export const FloatingTextarea = ({
  label,
  name,
  value,
  onChange,
  error = "",
  className = "",
  required = false,
}) => {
  return (
    <div className="relative w-full">
      <textarea
        id={name}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder=" "
        className={`peer w-full border capitalize rounded-xl px-4 py-3 text-sm text-black outline-none transition-all
        ${error ? "border-red-500" : "border-slate-300"}
        ${error ? "focus:border-red-500" : "focus:border-[#0860C4] focus:ring-2 focus:ring-blue-500/10"}
        ${className}`}
      />
      <label htmlFor={name} className={`${labelClasses} ${error ? "text-red-500 peer-focus:text-red-500" : ""}`}>
        <Label label={label} required={required} />
      </label>
    </div>
  );
};

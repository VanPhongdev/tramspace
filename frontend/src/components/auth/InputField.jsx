import { useState } from 'react';

/**
 * InputField — component input tái sử dụng cho trang Auth.
 *
 * Props:
 *  - id        : string (required)
 *  - label     : string
 *  - type      : 'text' | 'email' | 'password' | 'date' (default: 'text')
 *  - placeholder: string
 *  - icon      : string  — tên Material Symbol (vd: 'mail', 'lock')
 *  - variant   : 'login' | 'register' (ảnh hưởng màu nền input)
 *  - value, onChange, required, ...rest
 */
export default function InputField({
  id,
  label,
  type = 'text',
  placeholder,
  icon,
  variant = 'login',
  value,
  onChange,
  required = false,
  ...rest
}) {
  const [focused, setFocused] = useState(false);

  const inputClass = [
    'input-field',
    icon ? 'has-icon-left' : '',
    variant === 'register' ? 'register-input' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className={focused ? 'focused' : ''}>
          {label}
        </label>
      )}

      <div className="input-wrapper">
        {icon && (
          <span className="material-symbols-outlined input-icon">{icon}</span>
        )}

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={inputClass}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
      </div>
    </div>
  );
}

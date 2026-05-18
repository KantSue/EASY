// src/components/FormField.tsx
interface FormFieldProps {
  label      : string;
  value      : string;
  onChange   : (v: string) => void;
  type?      : string;
  placeholder?: string;
  icon?      : React.ReactNode;
  disabled?  : boolean;
  required?  : boolean;
}

export default function FormField({
  label, value, onChange, type = 'text',
  placeholder = '', icon, disabled = false, required = false
}: FormFieldProps) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="input-wrap">
        {icon && <span className="mi input-icon">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={icon ? 'input' : 'input no-icon'}
          style={{ paddingLeft: icon ? undefined : 14 }}
        />
      </div>
     
    </div>
  );
}
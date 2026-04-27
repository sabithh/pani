import { useId } from 'react';

export function Input({
  label,
  type = 'text',
  className = '',
  containerClassName = '',
  ...rest
}) {
  const id = useId();
  return (
    <div className={['input-group', containerClassName].join(' ')}>
      <input id={id} type={type} placeholder=" " className={className} {...rest} />
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  );
}

export function Textarea({ label, className = '', containerClassName = '', ...rest }) {
  const id = useId();
  return (
    <div className={['input-group', containerClassName].join(' ')}>
      <textarea id={id} placeholder=" " className={className} {...rest} />
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  );
}

export function Select({ label, children, className = '', containerClassName = '', ...rest }) {
  const id = useId();
  return (
    <div className={['input-group filled', containerClassName].join(' ')}>
      <select id={id} className={className} {...rest}>
        {children}
      </select>
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  );
}

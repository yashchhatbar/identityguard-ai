import { Loader2 } from 'lucide-react';

export default function AuthForm({
    title,
    subtitle,
    fields,
    values,
    onChange,
    onSubmit,
    loading,
    actionLabel,
    footer,
}) {
    return (
        <div className="surface-card w-full max-w-xl p-8 sm:p-10">
            <div className="mb-8">
                <p className="section-label">Secure account access</p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
                <p className="mt-3 text-base leading-7 text-slate-600">{subtitle}</p>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
                {fields.map((field) => (
                    <label key={field.name} className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</span>
                        <input
                            type={field.type}
                            name={field.name}
                            value={values[field.name] || ''}
                            onChange={onChange}
                            placeholder={field.placeholder}
                            className="input-field"
                            required
                        />
                    </label>
                ))}
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {loading ? 'Processing...' : actionLabel}
                </button>
            </form>

            {footer ? <div className="mt-6 text-sm text-slate-500">{footer}</div> : null}
        </div>
    );
}

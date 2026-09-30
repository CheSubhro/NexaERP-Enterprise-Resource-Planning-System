import { useEffect, useState } from 'react';

import { getSettings, updateSettings } from '../../lib/api/settings';

import type { Settings, UpdateSettingsRequest } from '../../types/setting';

const emptySettings: Settings = {
    company_name: '',
    logo: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gst_number: '',
    website: '',
    invoice_prefix: 'INV-',
    invoice_footer: '',
    currency: 'INR',
    currency_symbol: '₹',
    date_format: 'DD-MM-YYYY',
    timezone: 'Asia/Kolkata',
    default_low_stock_threshold: 5,
    app_name: 'NexaERP',
    app_logo: '',
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>(emptySettings);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await getSettings();

            setSettings({
                ...emptySettings,
                ...response.data,
            });
        } catch {
            setError('Failed to load settings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleChange = (field: keyof Settings, value: string | number) => {
        setSettings((current) => ({
            ...current,
            [field]: value,
        }));

        setSuccess('');
        setError('');
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const payload: UpdateSettingsRequest = {
                company_name: settings.company_name,
                logo: settings.logo || null,
                email: settings.email || null,
                phone: settings.phone || null,
                address: settings.address || null,
                city: settings.city || null,
                state: settings.state || null,
                pincode: settings.pincode || null,
                gst_number: settings.gst_number || null,
                website: settings.website || null,

                invoice_prefix: settings.invoice_prefix,
                invoice_footer: settings.invoice_footer || null,

                currency: settings.currency,
                currency_symbol: settings.currency_symbol,
                date_format: settings.date_format,
                timezone: settings.timezone,

                default_low_stock_threshold: Number(settings.default_low_stock_threshold),

                app_name: settings.app_name,
                app_logo: settings.app_logo || null,
            };

            const response = await updateSettings(payload);

            setSettings({
                ...emptySettings,
                ...response.data,
            });

            setSuccess(response.message || 'Settings updated successfully.');
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to update settings.';

            setError(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-sm text-gray-500">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

                <p className="mt-1 text-sm text-gray-500">
                    Manage your company, invoice, regional and application settings.
                </p>
            </div>

            {/* Alerts */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Information */}
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Basic information about your business.
                        </p>
                    </div>

                    <div className="grid gap-5 p-6 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Company Name *
                            </label>

                            <input
                                type="text"
                                value={settings.company_name}
                                onChange={(event) =>
                                    handleChange('company_name', event.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Email
                            </label>

                            <input
                                type="email"
                                value={settings.email || ''}
                                onChange={(event) => handleChange('email', event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Phone
                            </label>

                            <input
                                type="text"
                                value={settings.phone || ''}
                                onChange={(event) => handleChange('phone', event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                GST Number
                            </label>

                            <input
                                type="text"
                                value={settings.gst_number || ''}
                                onChange={(event) => handleChange('gst_number', event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Address
                            </label>

                            <textarea
                                value={settings.address || ''}
                                onChange={(event) => handleChange('address', event.target.value)}
                                rows={3}
                                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                City
                            </label>

                            <input
                                type="text"
                                value={settings.city || ''}
                                onChange={(event) => handleChange('city', event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                State
                            </label>

                            <input
                                type="text"
                                value={settings.state || ''}
                                onChange={(event) => handleChange('state', event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Pincode
                            </label>

                            <input
                                type="text"
                                value={settings.pincode || ''}
                                onChange={(event) => handleChange('pincode', event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Website
                            </label>

                            <input
                                type="text"
                                value={settings.website || ''}
                                onChange={(event) => handleChange('website', event.target.value)}
                                placeholder="https://example.com"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </section>

                {/* Invoice Settings */}
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Invoice Settings</h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Configure invoice numbering and footer.
                        </p>
                    </div>

                    <div className="grid gap-5 p-6 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Invoice Prefix *
                            </label>

                            <input
                                type="text"
                                value={settings.invoice_prefix}
                                onChange={(event) =>
                                    handleChange('invoice_prefix', event.target.value)
                                }
                                required
                                placeholder="INV-"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <p className="mt-1 text-xs text-gray-500">Example: INV-0001</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Invoice Footer
                            </label>

                            <textarea
                                value={settings.invoice_footer || ''}
                                onChange={(event) =>
                                    handleChange('invoice_footer', event.target.value)
                                }
                                rows={3}
                                placeholder="Thank you for your business."
                                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </section>

                {/* Regional Settings */}
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Regional Settings</h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Configure currency, date and timezone.
                        </p>
                    </div>

                    <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Currency *
                            </label>

                            <input
                                type="text"
                                value={settings.currency}
                                onChange={(event) => handleChange('currency', event.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Currency Symbol *
                            </label>

                            <input
                                type="text"
                                value={settings.currency_symbol}
                                onChange={(event) =>
                                    handleChange('currency_symbol', event.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Date Format *
                            </label>

                            <select
                                value={settings.date_format}
                                onChange={(event) =>
                                    handleChange('date_format', event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                                <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Timezone *
                            </label>

                            <select
                                value={settings.timezone}
                                onChange={(event) => handleChange('timezone', event.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="Asia/Kolkata">Asia/Kolkata</option>
                                <option value="UTC">UTC</option>
                                <option value="Asia/Dhaka">Asia/Dhaka</option>
                                <option value="Asia/Dubai">Asia/Dubai</option>
                                <option value="Asia/Singapore">Asia/Singapore</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Inventory Settings */}
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Inventory Settings</h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Configure the default inventory threshold.
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="max-w-sm">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Default Low Stock Threshold *
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={settings.default_low_stock_threshold}
                                onChange={(event) =>
                                    handleChange(
                                        'default_low_stock_threshold',
                                        Number(event.target.value),
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <p className="mt-1 text-xs text-gray-500">
                                Products at or below this quantity can be treated as low stock.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Application Settings */}
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Application Settings
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Configure application name and branding.
                        </p>
                    </div>

                    <div className="grid gap-5 p-6 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Application Name *
                            </label>

                            <input
                                type="text"
                                value={settings.app_name}
                                onChange={(event) => handleChange('app_name', event.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                App Logo
                            </label>

                            <input
                                type="text"
                                value={settings.app_logo || ''}
                                onChange={(event) => handleChange('app_logo', event.target.value)}
                                placeholder="Logo URL"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Company Logo
                            </label>

                            <input
                                type="text"
                                value={settings.logo || ''}
                                onChange={(event) => handleChange('logo', event.target.value)}
                                placeholder="Logo URL"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </section>

                {/* Save */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}

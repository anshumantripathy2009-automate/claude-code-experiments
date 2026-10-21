import { getClient, getUser } from '../../../lib/portal';
import { CLIENT_STATUS, formatDate } from '../../../lib/format';
import { PageHeader, Section, StatusBadge } from '../../../components/portal';
import { cardClass } from '../../../components/ui';
import { PasswordForm, ProfileForm } from './AccountForms';

export const metadata = { title: 'Account — NoirFlow Client Portal' };

export default async function AccountPage() {
  const [client, user] = await Promise.all([getClient(), getUser()]);

  const readOnly = [
    ['Business', client.business_name],
    ['Login email', user.email],
    ['Plan', client.plan || 'Not set'],
    ['Client since', formatDate(client.created_at)],
  ];

  return (
    <>
      <PageHeader title="Account" subtitle="Your details and login." />

      <div className={`p-4 sm:p-5 ${cardClass}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Business account</h2>
          <StatusBadge map={CLIENT_STATUS} value={client.status} />
        </div>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {readOnly.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-gray-500 dark:text-neutral-400">{label}</dt>
              <dd className="truncate">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-4">Need to change your business name or plan? Send a request from Support.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-x-6">
        <Section title="Contact details">
          <div className={`p-4 sm:p-5 ${cardClass}`}>
            <ProfileForm client={client} />
          </div>
        </Section>
        <Section title="Change password">
          <div className={`p-4 sm:p-5 ${cardClass}`}>
            <PasswordForm />
          </div>
        </Section>
      </div>
    </>
  );
}

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { LockClosedIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

function FloppySaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 3h9l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm7 2v4h4V7.4L13.6 5H12zm-7 2v12h14v-8h-6a1 1 0 0 1-1-1V5H5zm4 10h6v2H9v-2z" />
    </svg>
  )
}

export function AccountPage() {
  const { user } = useAuth()
  const [name, setName] = useState(
    user ? `${user.firstName} ${user.lastName}`.trim() : '',
  )

  useEffect(() => {
    if (user) {
      setName(`${user.firstName} ${user.lastName}`.trim())
    }
  }, [user])

  return (
   <main className="mx-auto w-full max-w-[1024px] flex-1 px-4 py-8 sm:px-5">
  <div className="overflow-hidden rounded-[20px] border border-[#ece7e2] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">

    {/* TOP BAR */}
    <div className="border-b border-[#f1ece8] bg-[#faf9f8] px-4 py-3 sm:px-6">
      <button
        type="button"
        className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#181818] shadow-sm"
      >
        Account
      </button>
    </div>

    {/* CONTENT */}
    <div className="px-6 py-8 sm:px-10 sm:py-10">

      <h1 className="text-[12px] font-bold tracking-tight text-[#181818]">
        Account
      </h1>

      {/* TOP SECTION */}
      <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">

        {/* FORM */}
        <div className="min-w-0 flex-1 space-y-6">

          <div>
            <label
              className="block text-[11px] font-medium text-[#4b4b4b]"
              htmlFor="email"
            >
              Email:
            </label>

            <input
              id="email"
              type="email"
              disabled
              value={user?.email ?? ''}
              readOnly
              className="mt-2 h-12 w-full max-w-md rounded-xl border border-[#e8e2dc] bg-[#fafafa] px-4 text-sm text-[#7b7b7b] outline-none"
            />
          </div>

          <div className="flex flex-wrap items-end gap-3">

            <div className="min-w-0">
              <label
                className="block text-[11px] font-medium text-[#4b4b4b]"
                htmlFor="name"
              >
                Name:
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 h-12 w-full min-w-[15rem] max-w-md rounded-xl border border-[#e8e2dc] bg-white px-4 text-[11px] text-[#181818] outline-none transition focus:border-[#ff3301]"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const trimmed = name.trim()
                if (!trimmed) {
                  toast.error('Le nom ne peut pas être vide.')
                  return
                }
                toast.info("La mise à jour du profil n'est pas encore disponible.")
              }}
              className="flex h-12 w-12 shrink-0 items-center text-[11px] justify-center rounded-xl bg-[#ff3301] text-white transition hover:bg-[#eb2f00]"
              aria-label="Enregistrer le nom"
            >
              <FloppySaveIcon className="h-5 w-5" />
            </button>

          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex shrink-0  flex-wrap gap-4 lg:flex-nowrap">

          {[
            {
              label: 'Change account email',
              Icon: UserIcon,
            },
            {
              label: 'Change password',
              Icon: LockClosedIcon,
            },
            {
              label: 'Team access list',
              Icon: UserGroupIcon,
            },
          ].map(({ label, Icon }) => (
            <button
              key={label}
              type="button"
              className="flex w-[150px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#ece7e2] bg-[#fcfcfc] px-4 py-5 text-center text-[11px] font-semibold leading-tight text-[#353535] transition hover:border-[#ffd6ca] hover:bg-[#fff7f4]"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff1ec]">
                <Icon className="h-6 w-6 text-[#ff3301]" />
              </div>

              {label}

            </button>
          ))}

        </div>

      </div>

      <hr className="my-10 border-[#f1ece8]" />

      {/* BOTTOM */}
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">

        {/* PLAN */}
        <div className="text-center lg:text-left">

          <p className="text-[11px] text-[#666]">
            Current plan:
          </p>

          <span className="mt-3 inline-flex rounded-full bg-[#fff1ec] px-4 py-2 text-[11px] font-semibold text-[#ff3301]">
            Free Plan
          </span>

          <button
            type="button"
            className="mt-4 block text-[11px] font-medium text-[#ff3301] transition hover:text-[#eb2f00] hover:underline"
          >
            View plans
          </button>

        </div>

        {/* STORAGE */}
        <div className="flex items-center justify-center gap-5">

          <div className="relative h-[7.5rem] w-[7.5rem] shrink-0">

            <svg
              viewBox="0 0 36 36"
              className="h-full w-full -rotate-90"
            >

              <path
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#ececec"
                strokeWidth="3"
              />

              <path
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#ff3301"
                strokeWidth="3"
                strokeDasharray="12, 100"
                strokeLinecap="round"
              />

            </svg>

            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[#181818]">
              2%
            </span>

          </div>

          <div className="text-left text-[11px] text-[#666]">

            <p>
              Storage used:{' '}
              <span className="font-semibold text-[#181818]">
                2mb
              </span>
            </p>

            <p className="mt-2">
              Storage total:{' '}
              <span className="font-semibold text-[#181818]">
                1000mb
              </span>
            </p>

          </div>

        </div>

        <div className="hidden lg:block" />

      </div>

      {/* SUBSCRIBE */}
      <div className="mt-10 flex justify-center">

        <button
          type="button"
          className="w-full max-w-md text-[11px] rounded-2xl bg-[#ff3301] py-3.5 font-semibold text-white transition hover:bg-[#eb2f00]"
        >
          Subscribe
        </button>

      </div>

    </div>
  </div>
</main>
  )
}

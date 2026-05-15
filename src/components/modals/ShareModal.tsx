import { type ReactElement, useEffect, useState } from 'react'
import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
  CodeBracketIcon,
  DocumentIcon,
  LinkIcon,
  PencilSquareIcon,
  QrCodeIcon,
  ShareIcon,
  Square2StackIcon,
  WindowIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

type ShareModalProps = {
  open: boolean
  onClose: () => void
}

type ShareTab = 'link' | 'social' | 'download' | 'qr'
type SocialIconProps = { className?: string }
type SocialIcon = (props: SocialIconProps) => ReactElement

const readerLink = 'https://flipbook.local/editor/demo'

const tabs: Array<{ id: ShareTab; label: string; Icon: typeof LinkIcon }> = [
  { id: 'link', label: 'Link', Icon: LinkIcon },
  { id: 'social', label: 'Social', Icon: ShareIcon },
  { id: 'download', label: 'Download', Icon: ArrowDownTrayIcon },
  { id: 'qr', label: 'QR code', Icon: QrCodeIcon },
]

const socials: Array<{ id: string; label: string; Icon: SocialIcon }> = [
  { id: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { id: 'x', label: 'X', Icon: XIcon },
  { id: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon },
  { id: 'reddit', label: 'Reddit', Icon: RedditIcon },
  { id: 'snapchat', label: 'Snapchat', Icon: SnapchatIcon },
  { id: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon },
  { id: 'telegram', label: 'Telegram', Icon: TelegramIcon },
  { id: 'skype', label: 'Skype', Icon: SkypeIcon },
  { id: 'pinterest', label: 'Pinterest', Icon: PinterestIcon },
  { id: 'blogger', label: 'Blogger', Icon: BloggerIcon },
  { id: 'evernote', label: 'Evernote', Icon: EvernoteIcon },
  { id: 'messenger', label: 'Messenger', Icon: MessengerIcon },
]

export function ShareModal({ open, onClose }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>('social')

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex animate-[shareOverlayIn_180ms_ease-out] items-start justify-center bg-black/45 px-4 py-12">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fermer le partage"
        onClick={onClose}
      />
      <section
        className="relative flex max-h-[calc(100vh-6rem)] w-full max-w-[1040px] animate-[shareModalIn_220ms_cubic-bezier(0.16,1,0.3,1)] flex-col overflow-hidden rounded-lg bg-white text-gray-950 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        <header className="flex shrink-0 items-center justify-between px-5 py-4">
          <h2 id="share-modal-title" className="text-lg font-medium">
            Share
          </h2>
          <button
            type="button"
            className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
            aria-label="Fermer"
            onClick={onClose}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>

        <nav className="grid shrink-0 grid-cols-2 gap-2 border-b border-gray-200 bg-white px-6 pb-4 pt-3 sm:grid-cols-4">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25 ${
                activeTab === id
                  ? 'border-gray-950 bg-white text-gray-950'
                  : 'border-transparent text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab(id)}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-h-[330px] flex-1 overflow-y-auto">
          {activeTab === 'link' && <LinkContent />}
          {activeTab === 'social' && <SocialContent />}
          {activeTab === 'download' && <DownloadContent />}
          {activeTab === 'qr' && <QrContent />}
        </div>

        <footer className="flex shrink-0 justify-end bg-gray-50 px-6 py-4">
          <button
            type="button"
            className="min-h-9 min-w-[120px] rounded-md border border-gray-950 bg-white px-5 text-sm font-medium text-gray-950 transition-colors hover:bg-gray-950 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  )
}

function LinkContent() {
  return (
    <div className="flex min-h-[330px] items-center justify-center px-6 py-10">
      <div className="w-full max-w-[760px]">
        <label className="block text-sm font-semibold text-gray-950" htmlFor="share-link">
          Reader link
        </label>
        <div className="mt-5 flex overflow-hidden rounded-md border border-gray-300 bg-gray-100">
          <input
            id="share-link"
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-gray-900 outline-none"
            value={readerLink}
            readOnly
          />
          <button
            type="button"
            className="flex w-12 items-center justify-center border-l border-gray-950 bg-gray-950 text-white transition-colors hover:bg-gray-800"
            aria-label="Ouvrir le lien"
          >
            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="flex w-12 items-center justify-center bg-gray-950 text-white transition-colors hover:bg-gray-800"
            aria-label="Copier le lien"
          >
            <ClipboardDocumentIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function SocialContent() {
  return (
    <div className="grid px-6 py-7 lg:grid-cols-[1fr_280px] lg:gap-10">
      <div className="mx-auto w-full max-w-[500px]">
        <h3 className="text-center text-base font-semibold">Preview</h3>
        <PreviewCard />
        <p className="mt-3 max-w-md text-xs leading-5 text-gray-800">
          This is a preview. The result will vary depending on the social network and screen
          resolution
        </p>
        <div className="mt-7 flex justify-center">
          <button
            type="button"
            className="inline-flex min-h-9 items-center gap-2 rounded-md border border-gray-950 px-6 text-sm font-medium text-gray-950 transition-colors hover:bg-gray-950 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
          >
            <PencilSquareIcon className="h-5 w-5" />
            Edit
          </button>
        </div>
      </div>

      <aside className="mt-8 lg:mt-0">
        <h3 className="text-center text-base font-semibold">Share</h3>
        <div className="mx-auto mt-6 max-w-[228px]">
          <SocialPanel />
        </div>
      </aside>
    </div>
  )
}

function PreviewCard() {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-300 bg-white">
      <div className="grid min-h-[124px] grid-cols-[126px_1fr]">
        <div className="border-r border-gray-300 bg-gray-50 p-2">
          <div className="grid h-full grid-cols-5 grid-rows-6 gap-px border border-gray-300 bg-white p-1">
            {Array.from({ length: 30 }).map((_, index) => (
              <span
                key={index}
                className={`border border-gray-200 ${
                  index % 7 === 0 || index % 11 === 0 ? 'bg-gray-900' : 'bg-gray-100'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center px-4">
          <p className="text-base font-bold text-gray-900">Online Flipbook</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-gray-950">
            Created with the flipbook maker
          </p>
        </div>
      </div>
    </div>
  )
}

function SocialPanel() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {socials.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className="flex h-[42px] w-[42px] items-center justify-center rounded-md border border-gray-950 bg-white text-gray-950 transition-colors hover:bg-gray-950 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
          aria-label={`Partager sur ${label}`}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  )
}

function DownloadContent() {
  return (
    <div className="mx-auto flex min-h-[330px] w-full max-w-[720px] flex-col justify-center px-6 py-9">
      <div className="grid gap-8 md:grid-cols-2">
        <DownloadCard Icon={DocumentIcon} label="Download Flipbook" />
        <DownloadCard Icon={WindowIcon} label="Download Reader App" />
      </div>
      <p className="mt-8 text-sm text-gray-800">
        Are you a developer?{' '}
        <button type="button" className="font-medium text-gray-950 underline underline-offset-4">
          Download the flipbook source code
        </button>
      </p>
    </div>
  )
}

function DownloadCard({ Icon, label }: { Icon: typeof DocumentIcon; label: string }) {
  return (
    <div>
      <button
        type="button"
        className="flex h-[150px] w-full flex-col items-center justify-center gap-4 rounded-lg border border-gray-950 bg-white text-gray-950 transition-colors hover:bg-gray-950 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
      >
        <Icon className="h-12 w-12" />
        <span className="text-base font-medium">{label}</span>
      </button>
      <div className="mt-2 flex min-h-10 overflow-hidden rounded-lg border border-gray-300">
        <label className="flex min-w-0 flex-1 items-center gap-2 px-3 text-sm text-gray-900">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-400" />
          Enable link for sharing
        </label>
        <button
          type="button"
          className="flex w-10 items-center justify-center border-l border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-950"
          aria-label="Copier le lien de téléchargement"
        >
          <Square2StackIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex w-10 items-center justify-center border-l border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-950"
          aria-label="Ouvrir le lien de téléchargement"
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function QrContent() {
  return (
    <div className="grid min-h-[330px] bg-white lg:grid-cols-[190px_1fr_280px]">
      <aside className="border-b border-gray-200 bg-gray-50 px-4 py-7 lg:border-b-0 lg:border-r">
        <h3 className="text-center text-base font-semibold">Design</h3>
        <div className="mt-8 space-y-2">
          <button
            type="button"
            className="flex min-h-10 w-full items-center justify-between rounded-md bg-white px-4 text-sm font-medium text-gray-950 shadow-sm"
          >
            QR Code
            <span className="text-lg text-gray-500">›</span>
          </button>
          <button
            type="button"
            className="flex min-h-10 w-full items-center justify-between rounded-md px-4 text-sm text-gray-700 hover:bg-white"
          >
            QR Logo
            <span className="text-lg text-gray-500">›</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-col items-center justify-center px-6 py-8">
        <h3 className="text-center text-base font-semibold">Preview</h3>
        <QrPreview />
      </div>

      <aside className="flex flex-col justify-center gap-4 px-6 py-8">
        <h3 className="text-center text-base font-semibold">Share</h3>
        <button
          type="button"
          className="mt-3 flex min-h-10 items-center justify-center gap-2 rounded-md border border-gray-950 bg-white px-4 text-sm font-medium text-gray-950 transition-colors hover:bg-gray-950 hover:text-white"
        >
          <Square2StackIcon className="h-5 w-5" />
          Copy image
        </button>
        <button
          type="button"
          className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-gray-950 bg-white px-4 text-sm font-medium text-gray-950 transition-colors hover:bg-gray-950 hover:text-white"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Download image
        </button>
        <button
          type="button"
          className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-gray-950 bg-white px-4 text-sm font-medium text-gray-950 transition-colors hover:bg-gray-950 hover:text-white"
        >
          <CodeBracketIcon className="h-5 w-5" />
          Copy html code
        </button>
      </aside>
    </div>
  )
}

function QrPreview() {
  return (
    <div className="mt-8 bg-white p-3 shadow-md">
      <div className="grid h-44 w-44 grid-cols-11 grid-rows-11 gap-1 bg-white">
        {Array.from({ length: 121 }).map((_, index) => {
          const row = Math.floor(index / 11)
          const col = index % 11
          const inMarker =
            (row < 3 && col < 3) ||
            (row < 3 && col > 7) ||
            (row > 7 && col < 3)
          const active = inMarker || index % 2 === 0 || index % 13 === 0 || index % 17 === 0
          return <span key={index} className={active ? 'bg-gray-950' : 'bg-white'} />
        })}
      </div>
    </div>
  )
}

function FacebookIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.7H16l.4-3h-2.9V8.4c0-.9.3-1.5 1.5-1.5h1.6V4.2c-.8-.1-1.6-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.1v2.2H7.5v3h2.6V21h3.4z" />
    </svg>
  )
}

function XIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m5 5 14 14M19 5 5 19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

function LinkedInIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.4 8.9H3.7V20h2.7V8.9zM5 7.4a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zM20.3 13.7c0-3-1.6-5-4.1-5-1.8 0-2.7 1-3.1 1.7V8.9h-2.6V20h2.7v-5.7c0-1.8.8-2.9 2.2-2.9s2.1 1 2.1 2.9V20h2.8v-6.3z" />
    </svg>
  )
}

function RedditIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="13" r="6.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="9.6" cy="12.4" r="1" fill="currentColor" />
      <circle cx="14.4" cy="12.4" r="1" fill="currentColor" />
      <path d="M9.5 15.6c1.3.9 3.7.9 5 0M14.8 6.5l-2-.5-1 2.2M16.5 7.3a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8zM5.9 11.4 4 10M18.1 11.4 20 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function SnapchatIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3.8c2.2 0 4 1.8 4 4v2c0 .8.6 1.3 1.3 1.5l1 .3c.5.2.5.9 0 1.1l-1.2.5c-.6.2-1 .8-1.2 1.4-.4 1.4-1.4 2.2-2.7 2.5-.4.1-.6.4-.8.8-.2.5-.7.8-1.4.8s-1.2-.3-1.4-.8c-.2-.4-.4-.7-.8-.8-1.3-.3-2.3-1.1-2.7-2.5-.2-.6-.6-1.2-1.2-1.4l-1.2-.5c-.5-.2-.5-.9 0-1.1l1-.3c.7-.2 1.3-.7 1.3-1.5v-2c0-2.2 1.8-4 4-4z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5.5 19 6.6 16.4A7.2 7.2 0 1 1 9 18.6L5.5 19z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9.8 8.7c-.3.1-.7.6-.7 1.1 0 1.8 2.9 4.7 4.7 4.7.5 0 1-.4 1.1-.7l.3-.8-1.8-1-.7.7c-.8-.3-1.8-1.3-2.1-2.1l.7-.7-.9-1.8-.6.6z" fill="currentColor" />
    </svg>
  )
}

function TelegramIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.6 4.6 3.8 11.1c-1.1.4-1.1 1.1-.2 1.4l4.2 1.3 1.6 5c.2.7.6.8 1.1.3l2.4-2.3 4.3 3.2c.8.4 1.3.2 1.5-.8l2.8-13.4c.3-1.1-.4-1.6-.9-1.2zM8.5 13.4l9.4-5.9-6.8 7.3-.3 3.1-1.3-4.1-1-.4z" />
    </svg>
  )
}

function SkypeIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.7 13.3A7.8 7.8 0 0 1 9.8 20a4.5 4.5 0 0 1-5.7-5.7A7.8 7.8 0 0 1 14.3 4a4.5 4.5 0 0 1 5.4 5.4c.2.7.3 1.3.3 2.1s-.1 1.3-.3 1.8zM12 16.7c2.4 0 4-.9 4-2.7 0-1.5-.9-2.2-3.1-2.7l-1.6-.4c-.9-.2-1.2-.4-1.2-.8s.5-.7 1.4-.7c1 0 1.6.3 2.2 1l1.8-1.2c-.9-1.2-2.2-1.7-4-1.7-2.3 0-3.8 1-3.8 2.7 0 1.5.9 2.3 3 2.7l1.7.4c.9.2 1.2.4 1.2.8 0 .5-.6.8-1.6.8-1.2 0-2-.4-2.7-1.2l-1.8 1.3c1 1.2 2.4 1.7 4.5 1.7z" />
    </svg>
  )
}

function PinterestIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.1 3.8c-4 0-6.6 2.7-6.6 6.1 0 2.1 1.1 3.5 2.6 4.1.3.1.6 0 .7-.4l.2-1c.1-.3.1-.5-.2-.8-.5-.6-.8-1.2-.8-2.1 0-2.1 1.6-3.8 4-3.8 2.2 0 3.5 1.3 3.5 3.2 0 2.5-1.1 4.3-2.6 4.3-.8 0-1.4-.7-1.2-1.5.2-.9.7-1.9.7-2.6 0-.6-.3-1.1-1-1.1-.8 0-1.5.8-1.5 2 0 .7.2 1.2.2 1.2l-1 4.1c-.3 1.1-.2 2.6-.1 3.6 0 .3.4.4.6.1.4-.5 1.1-1.7 1.4-2.8l.5-1.9c.4.7 1.3 1.2 2.3 1.2 3 0 5.2-2.8 5.2-6.3 0-3.1-2.6-5.6-6.4-5.6z" />
    </svg>
  )
}

function BloggerIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 4h6.2a4 4 0 0 1 4 4c0 .7.5 1.2 1.2 1.2H19c.6 0 1 .4 1 1V17a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zm1.4 5.8h4.2a1.1 1.1 0 0 0 0-2.2H8.4a1.1 1.1 0 0 0 0 2.2zm0 6.5h7.2a1.1 1.1 0 1 0 0-2.2H8.4a1.1 1.1 0 1 0 0 2.2z" />
    </svg>
  )
}

function EvernoteIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.5 4h6.4l4.6 3.2 1 8.5c.2 1.8-.8 3.3-2.5 3.9l-3.4 1.1c-.4.1-.8 0-1.1-.3L9.8 19H7a3 3 0 0 1-3-3V6.5L6.5 4zm.4.8L4.8 6.9h2.1V4.8zm5.7 4.4c-.5 0-1 .5-1 1v2.1c0 .6.4 1 1 1h2.6c.6 0 1-.4 1-1v-1.8c0-.7-.5-1.3-1.2-1.3h-2.4zm-5 5.1h3.1v1.6H7.6v-1.6zm4.9 2.5c.9.7 2.4.7 3.3 0l.9 1.3c-1.4 1-3.7 1-5.1 0l.9-1.3z" />
    </svg>
  )
}

function MessengerIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 4C7.1 4 3.3 7.4 3.3 11.9c0 2.5 1.2 4.7 3 6.1v3l2.7-1.5c.9.3 1.9.4 3 .4 4.9 0 8.7-3.4 8.7-7.9S16.9 4 12 4zm.9 10.6-2.2-2.3-4.2 2.3 4.6-5 2.2 2.3 4.2-2.3-4.6 5z" />
    </svg>
  )
}

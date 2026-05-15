import { motion } from 'framer-motion'
import type { ComponentType, SVGProps } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  BookOpenIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CursorArrowRaysIcon,
  DevicePhoneMobileIcon,
  DocumentArrowUpIcon,
  PaintBrushIcon,
  ShareIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import heroLayer from '../assets/hero.png'
import demoCover from '../../turnjs4/samples/basic/pages/1.jpg'
import demoPage from '../../turnjs4/samples/magazine/pages/2.jpg'
import { useAuth } from '../contexts/AuthContext'
import { useAuthModal } from '../contexts/AuthModalContext'
import { useUploadModal } from '../contexts/UploadModalContext'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

type Feature = {
  title: string
  copy: string
  Icon: IconType
  tone: string
}

type Step = {
  step: string
  title: string
  copy: string
}

const proofPoints = [
  { value: '80 Mo', label: 'par PDF dans la démo' },
  { value: '5', label: 'flipbooks gratuits inclus' },
  { value: '3 vues', label: 'créer, éditer, mesurer' },
]

const features: Feature[] = [
  {
    title: 'Lecture qui donne envie',
    copy: 'Feuilletage, double page et rythme visuel pour sortir du PDF figé.',
    Icon: BookOpenIcon,
    tone: 'border-[#ff3301]/20 bg-[#fff4f0] text-[#ff3301]',
  },
  {
    title: 'Mise en ligne rapide',
    copy: 'Importez un PDF, lancez la conversion et retrouvez votre publication dans le dashboard.',
    Icon: DocumentArrowUpIcon,
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    title: 'Expérience de marque',
    copy: 'Logo, arrière-plan, effets de page et interactions pour une présentation cohérente.',
    Icon: PaintBrushIcon,
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    title: 'Suivi exploitable',
    copy: 'Un espace statistiques pour comprendre ce qui est consulté et améliorer vos contenus.',
    Icon: ChartBarIcon,
    tone: 'border-sky-200 bg-sky-50 text-sky-700',
  },
]

const workflow: Step[] = [
  {
    step: '01',
    title: 'Importez',
    copy: 'Déposez votre PDF depuis le dashboard, sans configuration lourde.',
  },
  {
    step: '02',
    title: 'Personnalisez',
    copy: 'Ajustez le rendu, les repères visuels et les détails de présentation.',
  },
  {
    step: '03',
    title: 'Partagez',
    copy: 'Publiez un lien propre, puis suivez les performances dans votre espace.',
  },
]

const useCases = ['Catalogues', 'Magazines', 'Rapports', 'Dossiers commerciaux', 'Travaux à rendre']

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.22 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
}

export function HomePage() {
  const { user } = useAuth()
  const { openLogin, openRegister } = useAuthModal()
  const { open: openUpload } = useUploadModal()
  const year = new Date().getFullYear()

  const primaryLabel = user ? 'Importer un PDF' : 'Créer un compte gratuit'

  const handlePrimaryAction = () => {
    if (user) {
      openUpload()
      return
    }
    openRegister({ redirectTo: '/dashboard' })
  }

  const handleLogin = () => {
    openLogin({ redirectTo: '/dashboard' })
  }

  return (
    <main className="bg-[#fbfbf8] text-[#111111]">
      <section className="relative isolate overflow-hidden bg-[#0d0d0d] px-4 py-12 text-white sm:px-6 sm:py-16 lg:py-20">
        <div className="absolute inset-0" aria-hidden>
          <img
            src={demoCover}
            alt=""
            className="absolute right-[-4.5rem] top-6 h-[23rem] w-[17rem] rotate-6 object-cover opacity-30 shadow-2xl sm:right-[8%] sm:h-[32rem] sm:w-[23rem] lg:opacity-55"
          />
          <img
            src={demoPage}
            alt=""
            className="absolute bottom-[-5rem] right-[18%] hidden h-[27rem] w-[20rem] -rotate-3 object-cover opacity-25 shadow-2xl sm:block lg:opacity-45"
          />
          <img
            src={heroLayer}
            alt=""
            className="absolute right-[7%] top-[18%] hidden h-56 w-56 object-contain opacity-60 md:block"
          />
          <div className="absolute inset-0 bg-[#0d0d0d]/72" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-white/15" />
        </div>

        <motion.div className="relative mx-auto max-w-6xl" {...reveal}>
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-white/80">
              <CheckCircleIcon className="h-4 w-4 text-[#ff3301]" />
              Publications interactives pour PDF
            </p>
            <h1 className="mt-6 text-5xl font-bold leading-none text-white sm:text-7xl lg:text-8xl">
              AG Reader
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
              Transformez vos PDF en flipbooks élégants, partageables et mesurables. Une
              page tournée vers l'action, pas seulement vers la lecture.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePrimaryAction}
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#ff3301] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30 transition-colors hover:bg-[#e62d00]"
              >
                <DocumentArrowUpIcon className="h-5 w-5" />
                {primaryLabel}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-white/15"
                >
                  <Squares2X2Icon className="h-5 w-5" />
                  Ouvrir le dashboard
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleLogin}
                  className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <Squares2X2Icon className="h-5 w-5" />
                  Se connecter
                </button>
              )}
            </div>
          </div>

          <div className="mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {proofPoints.map((item) => (
              <div key={item.label} className="border-l border-white/20 pl-4">
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="mt-1 text-sm leading-6 text-white/65">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <motion.section {...reveal} className="border-b border-[#ff3301]/15 bg-white px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-7 gap-y-3 text-sm text-gray-700">
          <span className="font-semibold text-[#ff3301]">Pensé pour convertir</span>
          <span>Lecture immersive</span>
          <span>Partage simple</span>
          <span>Marque cohérente</span>
          <span>Suivi des performances</span>
        </div>
      </motion.section>

      <motion.section {...reveal} className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase text-[#ff3301]">Pourquoi ça marche</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#111111] sm:text-5xl">
              Une home page qui montre vite la valeur du produit.
            </h2>
            <p className="mt-5 text-base leading-8 text-gray-600 sm:text-lg">
              Le visiteur comprend ce que fait AG Reader, voit l'intérêt du format flipbook et
              sait immédiatement quelle action lancer.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ title, copy, Icon, tone }) => (
              <article key={title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-md border ${tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...reveal} className="bg-[#111111] px-4 py-16 text-white sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="text-xs font-bold uppercase text-[#ff3301]">Workflow</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">
              Du PDF au lien partageable, en trois temps.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              La page d'accueil prépare le passage à l'action. Ensuite, le produit prend le relais
              avec un flux simple et reconnaissable.
            </p>
          </div>

          <div className="grid gap-3 lg:col-span-7">
            {workflow.map((item) => (
              <article key={item.step} className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-5 sm:grid-cols-[4rem_1fr]">
                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[#ff3301] text-sm font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/68">{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...reveal} className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <p className="text-xs font-bold uppercase text-[#ff3301]">Cas d'usage</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                Un format plus vivant pour les contenus qui méritent mieux qu'une pièce jointe.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-base leading-8 text-gray-600">
                AG Reader convient aux supports commerciaux, dossiers de marque, rendus clients,
                publications éditoriales et documents pédagogiques qui doivent être consultés avec attention.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {useCases.map((item) => (
                  <span key={item} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <CursorArrowRaysIcon className="h-8 w-8 text-[#ff3301]" />
              <h3 className="mt-5 text-lg font-bold">Action claire</h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                Un bouton principal visible dès le haut de page, adapté à l'état connecté.
              </p>
            </article>
            <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <DevicePhoneMobileIcon className="h-8 w-8 text-emerald-700" />
              <h3 className="mt-5 text-lg font-bold">Responsive</h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                Une structure qui reste lisible sur mobile, tablette et grand écran.
              </p>
            </article>
            <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <ShareIcon className="h-8 w-8 text-sky-700" />
              <h3 className="mt-5 text-lg font-bold">Partage naturel</h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                La proposition prépare le visiteur à créer, publier et suivre ses documents.
              </p>
            </article>
          </div>
        </div>
      </motion.section>

      <motion.section {...reveal} className="bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 border-t border-[#ff3301]/20 pt-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-[#ff3301]">Prêt à publier</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-[#111111] sm:text-4xl">
              Donnez à vos PDF une présence plus professionnelle.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#ff3301] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#e62d00]"
            >
              <DocumentArrowUpIcon className="h-5 w-5" />
              {primaryLabel}
            </button>
            <Link
              to="/support"
              className="inline-flex min-h-12 items-center gap-2 rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 no-underline transition-colors hover:bg-gray-50"
            >
              Voir l'aide
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      <footer className="bg-[#0d0d0d] px-5 py-16 text-white sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-6 text-center">
          <h2 className="text-6xl font-black uppercase tracking-tight text-white sm:text-7xl lg:text-8xl">
            Acredi Group
          </h2>
          <p className="max-w-2xl text-sm text-white/60 sm:text-base">
            Made with excellence.
          </p>
          <div className="flex flex-col items-center gap-2 text-xs text-white/50 sm:flex-row sm:gap-4">
            <span>AG Reader © {year}</span>
            <span>Tous droits réservés.</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

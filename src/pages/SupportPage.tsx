export function SupportPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 px-3 py-8 sm:px-5">
      <div className="rounded-lg border border-[#ff3301]/35 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Aide & support</h1>
        <p className="mt-2 text-sm text-gray-600">
          Documentation API, embed et sécurité — contenu à relier à votre centre d’aide.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>Restriction d’embed par domaine (Referer / jeton signé)</li>
          <li>Publications privées et mot de passe</li>
          <li>File d’attente de conversion (queued → ready)</li>
        </ul>
      </div>
    </main>
  )
}

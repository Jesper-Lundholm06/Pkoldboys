export default function Footer() {
  return (
    <footer className="border-t-2 border-accent bg-primary px-6 py-10 text-center text-white">
      <p className="text-xl font-semibold">PK Oldboys Bowling</p>

      <div className="mt-4 flex flex-col gap-1 text-lg">
        <p>Bankgiro 5211-2141</p>
        <p>Swish 123-132 81 78</p>
        <p>
          Kontakt:{' '}
          <a href="mailto:kontakt@pkoldboys.se" className="text-accent underline-offset-2 hover:text-white">
            kontakt@pkoldboys.se
          </a>
        </p>
      </div>

      <p className="mt-6 text-base text-gray-300">© 2026 PK Oldboys Bowling</p>
    </footer>
  )
}

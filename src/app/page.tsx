import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <h1>Map comparison</h1>
      <ul>
        <li>
          <Link href="/leaflet">Leaflet</Link>
        </li>
        <li>
          <Link href="/maplibre">MapLibre</Link>
        </li>
      </ul>
    </main>
  )
}

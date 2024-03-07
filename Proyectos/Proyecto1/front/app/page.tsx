import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 justify-center items-center h-screen p-8 bg-gray-50">
        <Link className="card" href="/monitoreo">
          Monitoreo
        </Link>
        <Link className="card" href="/historico">
          Historico
        </Link>
        <Link className="card" href="/arbol">
          Árbol de procesos
        </Link>
        <Link className="card" href="/simulacion">
          Simulación de procesos
        </Link>
      </div>
    </>
  );
}

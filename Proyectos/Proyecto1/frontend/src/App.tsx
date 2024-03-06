const data = { "totalRam": 4102369280, "memoriaEnUso": 2563993600, "porcentaje": 62, "libre": 1538375680 }

export const App = () => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 justify-center items-center h-screen p-8">
          <button className="card">
            Monitoreo
          </button>
          <button className="card">
            Acciones
          </button>
          <button className="card">
            Árbol de procesos
          </button>
          <button className="card">
            Histórico
          </button>
      </div>
    </>
  )
}
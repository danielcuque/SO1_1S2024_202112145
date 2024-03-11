import { Navbar } from "@/components/Navbar/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar routes={[
        "arbol",
        "historico",
        "monitoreo",
        "simulacion"
      ]} />
      <section className="flex flex-col flex-grow">
        {children}
      </section>
    </div>
  );
}
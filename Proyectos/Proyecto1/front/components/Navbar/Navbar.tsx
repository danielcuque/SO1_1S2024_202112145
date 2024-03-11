"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"

export interface NavbarProps {
  routes: string[]
}

export const Navbar = ({
  routes
}: NavbarProps) => {

  const currentPath = usePathname().substring(1)

  console.log(currentPath)

  return (
    <nav className="w-full flex justify-around py-4 px-8">
        {routes.map((route, index) => (
          <Link key={index} href={route} className={
            `font-medium hover:text-blue-800 ${currentPath === route ? "text-blue-500" : ""}`
          } >
            {
              route.charAt(0).toUpperCase() + route.slice(1)
            }
          </Link>
        ))}
    </nav>
  )
}
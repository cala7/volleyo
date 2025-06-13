import * as React from "react"
import { prisma } from "@/prisma/singlePrismaClient"
import { TeamSwitcher } from "./team-switcher/TeamSwitcher"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getAuthSession()

  if (!session) {
    redirect("/login")
  }

  const teams = await prisma.team.findMany({
    where: { members: { some: { member: { userId: session.user.id } } } },
    select: { slug: true, name: true, description: true, id: true },
  })

  return (
    <main className="container flex min-h-screen max-w-screen-2xl flex-col mt-5 gap-4">
      <TeamSwitcher teams={teams} />
    </main>
  )
}

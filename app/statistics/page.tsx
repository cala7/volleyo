import { DataTable } from "@/app/statistics/data-table"
import { columns, Statistics } from "@/app/statistics/columns"

export default async function StatisticsPage() {
  const data = await getData()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="container mx-auto py-10">
          <DataTable
            columns={columns}
            data={data}
          />
        </div>
      </div>
    </main>
  )
}

async function getData(): Promise<Statistics[]> {
  return [
    {
      id: "m5gr84i9",
      name: "#7 Monserrat",
      kills: 18,
      attackErrors: 4,
      attackAttempts: 45,
      attackEfficiency: 0.31,
      killsPerSet: 3.6,
      serveAces: 4,
      serveErrors: 3,
      serveAttempts: 30,
      servePercentage: 86.67,
      serveEfficiency: 0.03,
      serveRating: 4.0,
      receivePerfect: 14,
      receivePositive: 20,
      receiveNegative: 6,
      receiveError: 2,
      receiveAttempts: 42,
      receivePercentage: 95.24,
      setAssists: 0,
      setsTotal: 5,
      setErrors: 1,
      digs: 15,
      digErrors: 1,
      blockSingle: 6,
      blockMultiple: 2,
      blockErrors: 1,
      blocksPerSet: 1.6,
      setsPlayed: 5,
    },
    {
      id: "3u1reuv4",
      name: "#12 Silas",
      kills: 22,
      attackErrors: 6,
      attackAttempts: 50,
      attackEfficiency: 0.32,
      killsPerSet: 4.4,
      serveAces: 6,
      serveErrors: 4,
      serveAttempts: 35,
      servePercentage: 88.57,
      serveEfficiency: 0.06,
      serveRating: 4.2,
      receivePerfect: 18,
      receivePositive: 24,
      receiveNegative: 7,
      receiveError: 3,
      receiveAttempts: 52,
      receivePercentage: 94.23,
      setAssists: 4,
      setsTotal: 5,
      setErrors: 1,
      digs: 24,
      digErrors: 2,
      blockSingle: 10,
      blockMultiple: 6,
      blockErrors: 1,
      blocksPerSet: 3.2,
      setsPlayed: 5,
    },
    {
      id: "derv1ws0",
      name: "#9 Carmella",
      kills: 12,
      attackErrors: 3,
      attackAttempts: 28,
      attackEfficiency: 0.32,
      killsPerSet: 4,
      serveAces: 5,
      serveErrors: 2,
      serveAttempts: 25,
      servePercentage: 92,
      serveEfficiency: 0.12,
      serveRating: 4.5,
      receivePerfect: 10,
      receivePositive: 15,
      receiveNegative: 4,
      receiveError: 1,
      receiveAttempts: 30,
      receivePercentage: 96.67,
      setAssists: 3,
      setsTotal: 3,
      setErrors: 0,
      digs: 14,
      digErrors: 1,
      blockSingle: 3,
      blockMultiple: 2,
      blockErrors: 0,
      blocksPerSet: 1.67,
      setsPlayed: 3,
    },
    {
      id: "5kma53ae",
      name: "#4 Kathlyn",
      kills: 25,
      attackErrors: 5,
      attackAttempts: 50,
      attackEfficiency: 0.4,
      killsPerSet: 3.57,
      serveAces: 7,
      serveErrors: 3,
      serveAttempts: 34,
      servePercentage: 91.18,
      serveEfficiency: 0.12,
      serveRating: 4.6,
      receivePerfect: 11,
      receivePositive: 18,
      receiveNegative: 5,
      receiveError: 2,
      receiveAttempts: 36,
      receivePercentage: 94.44,
      setAssists: 6,
      setsTotal: 7,
      setErrors: 1,
      digs: 5,
      digErrors: 0,
      blockSingle: 3,
      blockMultiple: 4,
      blockErrors: 1,
      blocksPerSet: 1,
      setsPlayed: 7,
    },
    {
      id: "bhqecj4p",
      name: "#5 Laurie",
      kills: 30,
      attackErrors: 3,
      attackAttempts: 60,
      attackEfficiency: 0.45,
      killsPerSet: 6,
      serveAces: 9,
      serveErrors: 2,
      serveAttempts: 40,
      servePercentage: 95,
      serveEfficiency: 0.18,
      serveRating: 4.8,
      receivePerfect: 20,
      receivePositive: 25,
      receiveNegative: 4,
      receiveError: 1,
      receiveAttempts: 50,
      receivePercentage: 98,
      setAssists: 8,
      setsTotal: 5,
      setErrors: 0,
      digs: 18,
      digErrors: 1,
      blockSingle: 4,
      blockMultiple: 6,
      blockErrors: 1,
      blocksPerSet: 2,
      setsPlayed: 5,
    },
  ]
}

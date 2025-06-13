import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CrosshairIcon, ShieldIcon, SwordsIcon, Volleyball, VolleyballIcon } from "lucide-react"
import { LineChartScore } from "./LineChartScore"
import { StackedBarChartErrors } from "./StackedBarChartErrors"
import { BarChartMultiple } from "./BarChartMultiple"
import { columns, Leaderboard } from "./Leaderboard"
import { prisma } from "@/prisma/singlePrismaClient"
import { round2DecimalPlaces } from "@/app/statistics/[slug]/columns/utils"
import { format } from "date-fns"
import { DATE_ISO_FORMAT } from "@/app/utils"
import { Game } from "@prisma/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type OverviewProps = {
  teamSlug: string
  fromDateFilter?: Date
  toDateFilter?: Date
}

export const Overview = async ({ teamSlug, fromDateFilter, toDateFilter }: OverviewProps) => {
  const hasDateFilter = !!fromDateFilter && !!toDateFilter
  const gameWhereQuery = {
    team: { slug: teamSlug },
    AND: { teamScore: { not: null }, opponentScore: { not: null } },
    ...(hasDateFilter ? { AND: { date: { gte: fromDateFilter, lte: toDateFilter } } } : {}),
  }

  const statistics = (
    await prisma.statistics.aggregate({
      where: { game: gameWhereQuery },
      _sum: {
        kills: true,
        attackErrors: true,
        attackAttempts: true,
        serveAces: true,
        serveErrors: true,
        serveAttempts: true,
        receivePerfect: true,
        receivePositive: true,
        receiveNegative: true,
        receiveError: true,
        receiveAttempts: true,
        digs: true,
        digErrors: true,
        blockSingle: true,
        blockMultiple: true,
        blockErrors: true,
        setsPlayed: true,
      },
      ...(hasDateFilter ? { take: 30 } : {}),
    })
  )._sum

  const games = await prisma.game.findMany({
    where: gameWhereQuery,
    include: { statistics: true },
    orderBy: { date: "asc" },
    ...(!hasDateFilter ? { take: 30 } : {}),
  })

  const leaderBoardStatistics = await prisma.statistics.groupBy({
    by: ["memberId"],
    where: { game: gameWhereQuery },
    _sum: {
      kills: true,
      attackAttempts: true,
      serveAces: true,
      blockSingle: true,
      blockMultiple: true,
      digs: true,
      setAssists: true,
    },
  })

  const leaderBoardPlayers = await prisma.member.findMany({
    where: {
      id: { in: leaderBoardStatistics.map(data => data.memberId) },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      nickName: true,
    },
  })

  const leaderBoardData = leaderBoardStatistics.map(statistic => {
    const player = leaderBoardPlayers.find(player => player.id === statistic.memberId)

    // TODO: handle not found player

    const kills = statistic._sum.kills ?? 0
    const serveAces = statistic._sum.serveAces ?? 0
    const blocks = (statistic._sum.blockSingle ?? 0) + (statistic._sum.blockMultiple ?? 0)
    const digs = statistic._sum.digs ?? 0
    const setAssists = statistic._sum.setAssists ?? 0

    const score = kills * 1.5 + serveAces * 1.2 + blocks + digs * 0.75 + setAssists * 0.75

    return {
      playerId: player?.id ?? "",
      name: player?.nickName ?? `${player?.firstName} ${player?.lastName}`,
      kills,
      blocks,
      serveAces,
      digs,
      setAssists,
      score,
    }
  })

  const top5Players = leaderBoardData.sort((a, b) => b.score - a.score).slice(0, 5)

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4">
        <div className="mb-4 rounded-full bg-muted p-6">
          {<Volleyball className="h-12 w-12 text-muted-foreground" />}
        </div>
        <h2 className="text-2xl font-bold tracking-tight">No statistics yet.</h2>
        <p className="text-muted-foreground max-w-md mt-2 mb-6">
          There are no games found and therefor no statistics to show. Start planning your games by adding new
          games and document statistics.
        </p>
        <Link
          href={`/${teamSlug}/games`}
          legacyBehavior
          passHref
        >
          <Button variant="outline">Go to Games</Button>
        </Link>
      </div>
    )
  }

  const { wins, loses, winPercentage, totalGames } = calculateGamesOverview(games)

  const {
    totalKills,
    totalAttackErrors,
    totalAttackAttempts,
    totalAttackEfficiency,
    totalDigs,
    totalBlocks,
    totalReceivePercentage,
    totalAces,
    totalServeErrors,
    totalServeAttempts,
    totalServeEfficiency,
  } = calculateTotalStatistics(statistics)

  const scoresChartData = games.map(game => ({
    date: format(game.date, DATE_ISO_FORMAT),
    scores: game.statistics.reduce((acc, curr) => {
      const kills = curr.kills ?? 0
      const blocks = (curr.blockSingle ?? 0) + (curr.blockMultiple ?? 0)
      const aces = curr.serveAces ?? 0
      const scores = kills + blocks + aces

      return acc + scores
    }, 0),
    errors: game.statistics.reduce((acc, curr) => {
      const attackErrors = curr.attackErrors ?? 0
      const serveErrors = curr.serveErrors ?? 0
      const receiveErrors = curr.receiveError ?? 0
      const setErrors = curr.setErrors ?? 0
      const digErrors = curr.digErrors ?? 0
      const blockErrors = curr.blockErrors ?? 0

      const errors = attackErrors + serveErrors + receiveErrors + setErrors + digErrors + blockErrors

      return acc + errors
    }, 0),
  }))

  const errorsChartData = games.map(game => {
    return {
      date: format(game.date, DATE_ISO_FORMAT),
      attack: game.statistics.reduce((acc, stat) => acc + (stat.attackErrors ?? 0), 0),
      receive: game.statistics.reduce((acc, stat) => acc + (stat.receiveError ?? 0), 0),
    }
  })

  const attackChartData = games.map(game => ({
    date: format(game.date, DATE_ISO_FORMAT),
    attempts: game.statistics.reduce((acc, curr) => acc + (curr.attackAttempts ?? 0), 0),
    errors: game.statistics.reduce((acc, curr) => acc + (curr.attackErrors ?? 0), 0),
  }))

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Overview</CardTitle>
            <VolleyballIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Total Games: {totalGames}</div>
            <p className="text-xs text-muted-foreground">
              Win Percentage: {winPercentage}%, Wins: {wins}, Loses: {loses}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attack</CardTitle>
            <SwordsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Efficiency: {totalAttackEfficiency}</div>
            <p className="text-xs text-muted-foreground">
              Kills: {totalKills}, Errors: {totalAttackErrors}, Attempts: {totalAttackAttempts}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Defence</CardTitle>
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Receive Percentage: {totalReceivePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              Digs: {totalDigs}, Blocks: {totalBlocks}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serve</CardTitle>
            <CrosshairIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Efficiency: {totalServeEfficiency}</div>
            <p className="text-xs text-muted-foreground">
              Aces: {totalAces}, Errors: {totalServeErrors}, Attempts: {totalServeAttempts}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <LineChartScore chartData={scoresChartData} />
        <StackedBarChartErrors chartData={errorsChartData} />
        <BarChartMultiple chartData={attackChartData} />
        <Leaderboard
          columns={columns}
          data={top5Players}
        />
      </div>
    </>
  )
}

const calculateGamesOverview = (games: Game[]) => {
  let wins = 0
  let loses = 0

  games.forEach(game => {
    if (!game.teamScore || !game.opponentScore) return

    if (game.teamScore > game.opponentScore) {
      wins++
    } else {
      loses++
    }
  })

  const winPercentage = games.length > 0 ? Math.ceil((wins / games.length) * 10000) / 100 : 0
  const totalGames = games.length

  return {
    wins,
    loses,
    winPercentage,
    totalGames,
  }
}

const calculateTotalStatistics = (statistics: StatisticsAggregate) => {
  const totalKills = statistics.kills ?? 0
  const totalAttackErrors = statistics.attackErrors ?? 0
  const totalAttackAttempts = statistics.attackAttempts ?? 0

  const totalDigs = statistics.digs ?? 0
  const totalBlocks = (statistics.blockSingle ?? 0) + (statistics.blockMultiple ?? 0)
  const totalReceivePerfect = statistics.receivePerfect ?? 0
  const totalReceivePositive = statistics.receivePositive ?? 0
  const totalReceiveNegative = statistics.receiveNegative ?? 0
  const totalReceiveAttempts = statistics.receiveAttempts ?? 0

  const totalAces = statistics.serveAces ?? 0
  const totalServeErrors = statistics.serveErrors ?? 0
  const totalServeAttempts = statistics.serveAttempts ?? 0

  const totalAttackEfficiency = round2DecimalPlaces((totalKills - totalAttackErrors) / totalAttackAttempts, 2)

  const totalReceivePercentage = round2DecimalPlaces(
    (totalReceivePerfect * 3 + totalReceivePositive * 2 + totalReceiveNegative) / totalReceiveAttempts,
    2,
  )

  const totalServeEfficiency = round2DecimalPlaces((totalAces - totalServeErrors) / totalServeAttempts, 2)

  return {
    totalKills,
    totalAttackErrors,
    totalAttackAttempts,
    totalAttackEfficiency,
    totalDigs,
    totalBlocks,
    totalReceivePercentage,
    totalAces,
    totalServeErrors,
    totalServeAttempts,
    totalServeEfficiency,
  }
}

type StatisticsAggregate = NonNullable<Awaited<ReturnType<typeof prisma.statistics.aggregate>>["_sum"]>

import mongoose from "mongoose";
import { connectDatabase } from "./db.js";
import { MatchEventModel } from "./models/match-event.model.js";
import { MatchModel } from "./models/match.model.js";

type SeedEvent = {
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "var" | "comment";
  team: "home" | "away" | "neutral";
  player?: string;
  minute: number;
  description: string;
};

const now = new Date();

function minutesAgo(minutes: number) {
  return new Date(now.getTime() - minutes * 60 * 1000);
}

const demoMatches = [
  {
    match: {
      homeTeam: "Warsaw United",
      awayTeam: "Berlin Strikers",
      homeScore: 2,
      awayScore: 1,
      status: "live" as const,
      minute: 67,
      startedAt: minutesAgo(72)
    },
    events: [
      {
        type: "comment",
        team: "neutral",
        minute: 1,
        description: "Kickoff in Warsaw with both teams pressing high from the opening whistle."
      },
      {
        type: "goal",
        team: "home",
        player: "Marek Zielinski",
        minute: 18,
        description: "Low finish into the far corner after a quick Warsaw United counter."
      },
      {
        type: "yellow_card",
        team: "away",
        player: "Jonas Keller",
        minute: 31,
        description: "Booked for stopping a promising attack near midfield."
      },
      {
        type: "goal",
        team: "away",
        player: "Lukas Brandt",
        minute: 44,
        description: "Berlin Strikers equalize with a header from a deep cross."
      },
      {
        type: "substitution",
        team: "home",
        player: "Adam Nowak",
        minute: 58,
        description: "Warsaw United add pace on the left side for the final half hour."
      },
      {
        type: "goal",
        team: "home",
        player: "Marek Zielinski",
        minute: 64,
        description: "Second goal of the match after a sharp passing move through midfield."
      }
    ] satisfies SeedEvent[]
  },
  {
    match: {
      homeTeam: "Portfolio FC",
      awayTeam: "Lisbon City",
      homeScore: 0,
      awayScore: 0,
      status: "scheduled" as const,
      minute: 0
    },
    events: [] satisfies SeedEvent[]
  },
  {
    match: {
      homeTeam: "Madrid North",
      awayTeam: "Demo United",
      homeScore: 3,
      awayScore: 2,
      status: "finished" as const,
      minute: 90,
      startedAt: minutesAgo(145),
      finishedAt: minutesAgo(24)
    },
    events: [
      {
        type: "goal",
        team: "home",
        player: "Diego Ramos",
        minute: 9,
        description: "Madrid North score early after winning the ball high up the pitch."
      },
      {
        type: "yellow_card",
        team: "away",
        player: "Noah Silva",
        minute: 22,
        description: "Late challenge breaks up a Madrid North transition."
      },
      {
        type: "goal",
        team: "away",
        player: "Evan Carter",
        minute: 35,
        description: "Demo United level the match with a composed finish from inside the box."
      },
      {
        type: "comment",
        team: "neutral",
        minute: 51,
        description: "Tempo rises after halftime, with both teams committing more players forward."
      },
      {
        type: "substitution",
        team: "away",
        player: "Leo Martins",
        minute: 63,
        description: "Demo United refresh the midfield after a long defensive spell."
      },
      {
        type: "goal",
        team: "home",
        player: "Mateo Cruz",
        minute: 76,
        description: "Madrid North restore the lead from a rebound after the first shot is saved."
      },
      {
        type: "goal",
        team: "away",
        player: "Evan Carter",
        minute: 84,
        description: "Second goal for Carter, finishing a quick move down the right."
      },
      {
        type: "goal",
        team: "home",
        player: "Diego Ramos",
        minute: 89,
        description: "Late winner for Madrid North after a driven cross into the six-yard box."
      }
    ] satisfies SeedEvent[]
  }
];

async function seed() {
  await connectDatabase();
  await MatchEventModel.deleteMany({});
  await MatchModel.deleteMany({});

  for (const item of [...demoMatches].reverse()) {
    const match = await MatchModel.create(item.match);
    await MatchEventModel.insertMany(
      item.events.map((event) => ({
        ...event,
        matchId: match._id
      }))
    );
  }

  console.log(`Seeded ${demoMatches.length} matches and ${demoMatches.reduce((total, item) => total + item.events.length, 0)} events.`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

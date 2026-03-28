import { Poll, PollOption } from "./types";

const polls = new Map<string, Poll>();

const seedPolls: Poll[] = [
  {
    id: "poll_001",
    communityId: "comm_001",
    authorId: "user_001",
    title: "Which social platform should we build features for next?",
    description:
      "We have strong coverage on Instagram and Twitter. Help us decide where to focus next.",
    options: [
      { id: "opt_001a", label: "Threads (Meta)", votes: 234, voterIds: [] },
      { id: "opt_001b", label: "Mastodon", votes: 89, voterIds: [] },
      { id: "opt_001c", label: "Bluesky", votes: 312, voterIds: [] },
      { id: "opt_001d", label: "Pinterest", votes: 67, voterIds: [] },
    ],
    status: "active",
    endsAt: "2026-04-15T00:00:00Z",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "poll_002",
    communityId: "comm_001",
    authorId: "user_002",
    title: "Most wanted feature type for Reddit?",
    description: "What kind of overlay feature would you most want on Reddit?",
    options: [
      { id: "opt_002a", label: "Auto-TLDR for long posts", votes: 445, voterIds: [] },
      { id: "opt_002b", label: "User reputation scores", votes: 312, voterIds: [] },
      { id: "opt_002c", label: "Thread visualizer", votes: 198, voterIds: [] },
      { id: "opt_002d", label: "Duplicate post detector", votes: 156, voterIds: [] },
    ],
    status: "active",
    endsAt: "2026-04-10T00:00:00Z",
    createdAt: "2026-02-20T14:00:00Z",
  },
  {
    id: "poll_003",
    communityId: "comm_002",
    authorId: "user_006",
    title: "Next productivity integration?",
    description:
      "Which productivity tool should we target with our next overlay feature?",
    options: [
      { id: "opt_003a", label: "Notion", votes: 567, voterIds: [] },
      { id: "opt_003b", label: "Slack", votes: 423, voterIds: [] },
      { id: "opt_003c", label: "Google Calendar", votes: 389, voterIds: [] },
      { id: "opt_003d", label: "Trello / Jira", votes: 234, voterIds: [] },
    ],
    status: "active",
    endsAt: "2026-04-20T00:00:00Z",
    createdAt: "2026-03-05T09:00:00Z",
  },
];

for (const p of seedPolls) {
  polls.set(p.id, p);
}

let pollCounter = seedPolls.length;

function generateId(): string {
  pollCounter++;
  return `poll_${String(pollCounter).padStart(3, "0")}`;
}

function generateOptionId(pollIndex: number, optionIndex: number): string {
  return `opt_${String(pollIndex).padStart(3, "0")}${String.fromCharCode(97 + optionIndex)}`;
}

export async function listPollsByCommunity(communityId: string): Promise<Poll[]> {
  return Array.from(polls.values())
    .filter((p) => p.communityId === communityId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function getPoll(id: string): Promise<Poll | null> {
  return polls.get(id) ?? null;
}

export async function createPoll(
  data: Omit<Poll, "id" | "createdAt"> & { options: string[] }
): Promise<Poll> {
  const id = generateId();
  const poll: Poll = {
    id,
    communityId: data.communityId,
    authorId: data.authorId,
    title: data.title,
    description: data.description,
    options: data.options.map(
      (label: string, i: number): PollOption => ({
        id: generateOptionId(pollCounter, i),
        label,
        votes: 0,
        voterIds: [],
      })
    ),
    status: data.status,
    endsAt: data.endsAt,
    createdAt: new Date().toISOString(),
  };
  polls.set(poll.id, poll);
  return poll;
}

export async function vote(
  pollId: string,
  optionId: string,
  userId: string
): Promise<{ success: boolean; error?: string; poll?: Poll }> {
  const poll = polls.get(pollId);
  if (!poll) return { success: false, error: "Poll not found" };

  if (poll.status !== "active") {
    return { success: false, error: "Poll is closed" };
  }

  if (new Date(poll.endsAt) < new Date()) {
    poll.status = "closed";
    polls.set(pollId, poll);
    return { success: false, error: "Poll has ended" };
  }

  // Check if user already voted on any option
  const alreadyVoted = poll.options.some((opt) =>
    opt.voterIds.includes(userId)
  );
  if (alreadyVoted) {
    return { success: false, error: "User has already voted on this poll" };
  }

  const option = poll.options.find((opt) => opt.id === optionId);
  if (!option) return { success: false, error: "Option not found" };

  option.votes++;
  option.voterIds.push(userId);
  polls.set(pollId, poll);

  return { success: true, poll };
}

export async function getPollResults(
  pollId: string
): Promise<{ total: number; options: { id: string; label: string; votes: number; percentage: number }[] } | null> {
  const poll = polls.get(pollId);
  if (!poll) return null;

  const total = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  return {
    total,
    options: poll.options.map((opt) => ({
      id: opt.id,
      label: opt.label,
      votes: opt.votes,
      percentage: total > 0 ? Math.round((opt.votes / total) * 1000) / 10 : 0,
    })),
  };
}

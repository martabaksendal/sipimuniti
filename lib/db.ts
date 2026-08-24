// Database & Client Storage Layer for CPmunnity (CP Community)
// Supports persistence for Users, Submissions, Contests, Standings, Chat messages, and Editorials

export interface UserProfile {
  username: string;
  passwordHash: string;
  rating: number;
  maxRating: number;
  rankTier: string;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  placementCompleted: boolean;
  solvedProblems: string[]; // List of solved problem IDs
  geminiApiKey?: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  username: string;
  problemId: string;
  problemTitle: string;
  language: 'cpp' | 'python' | 'java';
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Evaluating';
  executionTime: number; // in ms
  passedTestcases: number;
  totalTestcases: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  username: string;
  rating: number;
  rankTier: string;
  text: string;
  timestamp: string;
}

export interface Editorial {
  id: string;
  problemId: string;
  problemTitle: string;
  rating: number;
  author: string;
  authorRating: number;
  authorRankTier: string;
  title: string;
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  content: string;
  codeSnippet?: string;
  upvotes: number;
  timestamp: string;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  problems: {
    id: string;
    title: string;
    rating: number;
    points: number;
  }[];
  registeredCount: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  rating: number;
  rankTier: string;
  solvedCount: number;
  score: number;
  penalty: number;
}

const STORAGE_KEYS = {
  USERS: 'cpmunnity_users_v1',
  CURRENT_USER: 'cpmunnity_current_user_session_v1',
  SUBMISSIONS: 'cpmunnity_submissions_v1',
  CHAT_MESSAGES: 'cpmunnity_chat_messages_v1',
  CONTESTS: 'cpmunnity_contests_v1',
  EDITORIALS: 'cpmunnity_editorials_v1',
  FRIENDS: 'cpmunnity_friends_v1',
  NOTIFICATIONS: 'cpmunnity_notifications_v1'
};

const LEGACY_STORAGE_KEYS = {
  USERS: 'algoarena_users_v1',
  CURRENT_USER: 'algoarena_current_user_session_v1',
  SUBMISSIONS: 'algoarena_submissions_v1',
  CHAT_MESSAGES: 'algoarena_chat_messages_v1',
  CONTESTS: 'algoarena_contests_v1',
  EDITORIALS: 'algoarena_editorials_v1'
};

// Compute rank tier based on Codeforces rating standards
export function getRankTier(rating: number): { name: string; color: string; badgeClass: string } {
  if (rating < 1200) return { name: 'Newbie', color: '#cbd5e1', badgeClass: 'badge-newbie' };
  if (rating < 1400) return { name: 'Pupil', color: '#86efac', badgeClass: 'badge-pupil' };
  if (rating < 1600) return { name: 'Specialist', color: '#67e8f9', badgeClass: 'badge-specialist' };
  if (rating < 1900) return { name: 'Expert', color: '#93c5fd', badgeClass: 'badge-expert' };
  if (rating < 2100) return { name: 'Candidate Master', color: '#f0abfc', badgeClass: 'badge-candidate' };
  if (rating < 2300) return { name: 'Master', color: '#fdba74', badgeClass: 'badge-master' };
  return { name: 'Grandmaster', color: '#fca5a5', badgeClass: 'badge-grandmaster' };
}

// Simple browser password hashing using SHA-256
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_cpmunnity_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial Seed Users for Leaderboard & Chatwall
const SEED_USERS: UserProfile[] = [
  {
    username: 'tourist_bot',
    passwordHash: 'seeded',
    rating: 3680,
    maxRating: 3750,
    rankTier: 'Grandmaster',
    streak: 142,
    lastActiveDate: new Date().toISOString().split('T')[0],
    placementCompleted: true,
    solvedProblems: ['cf_1A', 'cf_4A', 'cf_71A', 'cf_158A', 'cf_231A', 'cf_118A', 'cf_282A', 'cf_263A'],
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    username: 'Benq_AI',
    passwordHash: 'seeded',
    rating: 3210,
    maxRating: 3300,
    rankTier: 'Grandmaster',
    streak: 88,
    lastActiveDate: new Date().toISOString().split('T')[0],
    placementCompleted: true,
    solvedProblems: ['cf_1A', 'cf_71A', 'cf_158A'],
    createdAt: '2025-02-15T00:00:00.000Z'
  },
  {
    username: 'Um_nik',
    passwordHash: 'seeded',
    rating: 2890,
    maxRating: 2950,
    rankTier: 'Grandmaster',
    streak: 64,
    lastActiveDate: new Date().toISOString().split('T')[0],
    placementCompleted: true,
    solvedProblems: ['cf_4A', 'cf_71A'],
    createdAt: '2025-03-10T00:00:00.000Z'
  },
  {
    username: 'Errichto_Fan',
    passwordHash: 'seeded',
    rating: 1980,
    maxRating: 2050,
    rankTier: 'Candidate Master',
    streak: 21,
    lastActiveDate: new Date().toISOString().split('T')[0],
    placementCompleted: true,
    solvedProblems: ['cf_1A', 'cf_4A'],
    createdAt: '2025-05-20T00:00:00.000Z'
  },
  {
    username: 'CodeNinja99',
    passwordHash: 'seeded',
    rating: 1540,
    maxRating: 1610,
    rankTier: 'Specialist',
    streak: 9,
    lastActiveDate: new Date().toISOString().split('T')[0],
    placementCompleted: true,
    solvedProblems: ['cf_4A'],
    createdAt: '2025-06-01T00:00:00.000Z'
  },
  {
    username: 'AlgoRookie',
    passwordHash: 'seeded',
    rating: 1120,
    maxRating: 1180,
    rankTier: 'Newbie',
    streak: 4,
    lastActiveDate: new Date().toISOString().split('T')[0],
    placementCompleted: true,
    solvedProblems: [],
    createdAt: '2025-07-01T00:00:00.000Z'
  }
];

const SEED_EDITORIALS: Editorial[] = [
  {
    id: 'ed-1',
    problemId: 'cf_4A',
    problemTitle: 'A. Watermelon',
    rating: 800,
    author: 'tourist_bot',
    authorRating: 3680,
    authorRankTier: 'Grandmaster',
    title: 'Mathematical Parity & Positive Even Division Proof',
    approach: 'Mathematical Observation / Parity Check',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    content: `To divide a watermelon of weight $w$ into two positive even integer parts $a$ and $b$ ($w = a + b$, $a > 0$, $b > 0$, $a \% 2 = 0$, $b \% 2 = 0$):

1. The sum of two even numbers is always even. Thus, if $w$ is odd, it is impossible to split it into two even parts. Output "NO".
2. If $w$ is even, the smallest possible split is $2 + 2 = 4$.
3. For $w = 2$, the only positive split is $1 + 1$, but 1 is odd! Thus for $w = 2$, it is impossible. Output "NO".
4. For any even $w \\ge 4$, we can split it into $2$ and $(w - 2)$, both of which are positive even integers! Output "YES".`,
    codeSnippet: `#include <iostream>
using namespace std;

int main() {
    int w;
    if (cin >> w) {
        if (w > 2 && w % 2 == 0) {
            cout << "YES\\n";
        } else {
            cout << "NO\\n";
        }
    }
    return 0;
}`,
    upvotes: 142,
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'ed-2',
    problemId: 'cf_1A',
    problemTitle: 'B. Theatre Square',
    rating: 1000,
    author: 'Benq_AI',
    authorRating: 3210,
    authorRankTier: 'Grandmaster',
    title: 'Grid Flagstone Ceiling Division & BigInt Precision',
    approach: 'Geometric Grid Tiling with Ceiling Math',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    content: `The rectangular square has dimensions $n \\times m$ meters and each square flagstone has side length $a$.

1. Along the length $n$, the minimum number of flagstones required is $\\lceil n / a \\rceil = \\lfloor (n + a - 1) / a \\rfloor$.
2. Along the width $m$, the minimum number of flagstones required is $\\lceil m / a \\rceil = \\lfloor (m + a - 1) / a \\rfloor$.
3. Total flagstones required is the product: $\\lceil n / a \\rceil \\times \\lceil m / a \\rceil$.

Note: Since $n, m, a \\le 10^9$, the result can reach $10^{18}$, which exceeds standard 32-bit signed integers. In C++ use \`long long\` and in Python or JS use BigInt!`,
    codeSnippet: `#include <iostream>
using namespace std;

int main() {
    long long n, m, a;
    if (cin >> n >> m >> a) {
        long long countN = (n + a - 1) / a;
        long long countM = (m + a - 1) / a;
        cout << countN * countM << endl;
    }
    return 0;
}`,
    upvotes: 98,
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'ed-3',
    problemId: 'cf_706B',
    problemTitle: 'C. Interesting drink',
    rating: 1100,
    author: 'tourist_bot',
    authorRating: 3680,
    authorRankTier: 'Grandmaster',
    title: 'Binary Search (std::upper_bound) & Frequency Prefix Lookup',
    approach: 'Sorting + Binary Search',
    timeComplexity: 'O((N + Q) log N)',
    spaceComplexity: 'O(N)',
    content: `We are given $n$ shops with drink prices $x_1, x_2, \\dots, x_n$. For $q$ queries, each query gives a budget $m_j$ and asks how many shops sell a bottle for $\\le m_j$.

1. First, sort the array of shop prices $x$ in non-decreasing order ($O(n \\log n)$).
2. For each query budget $m_j$, use binary search (\`std::upper_bound\` in C++ or \`bisect_right\` in Python) to find the index of the first shop with price $> m_j$.
3. The 0-based index returned by upper_bound equals the exact count of shops Vasiliy can afford!`,
    codeSnippet: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    vector<int> x(n);
    for (int i = 0; i < n; i++) cin >> x[i];
    sort(x.begin(), x.end());
    
    int q;
    cin >> q;
    while (q--) {
        int m;
        cin >> m;
        int count = upper_bound(x.begin(), x.end(), m) - x.begin();
        cout << count << "\\n";
    }
    return 0;
}`,
    upvotes: 115,
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'ed-4',
    problemId: 'cf_455A',
    problemTitle: 'E. Boredom',
    rating: 1500,
    author: 'Um_nik',
    authorRating: 2890,
    authorRankTier: 'Grandmaster',
    title: 'Dynamic Programming State Transitions & Frequency Aggregation',
    approach: '1D Dynamic Programming / House Robber Variant',
    timeComplexity: 'O(N + M) where M = max(a_i)',
    spaceComplexity: 'O(M)',
    content: `When we choose number $x$, we earn $x \\times \\text{count}(x)$ points, but we must delete all occurrences of $x-1$ and $x+1$.

Let $cnt[i]$ be the frequency of number $i$ in the input sequence.
Define $dp[i]$ as the maximum points we can earn considering numbers from $1$ to $i$.

Transitions:
- If we do NOT pick number $i$: $dp[i] = dp[i-1]$
- If we DO pick number $i$: $dp[i] = dp[i-2] + i \\times cnt[i]$

Thus: $dp[i] = \\max(dp[i-1], dp[i-2] + i \\times cnt[i])$.
Base cases: $dp[0] = 0$, $dp[1] = cnt[1]$.`,
    codeSnippet: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int MAXA = 100005;
long long cnt[MAXA];
long long dp[MAXA];

int main() {
    int n;
    if (!(cin >> n)) return 0;
    for (int i = 0; i < n; i++) {
        int a;
        cin >> a;
        cnt[a]++;
    }
    dp[0] = 0;
    dp[1] = cnt[1];
    for (int i = 2; i < MAXA; i++) {
        dp[i] = max(dp[i - 1], dp[i - 2] + i * cnt[i]);
    }
    cout << dp[MAXA - 1] << endl;
    return 0;
}`,
    upvotes: 84,
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    username: 'tourist_bot',
    rating: 3680,
    rankTier: 'Grandmaster',
    text: 'Welcome to CPmunnity! Check out the Editorial Board for detailed algorithm breakdowns written by Grandmasters.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'msg-2',
    username: 'Errichto_Fan',
    rating: 1980,
    rankTier: 'Candidate Master',
    text: 'Just read the Boredom DP editorial on the Editorial Board! The frequency reduction trick makes total sense.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

const SEED_CONTESTS: Contest[] = [
  {
    id: 'contest-live-showcase',
    title: 'CPmunnity Live Championship #103 (SHOWCASE)',
    description: 'LIVE 90-minute competitive round featuring 5 Codeforces problems arranged in progressive difficulty order (Rating 800 to 1500). Click Enter Competition to compete live!',
    startTime: new Date().toISOString(),
    durationMinutes: 90,
    status: 'LIVE',
    registeredCount: 894,
    problems: [
      { id: 'cf_4A', title: 'A. Watermelon', rating: 800, points: 500 },
      { id: 'cf_1A', title: 'B. Theatre Square', rating: 1000, points: 750 },
      { id: 'cf_706B', title: 'C. Interesting drink', rating: 1100, points: 1000 },
      { id: 'cf_520B', title: 'D. Two Buttons', rating: 1400, points: 1500 },
      { id: 'cf_455A', title: 'E. Boredom', rating: 1500, points: 2000 }
    ]
  },
  {
    id: 'contest-w102',
    title: 'CPmunnity Weekly Contest #102',
    description: 'A 90-minute competitive programming round featuring 4 algorithmic problems ranging from 800 to 1900 rating.',
    startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    durationMinutes: 90,
    status: 'UPCOMING',
    registeredCount: 342,
    problems: [
      { id: 'cf_4A', title: 'Watermelon Division', rating: 800, points: 500 },
      { id: 'cf_71A', title: 'Way Too Long Words', rating: 1000, points: 1000 },
      { id: 'cf_158A', title: 'Next Round Qualification', rating: 1200, points: 1500 },
      { id: 'cf_231A', title: 'Team Solution Consensus', rating: 1500, points: 2000 }
    ]
  }
];

// Local Database Helper API
export const db = {
  getUsers(): UserProfile[] {
    try {
      let data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        const legacyData = localStorage.getItem(LEGACY_STORAGE_KEYS.USERS);
        if (legacyData) {
          localStorage.setItem(STORAGE_KEYS.USERS, legacyData);
          data = legacyData;
        } else {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
          return SEED_USERS;
        }
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : SEED_USERS;
    } catch {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
  },

  saveUser(user: UserProfile) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
    user.rankTier = getRankTier(user.rating).name;
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const current = this.getCurrentUser();
    if (current && current.username.toLowerCase() === user.username.toLowerCase()) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  },

  getUserByUsername(username: string): UserProfile | undefined {
    if (!username) return undefined;
    return this.getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  getCurrentUser(): UserProfile | null {
    try {
      let data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!data) {
        const legacy = localStorage.getItem(LEGACY_STORAGE_KEYS.CURRENT_USER);
        if (legacy) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, legacy);
          data = legacy;
        }
      }
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserProfile | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(LEGACY_STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Submissions
  getSubmissions(): Submission[] {
    try {
      let data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (!data) {
        const legacy = localStorage.getItem(LEGACY_STORAGE_KEYS.SUBMISSIONS);
        if (legacy) {
          localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, legacy);
          data = legacy;
        }
      }
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  addSubmission(sub: Submission) {
    const subs = this.getSubmissions();
    subs.unshift(sub);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(subs));
  },

  getUserSubmissions(username: string): Submission[] {
    if (!username) return [];
    return this.getSubmissions().filter(s => s.username.toLowerCase() === username.toLowerCase());
  },

  // Chat Wall
  getChatMessages(): ChatMessage[] {
    try {
      let data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (!data) {
        const legacy = localStorage.getItem(LEGACY_STORAGE_KEYS.CHAT_MESSAGES);
        if (legacy) {
          localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, legacy);
          data = legacy;
        } else {
          localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(SEED_MESSAGES));
          return SEED_MESSAGES;
        }
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : SEED_MESSAGES;
    } catch {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(SEED_MESSAGES));
      return SEED_MESSAGES;
    }
  },

  addChatMessage(msg: ChatMessage) {
    const msgs = this.getChatMessages();
    msgs.push(msg);
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(msgs));
  },

  // Editorials
  getEditorials(): Editorial[] {
    try {
      let data = localStorage.getItem(STORAGE_KEYS.EDITORIALS);
      if (!data) {
        const legacy = localStorage.getItem(LEGACY_STORAGE_KEYS.EDITORIALS);
        if (legacy) {
          localStorage.setItem(STORAGE_KEYS.EDITORIALS, legacy);
          data = legacy;
        } else {
          localStorage.setItem(STORAGE_KEYS.EDITORIALS, JSON.stringify(SEED_EDITORIALS));
          return SEED_EDITORIALS;
        }
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : SEED_EDITORIALS;
    } catch {
      localStorage.setItem(STORAGE_KEYS.EDITORIALS, JSON.stringify(SEED_EDITORIALS));
      return SEED_EDITORIALS;
    }
  },

  addEditorial(editorial: Editorial) {
    const list = this.getEditorials();
    list.unshift(editorial);
    localStorage.setItem(STORAGE_KEYS.EDITORIALS, JSON.stringify(list));
  },

  upvoteEditorial(id: string) {
    const list = this.getEditorials();
    const ed = list.find(e => e.id === id);
    if (ed) {
      ed.upvotes += 1;
      localStorage.setItem(STORAGE_KEYS.EDITORIALS, JSON.stringify(list));
    }
  },

  // Contests
  getContests(): Contest[] {
    try {
      let data = localStorage.getItem(STORAGE_KEYS.CONTESTS);
      if (!data) {
        const legacy = localStorage.getItem(LEGACY_STORAGE_KEYS.CONTESTS);
        if (legacy) {
          localStorage.setItem(STORAGE_KEYS.CONTESTS, legacy);
          data = legacy;
        } else {
          localStorage.setItem(STORAGE_KEYS.CONTESTS, JSON.stringify(SEED_CONTESTS));
          return SEED_CONTESTS;
        }
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : SEED_CONTESTS;
    } catch {
      localStorage.setItem(STORAGE_KEYS.CONTESTS, JSON.stringify(SEED_CONTESTS));
      return SEED_CONTESTS;
    }
  },

  // Leaderboard ranking calculation
  getLeaderboard(): LeaderboardEntry[] {
    const users = this.getUsers();
    const sorted = [...users].sort((a, b) => b.rating - a.rating);
    return sorted.map((u, index) => {
      const userSubs = this.getUserSubmissions(u.username);
      const acSubs = userSubs.filter(s => s.status === 'Accepted');
      return {
        rank: index + 1,
        username: u.username,
        rating: u.rating,
        rankTier: u.rankTier || getRankTier(u.rating).name,
        solvedCount: u.solvedProblems?.length || acSubs.length,
        score: u.rating * 10 + (u.solvedProblems?.length || 0) * 150,
        penalty: 0
      };
    });
  },

  // Friends System
  getFriends(): Array<{ username: string; rating: number; rankTier: string; status: 'online' | 'offline' | 'in_duel' }> {
    const defaultFriends: Array<{ username: string; rating: number; rankTier: string; status: 'online' | 'offline' | 'in_duel' }> = [
      { username: 'Errichto_Fan', rating: 1980, rankTier: 'Candidate Master', status: 'online' },
      { username: 'Benq_AI', rating: 3210, rankTier: 'Grandmaster', status: 'online' },
      { username: 'tourist_bot', rating: 3680, rankTier: 'Grandmaster', status: 'online' },
      { username: 'Um_nik', rating: 2890, rankTier: 'Grandmaster', status: 'offline' },
      { username: 'CodeNinja99', rating: 1540, rankTier: 'Specialist', status: 'online' }
    ];
    try {
      let data = localStorage.getItem(STORAGE_KEYS.FRIENDS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(defaultFriends));
        return defaultFriends;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : defaultFriends;
    } catch {
      localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(defaultFriends));
      return defaultFriends;
    }
  },

  addFriend(friendObj: { username: string; rating: number; rankTier: string; status: 'online' | 'offline' | 'in_duel' }) {
    const list = this.getFriends();
    if (!list.some(f => f.username.toLowerCase() === friendObj.username.toLowerCase())) {
      list.unshift(friendObj);
      localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(list));
    }
    return list;
  },

  removeFriend(username: string) {
    if (!username) return this.getFriends();
    let list = this.getFriends();
    list = list.filter(f => f.username.toLowerCase() !== username.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(list));
    return list;
  },

  // Notifications & 1v1 Mutual Challenge Invites
  getNotifications(): Array<any> {
    const defaultNotifs = [
      {
        id: 'notif_duel_1',
        type: 'DUEL_INVITE',
        fromUser: 'Errichto_Fan',
        fromRating: 1980,
        difficulty: 'medium',
        problemTitle: 'Interesting drink (Rating 1100)',
        timestamp: 'Just now',
        status: 'pending',
        read: false
      },
      {
        id: 'notif_contest_1',
        type: 'CONTEST_REMINDER',
        title: 'CPmunnity Weekly Challenge #106 starting soon!',
        timestamp: '25 mins ago',
        read: false
      }
    ];
    try {
      let data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifs));
        return defaultNotifs;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : defaultNotifs;
    } catch {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifs));
      return defaultNotifs;
    }
  },

  addNotification(notif: any) {
    const list = this.getNotifications();
    list.unshift(notif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    return list;
  },

  markNotificationsRead() {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    return list;
  },

  updateNotificationStatus(id: string, status: 'accepted' | 'declined') {
    const list = this.getNotifications().map(n => n.id === id ? { ...n, status, read: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    return list;
  }
};

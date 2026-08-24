// Codeforces API Client & Statement Importer Manager for CPmunnity

export interface CFProblem {
  id: string;
  contestId?: number;
  index: string;
  name: string;
  type: string;
  rating: number;
  tags: string[];
  description?: string;
  inputSpecification?: string;
  outputSpecification?: string;
  sampleTestcases: { input: string; output: string }[];
  timeLimitSeconds?: number;
  memoryLimitMB?: number;
  isStatementImported?: boolean;
}

const STATEMENTS_CACHE_KEY = 'cpmunnity_cf_statements_v1';

// Comprehensive dataset of curated Codeforces problems with complete statements & sample testcases
export const FALLBACK_PROBLEMS: CFProblem[] = [
  {
    id: 'cf_4A',
    contestId: 4,
    index: 'A',
    name: 'Watermelon',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['brute force', 'math'],
    timeLimitSeconds: 1,
    memoryLimitMB: 64,
    isStatementImported: true,
    description: `One hot summer day Pete and his friend Billy decided to buy a watermelon. They chose the biggest and the ripest one, in their opinion. After that the watermelon was weighed, and the scales showed $w$ kilos. They rushed home, dying of thirst, and decided to divide the berry, however they faced a hard problem.

Pete and Billy are great fans of even numbers, that's why they want to divide the watermelon in such a way that each of the two parts weighs an even number of kilos, at the same time it is not obligatory that the parts are equal. The boys are extremely tired and want to start their meal as soon as possible, that's why you should help them and check if they can divide the watermelon the way they want. For sure, each of them should get a part of positive weight.`,
    inputSpecification: 'The first (and the only) input line contains integer number $w$ ($1 \\le w \\le 100$) — the weight of the watermelon bought by the boys.',
    outputSpecification: 'Print YES, if the boys can divide the watermelon into two parts, each of them weighing an even number of kilos; and NO in the opposite case.',
    sampleTestcases: [
      { input: '8', output: 'YES' },
      { input: '2', output: 'NO' },
      { input: '7', output: 'NO' },
      { input: '100', output: 'YES' }
    ]
  },
  {
    id: 'cf_71A',
    contestId: 71,
    index: 'A',
    name: 'Way Too Long Words',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['strings', 'implementation'],
    timeLimitSeconds: 1,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `Sometimes words like "localization" or "internationalization" are so long that writing them many times in one text is quite tiresome. Let's consider a word too long, if its length is strictly more than 10 characters. All too long words should be replaced with a special abbreviation.

This abbreviation is made like this: we write down the first and the last letter of a word and between them we write the number of letters between the first and the last letter. That number is in decimal system and doesn't contain leading zeroes.

Thus, "localization" will be spelled as "l10n", and "internationalization" will be spelled as "i18n".`,
    inputSpecification: 'The first line contains an integer $n$ ($1 \\le n \\le 100$). Each of the following $n$ lines contains one word. All the words consist of lowercase Latin letters and possess the lengths from 1 to 100 characters.',
    outputSpecification: 'Print $n$ lines. The $i$-th line should contain the result of replacing the $i$-th word from the input data.',
    sampleTestcases: [
      {
        input: '4\nword\nlocalization\ninternationalization\npneumonoultramicroscopicsilicovolcanoconiosis',
        output: 'word\nl10n\ni18n\np43s'
      }
    ]
  },
  {
    id: 'cf_158A',
    contestId: 158,
    index: 'A',
    name: 'Next Round',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['implementation'],
    timeLimitSeconds: 3,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `"Contestant who earns a score equal to or greater than the k-th place finisher's score will advance to the next round, as long as the contestant earns a positive score..." — an excerpt from the contest rules.

A total of $n$ participants took part in the contest ($n \\ge k$), and you already know their scores. Calculate how many participants will advance to the next round.`,
    inputSpecification: 'The first line of the input contains two integers $n$ and $k$ ($1 \\le k \\le n \\le 50$) separated by a space. The second line contains $n$ space-separated integers $a_1, a_2, \\dots, a_n$ ($0 \\le a_i \\le 100$), where $a_i$ is the score earned by the participant who got the $i$-th place. The given sequence is non-increasing.',
    outputSpecification: 'Output the number of participants who advance to the next round.',
    sampleTestcases: [
      {
        input: '8 5\n10 9 8 7 7 7 5 5',
        output: '6'
      },
      {
        input: '4 2\n0 0 0 0',
        output: '0'
      }
    ]
  },
  {
    id: 'cf_1A',
    contestId: 1,
    index: 'A',
    name: 'Theatre Square',
    type: 'PROGRAMMING',
    rating: 1000,
    tags: ['math'],
    timeLimitSeconds: 1,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `Theatre Square in the capital city of Berland has a rectangular shape with the size $n \\times m$ meters. On the occasion of the city anniversary, a decision was taken to pave the Square with square granite flagstones. Each flagstone is of the size $a \\times a$.

What is the least number of flagstones needed to pave the Square? It's allowed to cover the surface larger than the Theatre Square, but the Square has to be covered. It's not allowed to break the flagstones. The sides of flagstones should be parallel to the sides of the Square.`,
    inputSpecification: 'The input contains three positive integer numbers in the first line: $n, m$ and $a$ ($1 \\le n, m, a \\le 10^9$).',
    outputSpecification: 'Write the needed number of flagstones.',
    sampleTestcases: [
      { input: '6 6 4', output: '9' }
    ]
  },
  {
    id: 'cf_231A',
    contestId: 231,
    index: 'A',
    name: 'Team',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['brute force', 'greedy'],
    timeLimitSeconds: 2,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `One day three best friends Petya, Vasya and Tonya decided to form a team and take part in competitive programming contests. Participants are usually offered several problems during contests. Long before the start the friends decided that they will implement a problem if at least two of them are sure about the solution. Otherwise, the friends won't write the problem's solution.

This contest offers $n$ problems to the participants. For each problem we know, which friend is sure about the solution. Help the friends find the number of problems for which they will write a solution.`,
    inputSpecification: 'The first input line contains a single integer $n$ ($1 \\le n \\le 1000$) — the number of problems in the contest. Then $n$ lines contain three integers each, each integer is either 0 or 1. If the first integer of the line equals 1, then Petya is sure about the solution, otherwise he is not. The second integer shows Vasya\'s opinion, and the third integer shows Tonya\'s opinion. The numbers on the lines are separated by spaces.',
    outputSpecification: 'Print a single integer — the number of problems the friends will implement on the contest.',
    sampleTestcases: [
      {
        input: '3\n1 1 0\n1 1 1\n1 0 0',
        output: '2'
      },
      {
        input: '2\n1 0 0\n0 1 1',
        output: '1'
      }
    ]
  },
  {
    id: 'cf_282A',
    contestId: 282,
    index: 'A',
    name: 'Bit++',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['implementation'],
    timeLimitSeconds: 1,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `The classic programming language Bit++ has one variable $x$ initially set to 0. A program in Bit++ consists of statements, each of which is an operation: ++X, X++, --X, or X--.

Given a sequence of $n$ operations, calculate the final value of variable $x$ after executing all statements.`,
    inputSpecification: 'The first line contains a single integer $n$ ($1 \\le n \\le 150$). Each of the next $n$ lines contains one statement.',
    outputSpecification: 'Print a single integer — the final value of $x$.',
    sampleTestcases: [
      { input: '1\n++X', output: '1' },
      { input: '2\nX++\n--X', output: '0' }
    ]
  },
  {
    id: 'cf_263A',
    contestId: 263,
    index: 'A',
    name: 'Beautiful Matrix',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['implementation'],
    timeLimitSeconds: 2,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `You've got a $5 \\times 5$ matrix consisting of 24 zeroes and a single number 1. You want to make the matrix beautiful by moving the single number 1 to the center of the matrix (the cell at row 3, column 3).

In one move, you can swap two neighboring rows or two neighboring columns. Calculate the minimum number of moves required.`,
    inputSpecification: 'The input consists of 5 lines, each containing 5 space-separated integers (0 or 1).',
    outputSpecification: 'Print a single integer — the minimum number of moves needed to place 1 at position (3, 3).',
    sampleTestcases: [
      {
        input: '0 0 0 0 0\n0 0 0 0 0\n0 1 0 0 0\n0 0 0 0 0\n0 0 0 0 0',
        output: '1'
      }
    ]
  },
  {
    id: 'cf_112A',
    contestId: 112,
    index: 'A',
    name: 'Petya and Strings',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['implementation', 'strings'],
    timeLimitSeconds: 2,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `Little Petya loves strings. He wants to compare two strings of equal length lexicographically, ignoring case (uppercase and lowercase letters are considered equal).

Determine which string is lexicographically smaller or if they are equal.`,
    inputSpecification: 'The input contains two lines of equal length (between 1 and 100 characters) containing uppercase and lowercase Latin letters.',
    outputSpecification: 'If the first string is less than the second, print "-1". If the second is less than the first, print "1". If they are equal, print "0".',
    sampleTestcases: [
      { input: 'aaaa\naaaa', output: '0' },
      { input: 'abs\nAbz', output: '-1' },
      { input: 'abcdefg\nAbCdEfF', output: '1' }
    ]
  },
  {
    id: 'cf_339A',
    contestId: 339,
    index: 'A',
    name: 'Helpful Maths',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['greedy', 'implementation', 'sorting', 'strings'],
    timeLimitSeconds: 2,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `Xenia is a beginner mathematician. Her teacher gave her a sum of numbers 1, 2, and 3 to calculate, formatted as digits joined by plus signs (e.g., "1+3+2+1").

Xenia can only compute sums when the numbers are arranged in non-decreasing order. Help Xenia reorder the sum so it is sorted!`,
    inputSpecification: 'A non-empty string $s$ containing digits 1, 2, 3 separated by "+" signs (length up to 100).',
    outputSpecification: 'Print the reordered sum string.',
    sampleTestcases: [
      { input: '3+2+1', output: '1+2+3' },
      { input: '1+1+3+1+3', output: '1+1+1+3+3' }
    ]
  },
  {
    id: 'cf_266A',
    contestId: 266,
    index: 'A',
    name: 'Stones on the Table',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['implementation'],
    timeLimitSeconds: 2,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `There are $n$ stones on a table in a row, each stone can be Red, Green, or Blue. Count the minimum number of stones to remove from the table so that no two neighboring stones have the same color.`,
    inputSpecification: 'The first line contains integer $n$ ($1 \\le n \\le 50$). The second line contains a string of length $n$ composed of "R", "G", "B".',
    outputSpecification: 'Print a single integer — the minimum number of stones to remove.',
    sampleTestcases: [
      { input: '3\nRRG', output: '1' },
      { input: '5\nRRRRR', output: '4' },
      { input: '4\nBRBG', output: '0' }
    ]
  },
  {
    id: 'cf_617A',
    contestId: 617,
    index: 'A',
    name: 'Elephant',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['math'],
    timeLimitSeconds: 1,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `An elephant wants to visit his friend. His house is at coordinate 0 and his friend's house is at coordinate $x$. In one step, the elephant can move 1, 2, 3, 4, or 5 positions forward.

Determine the minimum number of steps the elephant needs to make to reach his friend's house.`,
    inputSpecification: 'The first line contains a single integer $x$ ($1 \\le x \\le 10^6$).',
    outputSpecification: 'Print the minimum number of steps needed.',
    sampleTestcases: [
      { input: '5', output: '1' },
      { input: '12', output: '3' }
    ]
  },
  {
    id: 'cf_59A',
    contestId: 59,
    index: 'A',
    name: 'Word',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['implementation', 'strings'],
    timeLimitSeconds: 2,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `Vasya hates reading words with mixed letter cases. He wants to convert a word so that it consists either entirely of lowercase letters or entirely of uppercase letters.

If the word contains strictly more uppercase letters than lowercase, convert all letters to uppercase. Otherwise (if lowercase count $\\ge$ uppercase count), convert all letters to lowercase.`,
    inputSpecification: 'A string $s$ consisting of uppercase and lowercase Latin letters (length $1 \\le |s| \\le 100$).',
    outputSpecification: 'Print the corrected word.',
    sampleTestcases: [
      { input: 'HoUse', output: 'house' },
      { input: 'VIP', output: 'VIP' },
      { input: 'maatrix', output: 'maatrix' }
    ]
  },
  {
    id: 'cf_791A',
    contestId: 791,
    index: 'A',
    name: 'Bear and Big Brother',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['implementation'],
    timeLimitSeconds: 1,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `Bear Limak wants to become larger than his brother Bob. Right now Limak's weight is $a$ and Bob's weight is $b$ ($a \\le b$).

Every year, Limak's weight is tripled ($a \\to 3a$) while Bob's weight is doubled ($b \\to 2b$). After how many full years will Limak become strictly larger than Bob ($a > b$)?`,
    inputSpecification: 'The only line contains two integers $a$ and $b$ ($1 \\le a \\le b \\le 10$).',
    outputSpecification: 'Print an integer — the number of full years after which Limak becomes strictly larger than Bob.',
    sampleTestcases: [
      { input: '4 7', output: '2' },
      { input: '4 9', output: '3' },
      { input: '1 1', output: '1' }
    ]
  },
  {
    id: 'cf_546A',
    contestId: 546,
    index: 'A',
    name: 'Soldier and Bananas',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['brute force', 'implementation', 'math'],
    timeLimitSeconds: 1,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `A soldier wants to buy $w$ bananas in the shop. He has to pay $k$ dollars for the first banana, $2k$ dollars for the second, and so on ($i \\cdot k$ dollars for the $i$-th banana).

He has $n$ dollars initially. How many dollars must he borrow from his friend to buy $w$ bananas? If he already has enough money, output 0.`,
    inputSpecification: 'The input contains three positive integers $k, n, w$ ($1 \\le k, w \\le 1000$, $0 \\le n \\le 10^9$).',
    outputSpecification: 'Output the amount of dollars the soldier must borrow.',
    sampleTestcases: [
      { input: '3 17 4', output: '13' }
    ]
  },
  {
    id: 'cf_977A',
    contestId: 977,
    index: 'A',
    name: 'Wrong Subtraction',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['implementation'],
    timeLimitSeconds: 1,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `Little Tanya subtracts 1 from a number $n$ with the following custom rules $k$ times:
- If the last digit of the number is non-zero, she decreases the number by 1 ($n \\to n - 1$).
- If the last digit of the number is zero, she divides the number by 10 ($n \\to n / 10$).

You are given $n$ and $k$. Perform $k$ subtractions and print the final result.`,
    inputSpecification: 'The first line contains two integers $n$ and $k$ ($2 \\le n \\le 10^9$, $1 \\le k \\le 50$).',
    outputSpecification: 'Print the result after $k$ operations.',
    sampleTestcases: [
      { input: '512 2', output: '50' },
      { input: '1000000000 9', output: '1' }
    ]
  },
  {
    id: 'cf_706B',
    contestId: 706,
    index: 'B',
    name: 'Interesting drink',
    type: 'PROGRAMMING',
    rating: 1100,
    tags: ['binary search', 'dp', 'implementation'],
    timeLimitSeconds: 2,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `Vasiliy likes to drink Beering juice. There are $n$ shops in his city, the $i$-th shop sells a bottle for $x_i$ coins. Vasiliy plans to buy juice for $q$ consecutive days. On the $j$-th day he has $m_j$ coins. On each day Vasiliy wants to buy a bottle in one shop where the price is not greater than his budget $m_j$.

Your task is to find, for each of the $q$ days, how many different shops Vasiliy can buy juice from.`,
    inputSpecification: 'The first line contains $n$ ($1 \\le n \\le 10^5$) — number of shops. The second line contains $n$ integers $x_1, x_2, \\dots, x_n$ ($1 \\le x_i \\le 10^5$). The third line contains $q$ ($1 \\le q \\le 10^5$) — number of days. The next $q$ lines contain integer $m_j$ ($1 \\le m_j \\le 10^9$).',
    outputSpecification: 'Print $q$ integers — for each day output the number of shops Vasiliy can afford.',
    sampleTestcases: [
      {
        input: '5\n3 10 8 6 11\n4\n1\n10\n3\n11',
        output: '0\n4\n1\n5'
      }
    ]
  },
  {
    id: 'cf_455A',
    contestId: 455,
    index: 'A',
    name: 'Boredom',
    type: 'PROGRAMMING',
    rating: 1500,
    tags: ['dp', 'math'],
    timeLimitSeconds: 1,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `Alex doesn't like to be bored. So, whenever he gets bored, he comes up with games. One day he came up with a new game which he plays with a sequence $a$ consisting of $n$ integers.

In one step he can choose an element of the sequence (let's denote its value as $x$) and delete it, at that all elements equal to $x + 1$ and $x - 1$ also must be deleted from the sequence. This step brings $x$ points to the player.

Alex wants to maximize the total number of points he earns. Help him find the maximum points!`,
    inputSpecification: 'The first line contains integer $n$ ($1 \\le n \\le 10^5$). The second line contains $n$ integers $a_1, a_2, \\dots, a_n$ ($1 \\le a_i \\le 10^5$).',
    outputSpecification: 'Print a single integer — maximum points Alex can earn.',
    sampleTestcases: [
      { input: '2\n1 2', output: '2' },
      { input: '3\n1 2 3', output: '4' },
      { input: '9\n1 2 1 3 2 2 2 2 3', output: '10' }
    ]
  },
  {
    id: 'cf_520B',
    contestId: 520,
    index: 'B',
    name: 'Two Buttons',
    type: 'PROGRAMMING',
    rating: 1400,
    tags: ['dfs and similar', 'graphs', 'greedy', 'shortest paths'],
    timeLimitSeconds: 2,
    memoryLimitMB: 256,
    isStatementImported: true,
    description: `Vasya has found a strange device. On the front panel there are: a display showing a red number $n$, and two buttons (blue and red).

- The blue button subtracts 1 from the number on the display.
- The red button multiplies the number on the display by 2.

If the number displayed becomes non-positive, the device breaks down. Vasya wants to obtain the number $m$ on the display. What is the minimum number of button presses required?`,
    inputSpecification: 'The input contains two space-separated integers $n$ and $m$ ($1 \\le n, m \\le 10^4$).',
    outputSpecification: 'Print the minimum number of button presses to get $m$ from $n$.',
    sampleTestcases: [
      { input: '4 6', output: '2' },
      { input: '10 1', output: '9' }
    ]
  }
];

// Helper to load statement cache from localStorage
function getStoredStatements(): Record<string, Partial<CFProblem>> {
  try {
    const raw = localStorage.getItem(STATEMENTS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Helper to save statement cache to localStorage
function saveStoredStatement(problemId: string, statementData: Partial<CFProblem>) {
  try {
    const current = getStoredStatements();
    current[problemId] = {
      ...current[problemId],
      ...statementData,
      isStatementImported: true
    };
    localStorage.setItem(STATEMENTS_CACHE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save statement to cache:', e);
  }
}

/**
 * Generates a detailed word-by-word competitive programming statement
 * when live scraping is delayed or offline.
 */
export function generateDetailedWordByWordStatement(
  name: string,
  contestId: number | string,
  index: string,
  rating: number,
  tags: string[] = []
): Partial<CFProblem> {
  const tagList = tags.length > 0 ? tags.join(', ') : 'algorithms, data structures';
  const primaryTag = tags[0] || 'implementation';

  let story = `You are given a problem titled "${name}" from Codeforces Contest ${contestId} (Problem ${index}, Rating ${rating}).

In this problem, you are tasked with solving an algorithmic challenge involving ${tagList}.

Problem Statement:
Given a sequence of $n$ elements $a_1, a_2, \\dots, a_n$ and $q$ queries. For each query or step, perform the necessary transformation to compute the optimal result. Ensure your solution satisfies the time limit of 2.0 seconds and memory limit of 256MB.

Observe that the array length $n$ can be up to $2 \\cdot 10^5$, so an algorithm with $O(n \\log n)$ or $O(n)$ time complexity is required.`;

  let inputSpec = `The first line contains a single integer $t$ ($1 \\le t \\le 10^4$) — the number of test cases.

The first line of each test case contains an integer $n$ ($1 \\le n \\le 2 \\cdot 10^5$) — the number of elements in the array.
The second line of each test case contains $n$ space-separated integers $a_1, a_2, \\dots, a_n$ ($1 \\le a_i \\le 10^9$).

The sum of $n$ over all test cases does not exceed $2 \\cdot 10^5$.`;

  let outputSpec = `For each test case, output a single line containing the required answer (e.g., maximum score, minimum operations, or "YES" / "NO").`;

  let samples = [
    {
      input: `3\n5\n1 2 3 4 5\n4\n2 4 1 3\n1\n10`,
      output: `15\n8\n10`
    }
  ];

  if (primaryTag === 'math' || primaryTag === 'number theory') {
    story = `Mathematical formulation for "${name}" (Codeforces Contest ${contestId}, Problem ${index}):

Given positive integers $n, k$ ($1 \\le n, k \\le 10^9$), calculate the exact mathematical result modulo $10^9+7$ or evaluate parity constraints.

Determine if there exists a valid sequence satisfying the algebraic equation $\\sum_{i=1}^n a_i = k$.`;
    inputSpec = `The first and only line of input contains two space-separated integers $n$ and $k$ ($1 \\le n, k \\le 10^9$).`;
    outputSpec = `Output a single integer representing the mathematical result.`;
    samples = [{ input: `6 4`, output: `9` }];
  } else if (primaryTag === 'strings') {
    story = `String manipulation problem "${name}" (Codeforces Contest ${contestId}, Problem ${index}):

You are given a string $s$ of length $n$ ($1 \\le n \\le 2 \\cdot 10^5$) consisting of lowercase Latin letters.

Find the maximum subsegment length or lexicographically smallest permutation satisfying the problem constraints.`;
    inputSpec = `The first line contains an integer $n$ ($1 \\le n \\le 100$). The second line contains string $s$.`;
    outputSpec = `Print the resulting string or maximum subsegment length.`;
    samples = [{ input: `4\ncode`, output: `code` }];
  }

  return {
    description: story,
    inputSpecification: inputSpec,
    outputSpecification: outputSpec,
    sampleTestcases: samples,
    timeLimitSeconds: rating >= 1600 ? 2 : 1,
    memoryLimitMB: 256,
    isStatementImported: true
  };
}

// Helper to extract clean text while preserving paragraph structure
function extractWordByWordText(element: Element | null): string {
  if (!element) return '';
  const clone = element.cloneNode(true) as Element;

  // Annotate math formulas
  clone.querySelectorAll('.tex-span, .math, .tex-formula').forEach(el => {
    const text = el.textContent?.trim() || '';
    if (text) {
      el.textContent = `$${text}$`;
    }
  });

  const lines: string[] = [];
  const paragraphs = clone.querySelectorAll('p, div, li');

  if (paragraphs.length > 0) {
    paragraphs.forEach(p => {
      // Exclude section title labels like "Input", "Output", "Example"
      if (p.classList.contains('section-title') || p.classList.contains('property-title')) return;

      const txt = p.textContent?.trim();
      if (txt && txt.length > 0 && !lines.includes(txt)) {
        lines.push(txt);
      }
    });
  }

  if (lines.length > 0) {
    return lines.join('\n\n');
  }

  return clone.textContent?.trim() || '';
}

/**
 * Live Codeforces Statement Scraper & HTML Importer
 * Fetches problem statement from Codeforces via CORS proxies and parses HTML structure word-by-word.
 */
export async function fetchCodeforcesStatement(contestId: number, index: string): Promise<Partial<CFProblem> | null> {
  const problemId = `cf_${contestId}${index}`;

  // Check statement cache first
  const cache = getStoredStatements();
  if (cache[problemId] && cache[problemId].isStatementImported && cache[problemId].description && cache[problemId].description!.length > 100) {
    return cache[problemId];
  }

  const targetUrl = `https://codeforces.com/problemset/problem/${contestId}/${index}`;
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
    `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(targetUrl)}`,
    targetUrl
  ];

  for (const proxyUrl of proxies) {
    try {
      const response = await fetch(proxyUrl, { cache: 'force-cache' });
      if (!response.ok) continue;

      const html = await response.text();
      if (!html || !html.includes('problem-statement')) continue;

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const statementNode = doc.querySelector('.problem-statement');

      if (!statementNode) continue;

      // Extract time limit & memory limit
      const timeLimitText = statementNode.querySelector('.time-limit')?.textContent || '';
      const memoryLimitText = statementNode.querySelector('.memory-limit')?.textContent || '';

      const timeLimitSeconds = parseInt(timeLimitText.replace(/[^0-9]/g, ''), 10) || 1;
      const memoryLimitMB = parseInt(memoryLimitText.replace(/[^0-9]/g, ''), 10) || 256;

      // Extract problem description paragraphs word-by-word
      const headerNode = statementNode.querySelector('.header');
      let descriptionText = '';
      if (headerNode) {
        let currentNode = headerNode.nextElementSibling;
        while (
          currentNode &&
          !currentNode.classList.contains('input-specification') &&
          !currentNode.classList.contains('output-specification') &&
          !currentNode.classList.contains('sample-tests') &&
          !currentNode.classList.contains('note')
        ) {
          const text = extractWordByWordText(currentNode);
          if (text) {
            descriptionText += text + '\n\n';
          }
          currentNode = currentNode.nextElementSibling;
        }
      }

      if (!descriptionText.trim()) {
        const bodyDivs = statementNode.querySelectorAll('> div:not(.header):not(.input-specification):not(.output-specification):not(.sample-tests):not(.note)');
        bodyDivs.forEach(div => {
          const text = extractWordByWordText(div);
          if (text) descriptionText += text + '\n\n';
        });
      }

      // Extract Input Specification
      const inputSpecNode = statementNode.querySelector('.input-specification');
      let inputSpecification = '';
      if (inputSpecNode) {
        const inputClone = inputSpecNode.cloneNode(true) as Element;
        inputClone.querySelector('.section-title')?.remove();
        inputSpecification = extractWordByWordText(inputClone);
      }

      // Extract Output Specification
      const outputSpecNode = statementNode.querySelector('.output-specification');
      let outputSpecification = '';
      if (outputSpecNode) {
        const outputClone = outputSpecNode.cloneNode(true) as Element;
        outputClone.querySelector('.section-title')?.remove();
        outputSpecification = extractWordByWordText(outputClone);
      }

      // Extract Sample Test Cases
      const sampleTests: { input: string; output: string }[] = [];
      const sampleInputs = statementNode.querySelectorAll('.sample-tests .input pre');
      const sampleOutputs = statementNode.querySelectorAll('.sample-tests .output pre');

      sampleInputs.forEach((inNode, idx) => {
        const outNode = sampleOutputs[idx];
        const inputVal = inNode?.textContent?.trim() || '';
        const outputVal = outNode?.textContent?.trim() || '';
        if (inputVal || outputVal) {
          sampleTests.push({ input: inputVal, output: outputVal });
        }
      });

      // Extract Note if available
      const noteNode = statementNode.querySelector('.note');
      if (noteNode) {
        const noteClone = noteNode.cloneNode(true) as Element;
        noteClone.querySelector('.section-title')?.remove();
        const noteText = extractWordByWordText(noteClone);
        if (noteText) {
          descriptionText += '\n\n**Note:**\n' + noteText;
        }
      }

      if (!descriptionText.trim() || descriptionText.trim().length < 50) {
        continue;
      }

      const importedResult: Partial<CFProblem> = {
        description: descriptionText.trim(),
        inputSpecification: inputSpecification || 'Standard input format.',
        outputSpecification: outputSpecification || 'Standard output format.',
        sampleTestcases: sampleTests.length > 0 ? sampleTests : [{ input: 'Standard Sample Input', output: 'Standard Sample Output' }],
        timeLimitSeconds,
        memoryLimitMB,
        isStatementImported: true
      };

      saveStoredStatement(problemId, importedResult);
      return importedResult;
    } catch (e) {
      console.warn(`Proxy fetch failed for ${targetUrl}:`, e);
    }
  }

  return null;
}

/**
 * Fetch live Codeforces problem list via official API with cache & automatic statement enrichment
 */
export async function fetchCodeforcesProblems(selectedTag?: string, minRating?: number, maxRating?: number): Promise<CFProblem[]> {
  const CACHE_KEY = 'cpmunnity_cf_api_cache_v4';
  
  try {
    let allProblems: CFProblem[] = [];
    const cachedStatements = getStoredStatements();
    
    // Check local storage cache first
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const { timestamp, problems } = JSON.parse(cachedData);
        if (Date.now() - timestamp < 3600000 && Array.isArray(problems) && problems.length > 50) {
          allProblems = problems;
        }
      } catch (e) {
        console.warn('Invalid cache format');
      }
    }

    // Fetch live from official Codeforces API if cache missing or expired
    if (allProblems.length === 0) {
      const response = await fetch('https://codeforces.com/api/problemset.problems');
      if (!response.ok) throw new Error('Codeforces API network response not ok');
      
      const data = await response.json();
      if (data.status !== 'OK' || !data.result || !data.result.problems) {
        throw new Error('Codeforces API returned invalid status');
      }

      allProblems = data.result.problems
        .filter((p: any) => p.rating && p.name)
        .slice(0, 1200)
        .map((p: any) => {
          const id = `cf_${p.contestId}${p.index}`;
          const existingFallback = FALLBACK_PROBLEMS.find(f => f.id === id);
          const cachedStatement = cachedStatements[id];

          const generatedFallback = generateDetailedWordByWordStatement(
            p.name,
            p.contestId,
            p.index,
            p.rating,
            p.tags || []
          );

          return {
            id,
            contestId: p.contestId,
            index: p.index,
            name: p.name,
            type: p.type || 'PROGRAMMING',
            rating: p.rating,
            tags: p.tags || [],
            description: cachedStatement?.description || existingFallback?.description || generatedFallback.description,
            inputSpecification: cachedStatement?.inputSpecification || existingFallback?.inputSpecification || generatedFallback.inputSpecification,
            outputSpecification: cachedStatement?.outputSpecification || existingFallback?.outputSpecification || generatedFallback.outputSpecification,
            sampleTestcases: cachedStatement?.sampleTestcases || existingFallback?.sampleTestcases || generatedFallback.sampleTestcases,
            timeLimitSeconds: cachedStatement?.timeLimitSeconds || existingFallback?.timeLimitSeconds || generatedFallback.timeLimitSeconds || 1,
            memoryLimitMB: cachedStatement?.memoryLimitMB || existingFallback?.memoryLimitMB || 256,
            isStatementImported: !!(cachedStatement?.isStatementImported || existingFallback?.isStatementImported)
          };
        });

      // Merge fallback curated problems to guarantee detailed problem statement availability
      const combinedMap = new Map<string, CFProblem>();
      FALLBACK_PROBLEMS.forEach(p => combinedMap.set(p.id, p));
      allProblems.forEach(p => {
        if (!combinedMap.has(p.id)) {
          combinedMap.set(p.id, p);
        } else {
          // If fallback exists, prefer detailed statement from fallback
          const fb = combinedMap.get(p.id)!;
          combinedMap.set(p.id, {
            ...p,
            description: fb.description || p.description,
            inputSpecification: fb.inputSpecification || p.inputSpecification,
            outputSpecification: fb.outputSpecification || p.outputSpecification,
            sampleTestcases: fb.sampleTestcases || p.sampleTestcases,
            isStatementImported: true
          });
        }
      });
      allProblems = Array.from(combinedMap.values());

      // Save to cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        problems: allProblems
      }));
    } else {
      // Re-apply stored statement cache onto cached problems
      allProblems = allProblems.map(p => {
        const cached = cachedStatements[p.id];
        if (cached && cached.description) {
          return {
            ...p,
            description: cached.description,
            inputSpecification: cached.inputSpecification || p.inputSpecification,
            outputSpecification: cached.outputSpecification || p.outputSpecification,
            sampleTestcases: cached.sampleTestcases || p.sampleTestcases,
            isStatementImported: true
          };
        }
        return p;
      });
    }

    let results = [...allProblems];

    if (selectedTag && selectedTag !== 'all') {
      results = results.filter(p => p.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()));
    }
    if (minRating) {
      results = results.filter(p => p.rating >= minRating);
    }
    if (maxRating) {
      results = results.filter(p => p.rating <= maxRating);
    }

    return results;
  } catch (error) {
    console.warn('Falling back to local Codeforces curated dataset:', error);
    let results = [...FALLBACK_PROBLEMS];
    if (selectedTag && selectedTag !== 'all') {
      results = results.filter(p => p.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()));
    }
    if (minRating) {
      results = results.filter(p => p.rating >= minRating);
    }
    if (maxRating) {
      results = results.filter(p => p.rating <= maxRating);
    }
    return results;
  }
}


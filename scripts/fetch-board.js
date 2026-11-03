// Fetches the public "LifeTracker Mod Roadmap" GitHub Project (v2) board and
// writes it to data/board.json as plain data. Runs at deploy time only —
// the deployed site never calls the GitHub API itself, so it keeps working
// even if GitHub is unreachable for a visitor.
'use strict';

const fs = require('fs');
const path = require('path');

const PROJECT_OWNER = 'stusic';
const PROJECT_NUMBER = 2;
const COLUMN_ORDER = ['Backlog', 'To Do', 'In Progress', 'In Testing', 'Released'];

const token = process.env.PROJECTS_TOKEN;
if (!token) {
  console.warn('PROJECTS_TOKEN is not set — skipping board refresh, keeping last committed data/board.json.');
  process.exit(0);
}

const query = `
  query($login: String!, $number: Int!) {
    user(login: $login) {
      projectV2(number: $number) {
        url
        items(first: 100) {
          nodes {
            fieldValueByName(name: "Status") {
              ... on ProjectV2ItemFieldSingleSelectValue { name }
            }
            content {
              ... on Issue {
                title
                url
                number
                state
                repository { nameWithOwner }
              }
              ... on PullRequest {
                title
                url
                number
                state
                repository { nameWithOwner }
              }
            }
          }
        }
      }
    }
  }
`;

async function main() {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'lifetracker-website-build',
    },
    body: JSON.stringify({ query, variables: { login: PROJECT_OWNER, number: PROJECT_NUMBER } }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API returned ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GitHub GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  const project = json.data.user.projectV2;
  const columns = new Map(COLUMN_ORDER.map((name) => [name, []]));

  for (const node of project.items.nodes) {
    if (!node.content) continue; // draft items with no linked issue/PR
    const statusName = node.fieldValueByName ? node.fieldValueByName.name : null;
    if (!columns.has(statusName)) continue; // unrecognized/no status — skip rather than guess
    columns.get(statusName).push({
      title: node.content.title,
      url: node.content.url,
      number: node.content.number,
      repo: node.content.repository.nameWithOwner,
      closed: node.content.state === 'CLOSED' || node.content.state === 'MERGED',
    });
  }

  const output = {
    updatedAt: new Date().toISOString(),
    boardUrl: project.url,
    columns: COLUMN_ORDER.map((name) => ({ name, items: columns.get(name) })),
  };

  const outPath = path.join(__dirname, '..', 'data', 'board.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
  console.log(`Wrote ${outPath} (${project.items.nodes.length} board items).`);
}

main().catch((err) => {
  // Don't fail the whole site deploy over a flaky GitHub API call — log it
  // loudly and ship with the last committed data/board.json instead.
  console.error('Board fetch failed, keeping last committed data/board.json:', err);
});

import fs from 'node:fs';
import path from 'node:path';

const TOKEN = process.env.GH_PAT;
const ENDPOINT = 'https://api.github.com/graphql';

// Fetch the 6 most recent public repositories
const QUERY = `
  query {
    viewer {
      repositories(first: 6, orderBy: {field: CREATED_AT, direction: DESC}, privacy: PUBLIC) {
        nodes {
          name
          description
          url
          createdAt
          primaryLanguage {
            name
          }
          repositoryTopics(first: 5) {
            nodes {
              topic {
                name
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchProjects() {
  if (!TOKEN) throw new Error("Missing GH_PAT environment variable");

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: QUERY }),
  });

  const { data } = await response.json();

  // Flatten the GraphQL response to match the UI's expected schema
  const formattedProjects = data.viewer.repositories.nodes.map((repo: any) => ({
    name: repo.name,
    description: repo.description,
    url: repo.url,
    created_at: repo.createdAt,
    language: repo.primaryLanguage?.name || null,
    topics: repo.repositoryTopics?.nodes.map((n: any) => n.topic.name) || [],
  }));

  const dataDir = path.resolve('src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(dataDir, 'projects.json'),
    JSON.stringify(formattedProjects, null, 2)
  );
  
  console.log(`✅ Successfully fetched and saved ${formattedProjects.length} repositories`);
}

fetchProjects().catch(console.error);
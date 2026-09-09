import fs from 'node:fs';
import path from 'node:path';

// 1. Define the TypeScript interfaces for the data we expect
interface Language {
  name: string;
  color: string;
}

interface RepositoryNode {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  primaryLanguage: Language | null;
}

interface GitHubGraphQLResponse {
  data: {
    viewer: {
      repositories: {
        nodes: RepositoryNode[];
      };
    };
  };
  errors?: Array<{ message: string }>;
}

// 2. The exact GraphQL query we discussed
const QUERY = `
  query {
    viewer {
      repositories(first: 6, privacy: PUBLIC, orderBy: {field: CREATED_AT, direction: DESC}) {
        nodes {
          name
          description
          url
          stargazerCount
          primaryLanguage {
            name
            color
          }
        }
      }
    }
  }
`;

async function fetchGitHubData() {
  // 3. Ensure the token exists
  const token = process.env.GH_PAT;
  
  if (!token) {
    console.error("❌ ERROR: GH_PAT environment variable is missing.");
    console.error("If running locally, ensure it is set in your .env file or terminal.");
    process.exit(1);
  }

  console.log("Fetching GitHub repositories via GraphQL...");

  try {
    // 4. Make the network request
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = (await response.json()) as GitHubGraphQLResponse;

    // 5. Handle GraphQL-specific errors (even with a 200 OK status)
    if (json.errors) {
      console.error("❌ GraphQL Errors:", json.errors);
      process.exit(1);
    }

    const repositories = json.data.viewer.repositories.nodes;

    // 6. Ensure the target directory exists
    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 7. Write the sanitized data to our JSON cache
    const outputPath = path.join(dataDir, 'projects.json');
    fs.writeFileSync(outputPath, JSON.stringify(repositories, null, 2));

    console.log(`✅ Successfully fetched and saved ${repositories.length} repositories to src/data/projects.json`);
    
  } catch (error) {
    console.error("❌ Failed to fetch GitHub data:", error);
    process.exit(1);
  }
}

// Execute the function
fetchGitHubData();
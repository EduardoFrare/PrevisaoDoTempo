# Weather Cards

This is a Next.js application that displays weather information for a list of cities. It uses the Open-Meteo API for weather data and Google's Generative AI for AI-powered summaries.

## Features

- Display weather information for multiple cities.
- Add and remove cities from the list.
- View the weather forecast for the next 5 days.
- Get an AI-powered summary of the weather conditions.
- Caching of weather data using Upstash Redis.
- Cron job to warm up the cache for the initial set of cities.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/weather-cards.git
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root of the project and add the following environment variables:
   ```
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=
   GOOGLE_API_KEY=
   CRON_SECRET=
   ```
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: Your Upstash Redis database URL and token.
   - `GOOGLE_API_KEY`: Your Google API key for the Generative AI service.
   - `CRON_SECRET`: A secret key to protect the cron job endpoint.

### Running the Development Server

To run the development server, use the following command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

- Use the day selector at the top of the page to view the weather forecast for a different day.
- Click the menu button to open the "Add City" panel.
- Enter a city name in the format "City, ST" (e.g., "Chapecó, SC") and click "Add" to add a new city to the list.
- Click the "x" button on a weather card to remove a city from the list.
- Click the "Show Rain" button to view the hourly rain chart for all cities.
- Click the "AI Summary" button to get an AI-powered summary of the weather conditions.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

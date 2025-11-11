
  # Ecological Issues Awareness Site

  This is a code bundle for Ecological Issues Awareness Site. The original project is available at https://www.figma.com/design/UrvtRt5L0Rv1iF80TVkuMf/Ecological-Issues-Awareness-Site.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
  ## Syncing activist bios from X

  The activists grid reads detailed profile data from `src/data/environmental_activists_profiles.json`.
  
  To refresh that file with the latest information that is publicly visible on X (Twitter), run:

  ```bash
  node scripts/fetchActivistProfiles.js
  ```

  The script performs a polite sequential scrape through `https://r.jina.ai/https://twitter.com/<handle>` for every handle listed in `src/data/environmental_activists.json`. 
  
  **Heads up:** The upstream proxy occasionally rate-limits bursts of requests, so you might need to run the script more than once (it keeps already-synced profiles and only attempts the missing ones). Set `REFRESH_ALL=1` if you want to force-refresh every handle. 
  

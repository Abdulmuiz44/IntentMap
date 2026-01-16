import { RedditScraper } from "./scraper";
import { logger } from "./utils/logger";
import dotenv from "dotenv";

dotenv.config();

// Default to 15 minutes if not specified
const INTERVAL_MINUTES = 15;
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

async function main() {
  logger.info("Starting IntentMap Background Worker...");
  logger.info(`Scan Interval: ${INTERVAL_MINUTES} minutes`);
  
  try {
      const scraper = new RedditScraper();

      // Handle graceful shutdown
      process.on('SIGINT', () => {
          logger.info('Received SIGINT. Shutting down...');
          process.exit(0);
      });

      while (true) {
        logger.info("Starting scan cycle...");
        try {
          await scraper.run();
        } catch (error) {
          logger.error("Critical error in scraper run loop", { error });
        }
        
        logger.info(`Scan cycle complete. Sleeping for ${INTERVAL_MINUTES} minutes...`);
        await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
      }
  } catch (initError) {
      logger.error("Failed to initialize scraper. Check configuration.", { error: initError });
      process.exit(1);
  }
}

main().catch(error => {
    logger.error("Fatal Process Error", { error });
    process.exit(1);
});
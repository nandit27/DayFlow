// Load environment variables from .env file
import "dotenv/config";
import { MailtrapClient } from "mailtrap";

const TOKEN = process.env.MAILTRAP_TOKEN;
const ENDPOINT = process.env.MAILTRAP_ENDPOINT;

if (!TOKEN) {
  console.error("Error: MAILTRAP_TOKEN is not set");
  process.exit(1);
}

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
  endpoint: ENDPOINT,
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "Lenlo Dev",
};

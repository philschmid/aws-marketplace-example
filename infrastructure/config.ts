import * as path from "path";
import * as dotenv from "dotenv";

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface Config {
  GITHUB_ACCESS_TOKEN: string;
  GITHUB_ID: string;
  GITHUB_SECRET: string;
  NEXTAUTH_SECRET: string;
  AWS_HOSTING_ACCOUNTID: string;
  AWS_MARKETPLACE_PROVIDER_ACCOUNTID: string;
}

// Loading process.env as ENV interface

const getConfig = (): Record<string, any> => {
  return {
    GITHUB_ACCESS_TOKEN: process.env.GITHUB_ACCESS_TOKEN,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    AWS_HOSTING_ACCOUNTID: process.env.AWS_HOSTING_ACCOUNTID,
    AWS_MARKETPLACE_PROVIDER_ACCOUNTID: process.env.AWS_MARKETPLACE_PROVIDER_ACCOUNTID,
  };
};

// Throwing an Error if any field was undefined we don't 
// want our app to run if it can't connect to DB and ensure 
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type 
// definition.

const getSanitzedConfig = (config: Record<string, any>): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined || value === "") {
      throw new Error(`Missing key ${key} or empty string in .env`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;


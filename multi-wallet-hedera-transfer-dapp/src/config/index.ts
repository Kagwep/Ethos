import { networkConfig } from "./networks";
import { AppConfig } from "./types";
import * as constants from "./constants";

export * from "./types";

export const appConfig: AppConfig & {
  constants: typeof constants
} = {
  networks: networkConfig,
  constants
}



export const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
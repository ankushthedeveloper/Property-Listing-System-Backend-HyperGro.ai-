// Validate required environment variables

import { EnvironmentVariables } from "@constants/common.constants";
import { ServerError } from "@constants/error.constants";

export const ValidateEnv = () => {
  EnvironmentVariables.forEach(env => {
    if (!process.env[env]) {
      throw new Error(env + ServerError.MISSING_ENV);
    }
  });
}

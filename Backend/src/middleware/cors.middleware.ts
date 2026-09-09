import cors from "cors";
import { CORS_ORIGINS } from "../env.js";

const extensionOriginPattern = /^(chrome|moz)-extension:\/\//;

const corsOptions = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (CORS_ORIGINS.includes(origin) || extensionOriginPattern.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
});

export default corsOptions;
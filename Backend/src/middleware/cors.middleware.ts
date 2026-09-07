import cors from "cors";

const allowedOrigins = ["http://localhost:5173"];
const extensionOriginPattern = /^(chrome|moz)-extension:\/\//;

const corsOptions = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || extensionOriginPattern.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
});

export default corsOptions;
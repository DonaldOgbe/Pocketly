import cors from "cors"

const corsOptions = cors({origin: "http://localhost:5173"}); // vites default port for the test

export default corsOptions;
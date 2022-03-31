import { DataBaseManagement } from "./db/main";
import { ServerManagement } from "./server/main";

DataBaseManagement.verifyFiles();
ServerManagement.startServer("API");

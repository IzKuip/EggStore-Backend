import { DBPath } from "../db/main";

class E {
  serverPort = 9000;

  databases = new Map<string, DBPath>([
    [
      "eggs",
      {
        name: "Eggs",
        path: "./db/eggs.json",
      },
    ],
    [
      "cred",
      {
        name: "Credentials",
        path: "./db/credentials.json",
      },
    ],
    [
      "pref",
      {
        name: "Preferences",
        path: "./db/preferences.json",
      },
    ],
  ]);
}

export const Env = new E();

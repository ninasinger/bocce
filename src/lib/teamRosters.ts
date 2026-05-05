import { formatTeamName } from "./display";

const rosterByTeamName: Record<string, string[]> = {
  "bocce babes": ["Janet Zak", "Chris Sloneker", "Pat D'Aloisio", "Terri Baldasare"],
  "bocce bellas": ["Gloria Marano", "Anna Kollmorgen", "Katie Swiger", "Tina Wingate", "Marianne Pohlmann"],
  "bocce mamas": ["Jan Holbrook", "Karla Banks", "Eleanor Presutti", "Kelley Ryan", "Sophia Lauwers"],
  "bocce stars": ["Michelle Sullivan", "Lenette Economos", "Marcella Pope", "Myn Tarlano"],
  "cannoli hope": ["JB Richard", "Joyce Ellison", "Anne Beecroft", "Elaine Long"],
  "d'bocceri": ["Caitlin Davis", "Sharon Smith", "Nina Singer", "Marisa Varney"],
  "dolls with balls": [
    "Nancy Pietrantonio",
    "Cindy Carusone",
    "Gloria Carusone",
    "Julie Pietrantonio",
    "Angie Reinoehl"
  ],
  "donne dolce": ["Mimi Villani", "Barb Cogliano", "Judy Ganguly", "Yvette Morrella", "Jo Lusk"],
  "donne vera": [
    "Barb Morris",
    "Deborah Barnes",
    "Julia Hall",
    "Michelle Jahnke",
    "Brittany Richards",
    "Cindy Lehmkuhle"
  ],
  "donne vere": [
    "Barb Morris",
    "Deborah Barnes",
    "Julia Hall",
    "Michelle Jahnke",
    "Brittany Richards",
    "Cindy Lehmkuhle"
  ],
  "la bocce vita": ["Chuck Levin", "Debbie Torre", "Julie Seiber", "Lori Peters"],
  "let's roll": ["Jennifer Petrella", "Leslie Matthews", "Amy DiSalvo", "Lori Cicero", "Carmela Swiger"],
  "limoncello sorellas": [
    "Belinda Ferrara",
    "Melody Knostman",
    "Colleen Militello",
    "Libby Balsamo",
    "Teri Gorretta"
  ],
  "movin' balls": ["Cathy Colosimo", "Alison Roop", "Rita Pinti", "Erica (Sigler) Hall"],
  "movin balls": ["Cathy Colosimo", "Alison Roop", "Rita Pinti", "Erica (Sigler) Hall"],
  "quattro amici": ["Kris Russo", "Maria Doepker", "Holly Kenney", "Maria Kaskocsak", "Peggy D'amico"],
  "roll models": [
    "Anne Lombardo",
    "Lisa Yahle Dunbar",
    "Charlene Madaffer-Meehan",
    "Chelsea Sowatskey",
    "Toni Bailey"
  ],
  "viva la bocce": ["Chrystal Frasca", "Lori Ferraro-Yoder", "Laurie Hickey", "Laura Gleason", "Joy Miceli"],
  "wonder women": [
    "Kay Trombino",
    "Kim Sease",
    "Donna Lacon",
    "Venetia Lacon",
    "Michelle Tagliamonte",
    "Lori Mackintosh",
    "Michelle Romano",
    "Emily Schaper"
  ]
};

function normalizeTeamName(name: string) {
  return formatTeamName(name).toLowerCase();
}

export function fallbackRosterForTeam(teamName: string) {
  return rosterByTeamName[normalizeTeamName(teamName)] || [];
}

export function normalizeRosterMembers(value: unknown, teamName: string) {
  const members = Array.isArray(value)
    ? value
        .map((member) => {
          if (typeof member === "string") return member;
          if (member && typeof member === "object" && "name" in member) {
            return String(member.name || "");
          }
          return "";
        })
        .map((member) => member.trim())
        .filter(Boolean)
    : [];

  return members.length > 0 ? members : fallbackRosterForTeam(teamName);
}

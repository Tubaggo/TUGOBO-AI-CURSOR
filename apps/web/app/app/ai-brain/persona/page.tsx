import { getPersonaProfiles } from "@/lib/data/ai-brain";
import { PersonaWorkspace } from "../_components/persona-workspace";

export default function AIBrainPersonaPage() {
  return <PersonaWorkspace initialPersonas={getPersonaProfiles()} />;
}

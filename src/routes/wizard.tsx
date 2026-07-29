import { createFileRoute } from "@tanstack/react-router";
import Wizard from "#/views/Wizard";

export const Route = createFileRoute("/wizard")({ component: Wizard });

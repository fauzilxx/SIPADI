import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  validateKnowledgeBaseData,
  type KnowledgeBaseData,
} from "@/lib/knowledge-base";

const knowledgeBasePath = path.join(
  process.cwd(),
  "data",
  "knowledge_base_v2.json"
);
const backupPath = path.join(
  process.cwd(),
  "data",
  "knowledge_base_v2.backup.json"
);

export async function readKnowledgeBaseFile() {
  const raw = await readFile(knowledgeBasePath, "utf8");
  const parsed = JSON.parse(raw) as KnowledgeBaseData;
  return parsed;
}

export async function saveKnowledgeBaseFile(input: unknown) {
  const validated = validateKnowledgeBaseData(input);

  if (!validated.data) {
    return {
      success: false as const,
      errors: validated.errors,
    };
  }

  const currentRaw = await readFile(knowledgeBasePath, "utf8");
  await mkdir(path.dirname(backupPath), { recursive: true });
  await writeFile(backupPath, currentRaw, "utf8");
  await writeFile(
    knowledgeBasePath,
    `${JSON.stringify(validated.data, null, 2)}\n`,
    "utf8"
  );

  return {
    success: true as const,
    data: validated.data,
  };
}

export function getKnowledgeBasePaths() {
  return {
    knowledgeBasePath,
    backupPath,
  };
}

require("dotenv").config()

const { Client } = require("pg")
const { randomUUID, createHash } = require("crypto")

const fypProjectsF21Raw = require("../data/fyp-projects-f21.json")
const fypProjectsF22Raw = require("../data/fyp-projects-f22.json")

function compactWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim()
}

function splitList(value) {
  return compactWhitespace(value)
    .split(/,\s*/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && item !== "]")
}

function splitKeywords(value) {
  return compactWhitespace(value)
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && item !== "\u00a0")
}

function normalizeAbstract(value) {
  if (!value || String(value).trim() === "\u00a0") {
    return "Abstract not available."
  }

  return compactWhitespace(value)
}

function buildRecords() {
  const allRaw = [
    ...fypProjectsF21Raw.map((item) => ({ ...item, Batch: item.Batch || "F21" })),
    ...fypProjectsF22Raw.map((item) => ({ ...item, Batch: item.Batch || "F22" })),
  ]

  return allRaw.map((item) => {
    const batch = item.Batch || "Unknown"
    const title = compactWhitespace(item["FYP Title"] || "Untitled Project")
    const abstract = normalizeAbstract(item["Abstract"])
    const supervisor = compactWhitespace(item["Internal Supervisor"] || "Not Assigned")
    const students = splitList(item["Student Name"])
    const keywords = splitKeywords(item["Thematic Area"])
    const sourceKey = `${batch.toLowerCase()}-${item["Group#"]}`
    const searchText = compactWhitespace(
      [title, abstract, supervisor, students.join(" "), keywords.join(" ")].join(" ")
    )
    const sourceHash = createHash("sha256")
      .update([sourceKey, title, abstract, supervisor, students.join("|"), keywords.join("|")].join("::"))
      .digest("hex")

    return {
      sourceKey,
      batch,
      groupNumber: item["Group#"],
      title,
      abstract,
      supervisor,
      students,
      keywords,
      searchText,
      sourceHash,
    }
  })
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured")
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    const records = buildRecords()

    for (const record of records) {
      await client.query(
        `
          INSERT INTO "PastFypIdea" (
            "id", "sourceKey", "batch", "groupNumber", "title", "abstract",
            "supervisor", "students", "keywords", "searchText", "sourceHash", "createdAt", "updatedAt"
          )
          VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8::jsonb, $9::jsonb, $10, $11, NOW(), NOW()
          )
          ON CONFLICT ("sourceKey") DO UPDATE SET
            "batch" = EXCLUDED."batch",
            "groupNumber" = EXCLUDED."groupNumber",
            "title" = EXCLUDED."title",
            "abstract" = EXCLUDED."abstract",
            "supervisor" = EXCLUDED."supervisor",
            "students" = EXCLUDED."students",
            "keywords" = EXCLUDED."keywords",
            "searchText" = EXCLUDED."searchText",
            "sourceHash" = EXCLUDED."sourceHash",
            "updatedAt" = NOW()
        `,
        [
          randomUUID(),
          record.sourceKey,
          record.batch,
          record.groupNumber,
          record.title,
          record.abstract,
          record.supervisor,
          JSON.stringify(record.students),
          JSON.stringify(record.keywords),
          record.searchText,
          record.sourceHash,
        ]
      )
    }

    const sourceKeys = records.map((record) => record.sourceKey)
    await client.query(
      `DELETE FROM "PastFypIdea" WHERE "sourceKey" <> ALL($1::text[])`,
      [sourceKeys]
    )

    console.log(`Synced ${records.length} past FYP ideas.`)
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error("Failed to sync past FYP ideas:", error)
  process.exit(1)
})

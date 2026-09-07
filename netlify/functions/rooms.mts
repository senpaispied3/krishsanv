import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { rooms } from "../../db/schema.js";
import { desc, eq } from "drizzle-orm";

export default async (req: Request) => {
  if (req.method === "POST") {
    const { roomId } = await req.json();

    if (!roomId || typeof roomId !== "string") {
      return Response.json({ error: "roomId is required" }, { status: 400 });
    }

    const [existing] = await db.select().from(rooms).where(eq(rooms.roomId, roomId));
    if (existing) {
      return Response.json(existing, { status: 200 });
    }

    const [room] = await db.insert(rooms).values({ roomId }).returning();
    return Response.json(room, { status: 201 });
  }

  if (req.method === "GET") {
    const allRooms = await db.select().from(rooms).orderBy(desc(rooms.createdAt));
    return Response.json({ rooms: allRooms });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/rooms",
};

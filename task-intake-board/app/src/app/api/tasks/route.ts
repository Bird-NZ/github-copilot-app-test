import { promises as fs } from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data", "tasks.json");

async function readTasks() {
  const raw = await fs.readFile(dataPath, "utf8");
  return JSON.parse(raw);
}

async function writeTasks(tasks: unknown) {
  await fs.writeFile(dataPath, JSON.stringify(tasks, null, 2));
}

export async function GET() {
  const tasks = await readTasks();
  return Response.json(tasks);
}

export async function POST(req: Request) {
  const body = await req.json();
  const tasks = await readTasks();
  const now = new Date().toISOString();

  const task = {
    id: `task-${Date.now()}`,
    title: body.title,
    brief: body.brief,
    priority: body.priority || "Medium",
    owner: body.owner || "HAL",
    stage: body.stage || "queued",
    waitingOnMat: body.waitingOnMat || false,
    nextAction: body.nextAction || "Clarify and plan next move.",
    dependencies: body.dependencies || [],
    artifacts: body.artifacts || [],
    approvalStatus: body.approvalStatus || "Pending",
    createdAt: now,
    updatedAt: now,
  };

  tasks.unshift(task);
  await writeTasks(tasks);
  return Response.json(task, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const tasks = await readTasks();
  const index = tasks.findIndex((task: { id: string }) => task.id === body.id);

  if (index === -1) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  tasks[index] = {
    ...tasks[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  await writeTasks(tasks);
  return Response.json(tasks[index]);
}

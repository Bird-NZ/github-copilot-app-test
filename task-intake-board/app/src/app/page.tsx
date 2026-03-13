import { promises as fs } from "fs";
import path from "path";
import styles from "./page.module.css";
import { TaskBoard } from "@/components/TaskBoard";

export default async function Home() {
  const dataPath = path.join(process.cwd(), "data", "tasks.json");
  const raw = await fs.readFile(dataPath, "utf8");
  const tasks = JSON.parse(raw);

  return (
    <main className={styles.page}>
      <TaskBoard initialTasks={tasks} />
    </main>
  );
}

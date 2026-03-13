"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../app/page.module.css";

type Task = {
  id: string;
  title: string;
  brief: string;
  priority: string;
  owner: string;
  stage: string;
  waitingOnMat: boolean;
  nextAction: string;
  dependencies: string[];
  artifacts: string[];
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
};

const stages = ["queued", "clarifying", "planning", "building", "reviewing", "done", "waiting-on-mat"];

export function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [form, setForm] = useState({
    title: "",
    brief: "",
    priority: "Medium",
    nextAction: "Clarify and plan next move.",
  });

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const waitingCount = useMemo(() => tasks.filter((t) => t.waitingOnMat).length, [tasks]);

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const task = await res.json();
    setTasks((prev) => [task, ...prev]);
    setForm({ title: "", brief: "", priority: "Medium", nextAction: "Clarify and plan next move." });
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
  }

  return (
    <>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Task Intake Board</p>
          <h1>HAL chief-of-staff task board</h1>
          <p className={styles.subcopy}>
            A coding-factory board for software ideas, workflow stage, ownership, next action, approvals, dependencies, and linked artifacts.
          </p>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.statCard}><span className={styles.statLabel}>Total tasks</span><strong>{tasks.length}</strong></div>
          <div className={styles.statCard}><span className={styles.statLabel}>Waiting on Mat</span><strong>{waitingCount}</strong></div>
          <div className={styles.statCard}><span className={styles.statLabel}>High priority</span><strong>{tasks.filter((t) => t.priority === "High").length}</strong></div>
        </div>
      </section>

      <section className={styles.grid}>
        <article className={`${styles.card} ${styles.today}`}>
          <div className={styles.cardHeader}><h2>New intake item</h2></div>
          <form onSubmit={createTask} className={styles.form}>
            <input className={styles.input} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea className={styles.textarea} placeholder="Short brief" value={form.brief} onChange={(e) => setForm({ ...form, brief: e.target.value })} required />
            <div className={styles.formRow}>
              <select className={styles.select} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
              <input className={styles.input} placeholder="Next action" value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} />
            </div>
            <button className={styles.primaryButton} type="submit">Create task</button>
          </form>
        </article>

        <article className={`${styles.card} ${styles.workflows}`}>
          <div className={styles.cardHeader}><h2>Workflow board</h2></div>
          <div className={styles.kanban}>
            {stages.map((stage) => (
              <div key={stage} className={styles.column}>
                <div className={styles.columnTitle}>{stage}</div>
                {tasks.filter((task) => task.stage === stage).map((task) => (
                  <div key={task.id} className={styles.ticketLarge}>
                    <div className={styles.ticketTop}>
                      <strong>{task.title}</strong>
                      <span className={`${styles.badge} ${task.priority === "High" ? styles.badgeHigh : task.priority === "Medium" ? styles.badgeMedium : styles.badgeLow}`}>{task.priority}</span>
                    </div>
                    <p>{task.brief}</p>
                    <div className={styles.meta}><span>Owner: {task.owner}</span><span>{task.approvalStatus}</span></div>
                    <div className={styles.meta}><span>Next: {task.nextAction}</span></div>
                    {task.dependencies.length > 0 && <div className={styles.meta}><span>Depends on: {task.dependencies.join(", ")}</span></div>}
                    {task.artifacts.length > 0 && <div className={styles.meta}><span>Artifacts: {task.artifacts.length}</span></div>}
                    <div className={styles.controls}>
                      <select className={styles.select} value={task.stage} onChange={(e) => updateTask(task.id, { stage: e.target.value, waitingOnMat: e.target.value === "waiting-on-mat" })}>
                        {stages.map((value) => <option key={value} value={value}>{value}</option>)}
                      </select>
                      <label className={styles.checkboxLabel}>
                        <input type="checkbox" checked={task.waitingOnMat} onChange={(e) => updateTask(task.id, { waitingOnMat: e.target.checked, stage: e.target.checked ? "waiting-on-mat" : task.stage === "waiting-on-mat" ? "queued" : task.stage })} />
                        waiting on Mat
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

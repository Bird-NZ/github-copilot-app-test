import styles from "./page.module.css";

type Approval = {
  title: string;
  type: string;
  status: "Pending" | "Approved" | "Rejected";
  owner: string;
};

type Workflow = {
  title: string;
  stage: "Queued" | "Working" | "Blocked" | "Waiting on Mat" | "Done";
  owner: string;
};

type Monitor = {
  name: string;
  status: "Healthy" | "Watch" | "Action";
  note: string;
};

type Output = {
  title: string;
  kind: string;
  updated: string;
};

type Agent = {
  name: string;
  status: "Idle" | "Working" | "Blocked";
  note: string;
};

const approvals: Approval[] = [
  { title: "Approve architecture diagrams", type: "Design", status: "Pending", owner: "HAL" },
  { title: "Approve daily AI brief changes", type: "Content", status: "Pending", owner: "HAL" },
  { title: "Delete old Azure demo resources", type: "Ops", status: "Approved", owner: "HAL" },
];

const workflows: Workflow[] = [
  { title: "Mission Control V1", stage: "Working", owner: "HAL" },
  { title: "Agent coding factory design", stage: "Queued", owner: "HAL" },
  { title: "Azure cost cleanup", stage: "Waiting on Mat", owner: "HAL" },
  { title: "Architecture diagram upgrade path", stage: "Blocked", owner: "HAL" },
  { title: "Definition-of-done rollout", stage: "Done", owner: "HAL" },
];

const monitors: Monitor[] = [
  { name: "AI radar", status: "Healthy", note: "Morning brief and weekly synthesis active" },
  { name: "Azure costs", status: "Action", note: "Farmvibes cleanup in progress" },
  { name: "World Mobile", status: "Watch", note: "No major change in latest check" },
  { name: "Bender group behavior", status: "Watch", note: "Mention-only rule applied" },
];

const outputs: Output[] = [
  { title: "AZ Prototype skill", kind: "Skill", updated: "Recently updated" },
  { title: "Architecture phase diagrams", kind: "Design", updated: "Drafts available" },
  { title: "Daily reviewer summary", kind: "Ops", updated: "Latest cycle complete" },
  { title: "Mission Control build spec", kind: "Spec", updated: "Just created" },
];

const agents: Agent[] = [
  { name: "HAL", status: "Working", note: "Building mission control and workflow upgrades" },
  { name: "Bender", status: "Idle", note: "Now restricted to direct mention replies in groups" },
  { name: "Reviewer", status: "Idle", note: "Needs stricter completion gates and fallback handling" },
];

const workflowColumns: Workflow["stage"][] = ["Queued", "Working", "Blocked", "Waiting on Mat", "Done"];

function StatusPill({ label }: { label: string }) {
  const cls =
    label === "Healthy" || label === "Approved" || label === "Done" || label === "Idle"
      ? styles.good
      : label === "Watch" || label === "Pending" || label === "Working" || label === "Queued"
        ? styles.warn
        : styles.bad;

  return <span className={`${styles.pill} ${cls}`}>{label}</span>;
}

export default function Home() {
  const pendingApprovals = approvals.filter((a) => a.status === "Pending").length;
  const blockedCount = workflows.filter((w) => w.stage === "Blocked").length;
  const waitingCount = workflows.filter((w) => w.stage === "Waiting on Mat").length;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>HAL Mission Control</p>
          <h1>Private operating board for HAL + Mat</h1>
          <p className={styles.subcopy}>
            Built for WSL, reachable in the Windows browser, and designed to be exposed on the home LAN for any PC or phone on Wi-Fi.
          </p>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pending approvals</span>
            <strong>{pendingApprovals}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Blocked workflows</span>
            <strong>{blockedCount}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Waiting on Mat</span>
            <strong>{waitingCount}</strong>
          </div>
        </div>
      </section>

      <section className={styles.grid}>
        <article className={`${styles.card} ${styles.today}`}>
          <div className={styles.cardHeader}>
            <h2>Today</h2>
            <StatusPill label="Working" />
          </div>
          <ul className={styles.list}>
            <li>Most urgent: finish Mission Control V1 and confirm local browser access.</li>
            <li>Recommended next action: verify LAN access path from Windows host IP.</li>
            <li>Operational note: Azure cleanup is underway for the expensive Farmvibes stack.</li>
            <li>Quality focus: enforce definition-of-done and chief-of-staff routing on larger tasks.</li>
          </ul>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Approvals</h2>
          </div>
          <div className={styles.tableLike}>
            {approvals.map((item) => (
              <div key={item.title} className={styles.row}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.type} · owner: {item.owner}</p>
                </div>
                <StatusPill label={item.status} />
              </div>
            ))}
          </div>
        </article>

        <article className={`${styles.card} ${styles.workflows}`}>
          <div className={styles.cardHeader}>
            <h2>Workflows</h2>
          </div>
          <div className={styles.kanban}>
            {workflowColumns.map((column) => (
              <div key={column} className={styles.column}>
                <div className={styles.columnTitle}>{column}</div>
                {workflows
                  .filter((item) => item.stage === column)
                  .map((item) => (
                    <div key={item.title} className={styles.ticket}>
                      <strong>{item.title}</strong>
                      <span>{item.owner}</span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Monitors</h2>
          </div>
          <div className={styles.tableLike}>
            {monitors.map((item) => (
              <div key={item.name} className={styles.row}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.note}</p>
                </div>
                <StatusPill label={item.status} />
              </div>
            ))}
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Outputs</h2>
          </div>
          <div className={styles.tableLike}>
            {outputs.map((item) => (
              <div key={item.title} className={styles.row}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.kind}</p>
                </div>
                <span className={styles.muted}>{item.updated}</span>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Agent status</h2>
          </div>
          <div className={styles.tableLike}>
            {agents.map((item) => (
              <div key={item.name} className={styles.row}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.note}</p>
                </div>
                <StatusPill label={item.status} />
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

Below is an ASCII/UML-style component diagram for **Phase 1** (fast money) showing exactly what we’re building: a **service + automation compiler** that turns requirements into deliverables (docs + diagrams + NestJS scaffold). This is the UI/story you show clients *and* the internal architecture you implement.

```text
+--------------------------------------------------------------------------------------+
|                     PHASE 1: "AI System Architect" (Service + Automation)            |
+--------------------------------------------------------------------------------------+

  [Client]                         (Public UI)                          (Internal Engine)
    |                                   |                                      |
    | 1) Requirements / Idea            |                                      |
    +------------------------------->   |                                      |
                                        v                                      v
                               +-------------------+                 +----------------------+
                               |  Intake UI        |                 |  Orchestrator        |
                               |  (Web/CLI)         |                 |  (pipeline runner)   |
                               | - form/chat wizard |                 | - stages + retries   |
                               | - upload notes     |                 | - logging/audit      |
                               +---------+---------+                 +----+-----------------+
                                         |                                |
                                         | 2) raw requirements             |
                                         +-------------------------------> |
                                                                          v
                                                                 +----------------------+
                                                                 |  LLM Stage A         |
                                                                 |  "Requirements Parse"|
                                                                 |  - extract entities  |
                                                                 |  - actors/use cases  |
                                                                 |  - NFR constraints   |
                                                                 +----------+-----------+
                                                                            |
                                                                            | 3) normalized JSON
                                                                            v
                                                                 +----------------------+
                                                                 |  Schema Validator    |
                                                                 |  - JSON Schema       |
                                                                 |  - reject/repair     |
                                                                 +----------+-----------+
                                                                            |
                                                                            | 4) validated requirements
                                                                            v
                                                                 +----------------------+
                                                                 |  LLM Stage B         |
                                                                 |  "Architect"         |
                                                                 |  - modules/bounds    |
                                                                 |  - APIs + auth model |
                                                                 |  - DB design         |
                                                                 |  - infra plan        |
                                                                 +----------+-----------+
                                                                            |
                                                                            | 5) DesignSpec v1 (JSON)
                                                                            v
                                                                 +----------------------+
                                                                 |  Spec Store          |
                                                                 |  - versioned specs   |
                                                                 |  - artifacts index   |
                                                                 +----------+-----------+
                                                                            |
                         +-------------------------------+                  |
                         |                               |                  |
                         v                               v                  v
               +-------------------+            +-------------------+  +----------------------+
               | Diagram Generator |            | Doc Generator      |  | Code Generator       |
               | (Mermaid/UML)     |            | (MD/PDF)           |  | (templates)          |
               | - component UML   |            | - architecture     |  | - NestJS modules     |
               | - sequence flows  |            | - decisions        |  | - controllers/services|
               +---------+---------+            +---------+---------+  | - DTOs/entities      |
                         |                                |            | - tests skeleton     |
                         |                                |            +----------+-----------+
                         |                                |                       |
                         |                                | 6c) scaffold repo      |
                         |                                +---------------------->|
                         | 6a) diagrams (.mmd/.svg)                               v
                         v                                                      +----------------------+
               +-------------------+                                            | Build/QA Gate        |
               | Artifacts Store   |<-------------------------------------------| - lint/tsc/tests     |
               | - docs/diagrams   |            6b) docs (md/pdf)               | - security checks    |
               | - repo zip/git    |                                            +----------+-----------+
               +---------+---------+                                                       |
                         |                                                                 |
                         | 7) delivery bundle (repo + docs + diagrams)                     |
                         v                                                                 v
                    +-------------------+                                       +----------------------+
                    | Delivery          |                                       | LLM Stage C (opt.)   |
                    | - Git repo        |                                       | "Repair"             |
                    | - Zip download    |                                       | - fix compile errors |
                    | - Private link    |                                       | - minimal patches    |
                    +---------+---------+                                       +----------------------+
                              |
                              | 8) client receives & runs locally
                              v
                           [Client Dev Team]
```

## UML “components” legend (what each box really is)

* **Intake UI (Web/CLI):** collects requirements in a structured way (wizard beats free chat)
* **Orchestrator:** runs the pipeline stages, persists artifacts, handles retries
* **LLM Stage A:** converts messy text → normalized requirement JSON
* **Schema Validator:** ensures correctness; triggers repair if invalid
* **LLM Stage B:** produces **DesignSpec v1** (the contract)
* **Generators (deterministic):** diagrams/docs/code are generated from the spec (no hallucinations)
* **Build/QA Gate:** compile + lint + minimal tests; if failing → repair loop
* **Delivery:** outputs a repo and professional docs

---

## If you want the “UI view” diagram only (simpler)

```text
[Idea] -> [Wizard] -> [Architecture Preview] -> [Generate Repo + Docs] -> [Download / Git Link]
```

---


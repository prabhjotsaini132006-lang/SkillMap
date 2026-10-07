# SkillMap — Skill Tree & Roadmap Builder

## 1. Project Description

SkillMap is a frontend-only web application that allows users to create
learning roadmaps in the form of a game-style skill tree.

Each skill is represented as a node. Skills can have prerequisites,
learning resources, difficulty levels, and progress statuses.

A skill remains locked until all of its prerequisites are completed.
Completing a prerequisite can automatically unlock dependent skills.

---

## 2. Project Goals

The main goals of SkillMap are:

- Create and manage multiple learning roadmaps.
- Represent learning paths using prerequisite-based skill trees.
- Automatically calculate whether skills are locked or available.
- Track learning progress for each roadmap.
- Store application data persistently using IndexedDB.
- Provide a responsive interface for desktop, tablet, and mobile.
- Demonstrate core HTML, CSS, and JavaScript concepts.
- Apply graph concepts such as dependencies, cycle detection,
  and topological ordering.

---

## 3. Technology Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- IndexedDB
- Cookies
- SVG

No external JavaScript libraries or frameworks will be used.

---

## 4. Main Features

### Roadmap Management

Users can:

- Create a roadmap.
- View existing roadmaps.
- Rename a roadmap.
- Delete a roadmap.
- Open a roadmap and manage its skills.

### Skill Management

Users can:

- Add skills.
- Edit skills.
- Delete skills.
- Set skill descriptions.
- Set difficulty levels.
- Add learning resource links.
- Track skill status.

### Prerequisites

Users can define prerequisite relationships between skills.

A skill remains locked until all of its prerequisites are completed.

### Skill Tree

Skills are displayed as nodes organized into levels.

The level of a skill depends on its prerequisite chain.

SVG lines connect prerequisite skills on larger screens.

### Progress Tracking

Each roadmap displays its completion percentage based on completed
skills.

### Additional Features

- Cycle detection.
- Suggested next skill.
- Search and filtering.
- JSON import/export.
- Responsive mobile layout.
- Theme preference using a cookie.

---

## 5. Functional Requirements

### FR1 — Roadmap Management

The system shall allow users to:

- Create a new roadmap.
- View all existing roadmaps.
- Rename an existing roadmap.
- Delete a roadmap.
- Open a roadmap to manage its skills.

### FR2 — Skill Management

The system shall allow users to:

- Add a skill.
- Edit a skill.
- Delete a skill.
- Set the skill name and description.
- Set the difficulty level.
- Add a learning resource link.
- View the current status of a skill.

### FR3 — Prerequisite Management

The system shall allow users to define prerequisite relationships
between skills within a roadmap.

A skill may have zero or more prerequisites.

### FR4 — Skill Unlocking

The system shall automatically determine whether a skill is locked or
available based on its prerequisites.

A skill with incomplete prerequisites shall remain locked.

A skill whose prerequisites are all completed shall become available.

The user can manually change an available skill to in-progress and
mark it as done.

### FR5 — Skill Tree Visualization

The system shall display skills as nodes organized into levels.

Prerequisite relationships shall be represented using SVG connections
on larger screens.

### FR6 — Progress Tracking

The system shall calculate and display the completion percentage
of each roadmap.

### FR7 — Data Persistence

The system shall persist roadmap and skill data using IndexedDB.

Data shall remain available after refreshing or reopening the application.

### FR8 — Cycle Prevention

The system shall prevent prerequisite relationships that create cycles
in the skill dependency graph.

A clear validation message shall be shown when an invalid relationship
is attempted.

### FR9 — Suggested Next Skill

The system shall suggest a suitable next skill based on the prerequisite
graph and currently available skills.

### FR10 — Search and Filtering

The system shall allow users to search skills and filter them by:

- Status
- Difficulty

### FR11 — Import and Export

The system shall allow roadmap data to be:

- Exported as JSON.
- Imported from valid JSON data.

### FR12 — Responsive Interface

The system shall support:

- Desktop
- Tablet
- Mobile

On mobile devices, skills shall be displayed as a stacked list grouped
by level rather than relying on SVG connections.

### FR13 — Skill Deadlines

The system shall allow users to assign an optional deadline to a skill.

### FR14 — Overdue Deadlines

The system shall identify unfinished skills as overdue when their deadline has passed.

### FR15 — Due Soon Deadlines

The system shall identify unfinished skills as due soon when their deadline is within seven days.

### FR16 — Calendar

The system shall display skill deadlines on a calendar.

### FR17 — Deadline Persistence

The system shall preserve skill deadlines during roadmap export and import.
---

## 6. Non-Functional Requirements

### Responsiveness

The interface shall adapt to different screen sizes using:

- CSS Grid
- Flexbox
- CSS variables
- Media queries

### Usability

The application shall provide clear forms, validation messages,
status indicators, and navigation.

### Maintainability

JavaScript functionality shall be separated into modules according
to responsibility.

### Performance

The application should remain responsive when managing a reasonable
number of skills.

### Data Integrity

Invalid prerequisite relationships, including cycles, shall be rejected.

### Compatibility

The application shall use standard browser APIs and vanilla JavaScript.

---

## 7. Data Model

### Roadmap

A roadmap represents one learning path.

```text
Roadmap
├── id
├── name
├── description
├── createdAt
└── updatedAt
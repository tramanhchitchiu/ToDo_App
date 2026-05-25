# Stitch Design Prompts — Task Mom 24/7
## How to use this file
1. In Stitch, start a new project and paste the **Global Context** block first (as the app description / system prompt if Stitch allows it, or prepend it to every screen prompt).
2. For each screen, create a new Stitch frame and paste the corresponding **Screen Prompt** block.
3. After generating, iterate with the follow-up suggestions at the end of each block.

---

## Global Context (prepend to every screen prompt)

> Paste this paragraph before each individual screen prompt in Stitch.

```
App name: Task Mom 24/7
Tagline: "Gom TODO từ mọi dự án, nhắc deadline — không quên, không giận, không hối."

Task Mom 24/7 is a web productivity application for software engineers and project managers. An AI agent automatically collects to-do items from Jira, email, meeting minutes, and team chat, then presents them in a unified dashboard for user review and confirmation.

Platform: Desktop web app (1280px–1440px target width).
Theme: Supports light and dark mode with a single toggle. Design for dark mode as the primary view; light mode should use the same layout with inverted surface colors.
Visual style: Clean, programmer-friendly, minimal. Think VS Code meets Linear — dense information display, no decorative illustration. Subtle depth via elevation shadows, not gradients. Generous whitespace within cards, tight information density in tables.

Color palette:
- Background (dark): #0F1117
- Surface / card (dark): #1A1D23
- Sidebar (dark): #13161B
- Background (light): #F8F9FA
- Surface / card (light): #FFFFFF
- Sidebar (light): #F1F3F5
- Primary accent: #F26522 (FPT Software orange) — use for primary buttons, active nav item indicator, key badges, focus rings
- Text primary (dark): #F9FAFB
- Text secondary (dark): #9CA3AF
- Text primary (light): #111827
- Text secondary (light): #6B7280
- Border (dark): #2D3748
- Border (light): #E5E7EB
- High priority / overdue: #EF4444
- Medium priority: #F59E0B
- Low priority / done: #10B981
- Confidence score high (≥80): #10B981
- Confidence score medium (50–79): #F59E0B
- Confidence score low (<50): #EF4444

Typography: Inter or Geist Sans. Code-adjacent elements (source excerpts, agent trace) use JetBrains Mono or similar monospace.

Layout pattern: Fixed left sidebar (240px wide) + top header bar (56px tall) + scrollable main content area. Sidebar has the app logo at top, navigation links in the middle, user avatar and settings at the bottom.

Navigation items (in order): Dashboard, Confirm Tasks (with badge count), Daily Briefing, — divider — Settings > Data Sources, Settings > Notifications, — divider — Admin > Users (Admin role only).

Components: Rounded corners (8px radius for cards, 6px for inputs/buttons). MUI-inspired but without heavy MUI styling. Status chips, priority badges, and confidence score badges are pill-shaped. Tables have alternating row hover states, no alternating row colors.
```

---

## Screen Prompts

---

### S01 — Login Screen

```
Design a login screen for Task Mom 24/7, a web-based AI task management app for software teams.

Layout: Centered card on a full-page background. No sidebar or top nav on this screen. The background is the app's dark background color (#0F1117 dark / #F8F9FA light). The card is 400px wide, centered both horizontally and vertically.

Card contents (top to bottom):
1. App logo area: A small robot or mother emoji icon (🤱) followed by the app name "Task Mom 24/7" in bold 24px. Below the name, the tagline in secondary text color: "không quên · không giận · không hối" in italic 13px.
2. Vertical space of 24px.
3. Email input field: Label "Email" above the field. Full-width text input. Placeholder: "you@fpt.com".
4. Password input field: Label "Password" above the field. Full-width password input with show/hide toggle icon on the right. Placeholder: "••••••••".
5. Vertical space of 8px.
6. Error message area: A small red alert box that reads "Invalid email or password." — show this in the design to illustrate the error state.
7. Vertical space of 8px.
8. Primary CTA button: Full-width, filled, using primary accent color (#F26522). Label: "Sign In". 48px height, 8px border radius.
9. Divider: "— or —" in secondary text, centered, with lines on each side.
10. SSO button: Full-width outlined button. Label: "Sign in with FPT SSO". 48px height.

Card has 32px padding on all sides. Subtle 1px border in border color. Box shadow for elevation.

Show the design in dark mode.
```

**Stitch follow-up prompts:**
- "Switch to light mode version"
- "Show the loading state where the Sign In button is disabled with a spinner"
- "Make the card narrower and more compact for a tighter layout"

---

### S02 — TODO Dashboard

```
Design the main dashboard screen for Task Mom 24/7, a web-based AI task management app.

Use the global layout: fixed 240px left sidebar + 56px top header + scrollable main content.

TOP HEADER (56px, surface color, bottom border):
- Left: Breadcrumb — "Dashboard"
- Right side (left to right): "Run Ingestion" text button (ghost style), notification bell icon with orange badge showing "3", user avatar with name "Linh" and a small dropdown arrow, "Logout" link in secondary text.

LEFT SIDEBAR (240px, sidebar background color, right border):
- Top: App logo + name "Task Mom 24/7" with the 🤱 icon.
- Nav items (vertically stacked, 40px height each, 8px border radius, 12px horizontal padding):
  - "Dashboard" — currently ACTIVE (show orange left border indicator + slightly highlighted background + orange text)
  - "Confirm Tasks" with an orange pill badge showing "5"
  - "Daily Briefing"
  - Thin divider
  - "Data Sources"
  - "Notifications"
  - Thin divider
  - "Admin / Users" (show in secondary text to indicate admin-only)
- Bottom: User avatar (32px circle), "Nguyen T. Linh", settings gear icon.

MAIN CONTENT:
Section 1 — Summary cards row (4 cards side by side, equal width, 16px gap):
- Card 1: Large number "24" with label "Total Tasks" below. Subtle icon top-right (checklist icon).
- Card 2: Large number "3" in amber/yellow. Label "Due Today". Calendar icon.
- Card 3: Large number "1" in red. Label "Overdue". Alert icon.
- Card 4: Large number "12" in green. Label "Completed". Checkmark icon.
All cards: white/surface background, 8px radius, 16px padding, subtle shadow.

Section 2 — Filter bar (horizontal, 16px below summary cards):
- Search input (300px wide): placeholder "Search tasks…", search icon inside left.
- Three dropdowns side by side (120px each): "Source ▾" "Status ▾" "Priority ▾"
- Right-aligned: sort indicator showing "Sort: Deadline ↑"
All filter controls are 36px height, outlined style.

Section 3 — Task table (full width, 16px below filter bar):
Table header row (surface background, text secondary color, 12px uppercase):
Columns: # | Title | Source | Deadline | Priority | Status | (empty for actions)

Table rows (show 5 rows with realistic data):
Row 1: 1 | "Review PR #42 for auth module" | Jira badge (blue) | "Today 18:00" in red bold | 🔴 High pill | "Todo" grey chip | ⋯ menu icon
Row 2: 2 | "Reply to client delivery email" | Email badge (purple) | "Tomorrow" | 🟡 Med pill | "In Progress" blue chip | ⋯
Row 3: 3 | "Update authentication docs" | Meeting badge (teal) | "24 May" | 🟢 Low pill | "Todo" grey chip | ⋯
Row 4: 4 | "Fix bug #103 — null pointer" | Jira badge (blue) | "25 May" | 🔴 High pill | "Todo" grey chip | ⋯
Row 5: 5 | "Review sprint 4 planning doc" | Teams badge (indigo) | "26 May" | 🟡 Med pill | "Done" green chip | ⋯

Rows have 48px height. On-hover: row background lightens slightly. The row border is only a bottom 1px line.

Source badges are colored pills: Jira=blue, Email=purple, Meeting=teal, Teams=indigo, Slack=green.
Priority pills: High=red background 10% opacity + red text + red dot, Medium=amber, Low=green.
Status chips: Todo=neutral grey, In Progress=blue, Done=green.

Below the table: pagination row — "Showing 1–5 of 24" on the left, "< 1 2 3 ... 5 >" page controls on the right.

Show the entire screen in dark mode.
```

**Stitch follow-up prompts:**
- "Show the hover state on row 2 — highlight the row and show a 'View detail' tooltip"
- "Show the filter bar with the Source dropdown open, displaying options: All, Jira, Email, Meeting, Teams, Slack"
- "Switch to light mode"

---

### S03 — Task Detail Screen

```
Design the task detail screen for Task Mom 24/7. Use the same global layout (240px sidebar + 56px header + main content). The sidebar nav has no item actively highlighted (user came from Dashboard).

TOP HEADER:
- Left: Breadcrumb "Dashboard › Task Detail" with "← Back" link in secondary color.
- Right: same notification bell + user avatar as S02.

MAIN CONTENT (two-column layout inside the content area):
LEFT COLUMN (65% width, main details):

Section: Task Title (full-width editable text input, large 20px text, no label — the field IS the title):
"Review PR #42 for authentication module"

Section: Metadata row (4 inline chips/labels in a horizontal row, 16px gap, 24px below title):
- "Jira" source badge (blue pill)
- Calendar icon + "Due: 21 May 2026" in red (overdue indicator)
- Priority: 🔴 "High" pill with a small tag "AI Suggested" in a secondary badge attached to it (different opacity/smaller text)
- Status dropdown: currently showing "Todo" — styled as a select/dropdown with a chevron

Second metadata row (16px below):
- "Assigned to: Nguyen T. Linh"
- "Created: 2026-05-20"
- "Last updated: 2 hours ago"
All in secondary text color, small 13px text.

Section: Description (32px below, label "Description" in secondary uppercase 11px):
A multi-line textarea showing:
"The PR needs a second reviewer before merging into main. Please review the OAuth2 implementation and approve or leave inline comments. Pay attention to the token refresh logic."

Section: Source Excerpt (32px below, label "Source Excerpt" in secondary uppercase 11px):
A read-only code-block-styled box (monospace font, slightly different background from the page, left orange border accent, 12px padding):
"[Jira — ALPHA-42] Assigned to Linh by TrungNT on 2026-05-20:
'Please review this PR before EOD today. The auth module needs sign-off.'"

Save / Cancel button row at the bottom of left column: "Save Changes" (orange filled button) + "Cancel" (ghost button), right-aligned.

RIGHT COLUMN (35% width, contextual info):

Thread Context card (surface card, 8px radius, 16px padding):
- Header: "Thread Context" label in secondary uppercase + collapse chevron
- Group label: "📁 Project Alpha — Auth Module" in bold 14px
- Narrative text (14px, secondary color, italic style):
"Sprint 3 introduced OAuth2 authentication. This PR is the final review gate before the feature merges to main. Related tasks include bug #103 (blocking this) and documentation update (follow-up action)."
- Row of related task chips below: "Fix bug #103 🔴" "Update auth docs 🟢" (clickable chips)

Invalidation warning card below Thread Context (only if flagged — show it in this design):
- Orange/amber background card with warning icon:
"⚠️ This task may be outdated. A related requirement changed on 2026-05-19. Please confirm it is still relevant."
- Two small buttons inside: "Confirm Still Valid" (outlined) "Dismiss" (ghost)

Show in dark mode.
```

**Stitch follow-up prompts:**
- "Show the form in edit mode — title field has focus with an orange outline, Save button is enabled (orange filled)"
- "Show a version without the invalidation warning card"
- "Show light mode"

---

### S04 — Task Confirmation Screen

```
Design the Task Confirmation Queue screen for Task Mom 24/7. Same global layout. Sidebar "Confirm Tasks" nav item is ACTIVE.

TOP HEADER:
- Left: Breadcrumb "Confirm Tasks (5 pending)"
- Right: "✓ Accept All ≥80" button (outlined, orange text + orange border) + notification bell + user avatar.

MAIN CONTENT:
Instruction text at top (secondary color, 13px):
"Review AI-extracted tasks below. Every task requires your decision before it is added to your list."

THREAD GROUP 1 — "Project Alpha — Auth Module" (full-width section):
Group header bar (slightly different background from page, 12px padding, 8px radius top):
- 📁 icon + "Project Alpha — Auth Module" in bold 14px
- Narrative text below in secondary italic 13px:
"Sprint 3 introduced OAuth2. Two tasks share this context. One may be invalidated by a recent requirement change."

CANDIDATE CARD 1 inside Group 1 (white/surface card, 8px radius, 16px padding, bottom border between cards):
- Top row: Checkbox (unchecked) on far left | "Review PR #42 for authentication module" as a clickable title link | Right-aligned: Confidence badge — green pill "92/100"
- Second row: "Imperative assignment detected: 'please review before EOD'" in secondary color 13px, slightly indented
- Third row (chip row): Jira badge | "Due: 21 May 2026" in red | ⚠️ "May be invalidated" chip in amber
- Action button row (right-aligned): "✓ Accept" (green outlined) | "✏ Edit" (blue outlined) | "✗ Reject" (red outlined)

CANDIDATE CARD 2 inside Group 1:
- Checkbox | "Update authentication documentation" title | Confidence badge — yellow pill "74/100"
- "'Linh to update docs' — action item in meeting transcript" in secondary color
- Chip row: Meeting badge | "Due: 24 May 2026"
- Action buttons: same layout

THREAD GROUP 2 — "Client XYZ — Delivery":
Group header: 📁 "Client XYZ — Delivery" + narrative text: "Client requested a status update via email. One task detected."

CANDIDATE CARD 3:
- Checkbox | "Reply to client delivery status email" | Confidence badge — green pill "85/100"
- "'Need by Friday' deadline signal detected"
- Email badge | "Due: 22 May 2026"
- Action buttons

At bottom of all groups: Full-width "Submit All Decisions" primary button (orange filled, 48px, disabled/greyed out state because not all candidates have been decided).

Note below button in secondary text: "3 of 5 tasks still need a decision."

Show in dark mode.
```

**Stitch follow-up prompts:**
- "Show candidate card 1 in 'Edit mode' — the title and deadline fields are expanded inline for editing with an orange confirm button"
- "Show the Reject Reason modal — a centered dialog with a textarea asking 'Why are you rejecting this task? (optional)' and Reject / Cancel buttons"
- "Show the 'Accept All ≥80' button in a pressed/loading state after clicking"

---

### S05 — Data Source Settings

```
Design the Data Source Settings screen for Task Mom 24/7. Same global layout. Sidebar "Data Sources" is ACTIVE under Settings.

TOP HEADER:
- Left: Breadcrumb "Settings › Data Sources"
- Right: "+ Add Source" orange filled button (small, 36px) + notification bell + user avatar.

MAIN CONTENT (two-column layout):
LEFT COLUMN (60% width) — Source List:

4 source cards stacked vertically (16px gap between cards):

CARD 1 — Jira (Active):
- Header row: Jira logo-like icon (blue J) + "Jira" bold 15px + right side: 🟢 "Active" green chip + "Edit" ghost button
- Detail row: "https://fpt.atlassian.net" in monospace secondary text + "Polling: every 30 min"
- Last ingestion row: "Last run: 21 May 2026, 08:30 — 3 tasks found" in 13px secondary
- Action row (right-aligned small buttons): "▶ Run Now" (outlined orange) | "🗑 Remove" (outlined red text, no fill)

CARD 2 — Email (Active):
- Email envelope icon (purple) + "Email (Exchange)" + 🟢 Active chip + Edit button
- "linh@fpt.com" + "Polling: every 15 min"
- "Last run: 21 May 2026, 08:45 — 1 task found"
- "▶ Run Now" | "🗑 Remove"

CARD 3 — Meeting Minutes (Manual):
- Document icon (teal) + "Meeting Minutes" + 🔵 "Manual" blue chip + Edit button
- "Upload .txt / .docx / .pdf files"
- "Last file: sprint-3-retro.docx — uploaded 20 May 2026"
- "📁 Upload File" (outlined button) | "🗑 Remove"

CARD 4 — Teams (Inactive / not configured):
- Teams icon (indigo) + "Microsoft Teams" + 🔴 "Inactive" red chip + "Configure" primary button
- "Not configured. Add a webhook URL to activate."

RIGHT COLUMN (40% width) — Add / Edit Form (currently showing an 'Edit Jira' form):
Form card (surface, 8px radius, 16px padding):
Title: "Edit Source — Jira" in 16px bold.
Form fields:
- "Source Type" dropdown — showing "Jira" (disabled since editing)
- "Endpoint URL" text input — value: "https://fpt.atlassian.net"
- "API Token" password field — showing masked "••••••••••••"
- "Polling Interval (minutes)" number input — value: "30"
- "Active" toggle switch — ON (orange)
Button row: "Save" (orange filled) | "Cancel" (ghost)

Note below: "API tokens are stored securely and never logged."
In small secondary 12px text.

Show in dark mode.
```

**Stitch follow-up prompts:**
- "Show the Meeting Minutes card in an expanded state with a file upload drop-zone visible"
- "Show the confirmation dialog that appears when clicking Remove — centered modal with warning icon"
- "Show a 'Run Now' loading state — spinner replacing the Run Now button text, card has a subtle pulsing border"

---

### S06 — Notification Settings

```
Design the Notification Settings screen for Task Mom 24/7. Same global layout. Sidebar "Notifications" is ACTIVE.

TOP HEADER:
- Left: Breadcrumb "Settings › Notifications"
- Right: notification bell + user avatar (no extra action buttons in header for this screen)

MAIN CONTENT (single column, max 720px wide, centered in content area):

SECTION 1 — "Reminder Channels" (section header in secondary uppercase 11px, with a horizontal rule below):
Four toggle rows (each row: toggle switch on left, label + description on right, 40px row height):
Row 1: Toggle ON (orange) | "In-App Notification" | secondary: "Show alerts inside the app"
Row 2: Toggle ON | "Email" | Input field appears to the right: text field showing "linh@fpt.com" (120px wide, 32px height, outlined, connected to the row)
Row 3: Toggle OFF (grey) | "Microsoft Teams" | Greyed-out input showing "Webhook URL" placeholder (disabled, 200px wide)
Row 4: Toggle OFF | "Slack" | Greyed-out input showing "Webhook URL" placeholder (disabled)

SECTION 2 — "Reminder Timing" (32px below section 1):
Three checkbox rows:
Row 1: Checkbox ☑ | "24 hours before deadline"
Row 2: Checkbox ☑ | "1 hour before deadline"
Row 3: Checkbox ☐ | "Custom offset" | When unchecked, field is disabled: "__ hours before" (small number input, 60px wide)

SECTION 3 — "Daily Briefing" (32px below section 2):
Card (surface background, 8px radius, 16px padding):
- Row 1: Toggle ON | "Enable Daily Briefing" bold
- Row 2 (visible only when enabled): "Send at" + time input field showing "08:00" (80px wide) + "via" + small dropdown showing "Email ▾"
- Brief description: "Your AI assistant will send a summary of today's tasks every morning." in 13px secondary italic.

Button row at bottom of page (24px below last section, right-aligned):
- "Reset to Defaults" ghost button
- "Save Settings" orange filled button (120px wide)

Show in dark mode.
```

**Stitch follow-up prompts:**
- "Show the Teams toggle switched ON — the Webhook URL input becomes active and focused with orange outline"
- "Show a success state after clicking Save — a green toast appears at bottom-right: '✓ Notification preferences saved'"
- "Show light mode"

---

### S07 — Daily Briefing Screen

```
Design the Daily Briefing screen for Task Mom 24/7. Same global layout. Sidebar "Daily Briefing" is ACTIVE.

TOP HEADER:
- Left: Breadcrumb "Daily Briefing — Thursday, 21 May 2026" + "← Back" link
- Right: notification bell + user avatar.

MAIN CONTENT:

BRIEFING CARD (full width, surface background, 8px radius, 24px padding, orange left accent border 4px wide):
- Header: "🌅 Good morning, Linh!" in 22px bold.
- Body text (16px, line-height 1.6, primary text color):
"You have 3 tasks due today and 2 tasks due tomorrow. Your top priority is reviewing PR #42 before 18:00 — the auth module release depends on it. Don't forget to reply to the client email for Project XYZ before end of day. You've got this!"
- Footer row: small secondary text "Generated by Task Mom · 21 May 2026, 08:00" + a "Regenerate" ghost button with refresh icon.

TODAY'S TASKS section (24px below briefing card):
Section header: "Today's Tasks" bold 16px + count badge "3" (grey pill).

3 task rows in a compact list (no full table — simpler list style, 56px row height, surface card background, dividers between rows):
Row 1: 🔴 priority dot | "Review PR #42 for authentication module" bold 14px | "Jira" source badge | "Due: Today 18:00" in red 13px | "Todo" status chip
Row 2: 🟡 priority dot | "Reply to client delivery status email" 14px | "Email" badge | "Due: Today EOD" 13px | "In Progress" chip
Row 3: 🟢 priority dot | "Record team standup notes" 14px | "Teams" badge | "Due: Today 10:00" 13px | "Done" chip — row has a strikethrough text style

TOMORROW'S TASKS section (24px below today's tasks):
Section header: "Tomorrow's Tasks" bold 16px + count badge "2".

2 task rows:
Row 1: 🔴 | "Fix null pointer bug #103" | "Jira" | "Tomorrow" | "Todo"
Row 2: 🟡 | "Update authentication documentation" | "Meeting" | "Fri 24 May" | "Todo"

Each row is clickable (show a subtle right arrow → icon on hover on the far right).

Show in dark mode.
```

**Stitch follow-up prompts:**
- "Show row 1 in hover state — background lightens, right arrow appears, cursor becomes pointer"
- "Show a loading skeleton state for the briefing card — animated grey bars while the briefing text is generating"
- "Show light mode"

---

### S08 — User Management Screen (Admin)

```
Design the User Management screen for Task Mom 24/7, visible only to Admin users. Same global layout. Sidebar shows "Admin / Users" as ACTIVE. All other nav items appear slightly dimmed to reinforce the admin context.

TOP HEADER:
- Left: Breadcrumb "Admin › User Management"
- Right: "+ Create User" orange filled button (small) + notification bell + admin avatar showing "Admin" label instead of name.

MAIN CONTENT (two-column layout):
LEFT COLUMN (60%) — User Table:

Search bar (full width of column, 36px height, 16px below header): placeholder "Search by name or email…" with search icon inside left.

User table (full width, 16px below search):
Header row: Name | Email | Role | Status | Last Active | Actions

5 user rows:
Row 1: Avatar circle "NL" (orange bg) + "Nguyen T. Linh" | linh@fpt.com | "User" grey chip | 🟢 "Active" | "Today, 09:32" | ⋯ menu
Row 2: Avatar "TV" (blue bg) + "Tran Van An" | trva@fpt.com | "User" grey chip | 🟢 "Active" | "Yesterday" | ⋯ menu
Row 3: Avatar "LT" (purple bg) + "Le Thi Bich" | lethb@fpt.com | "User" grey chip | 🔴 "Inactive" (row appears slightly dimmed/muted) | "10 May 2026" | ⋯ menu
Row 4: Avatar "DM" (teal bg) + "Do Minh Cuong" | dmcuong@fpt.com | "User" grey chip | 🟢 "Active" | "21 May, 07:10" | ⋯ menu
Row 5: Avatar "AS" (orange bg) + "Admin System" | admin@fpt.com | "Admin" orange chip | 🟢 "Active" | "21 May, 09:00" | ⋯ menu (with fewer options — cannot deactivate own account)

Pagination: "Showing 1–5 of 5" left, no pagination needed.

RIGHT COLUMN (40%) — Create / Edit User Form:
Form card (surface, 8px radius, 16px padding):
Title: "Create New User" in 16px bold.
Fields:
- "Display Name" text input (full width) — placeholder "Full name"
- "Email" text input (full width) — placeholder "name@fpt.com"
- "Role" dropdown (full width) — showing "User ▾"
- "Active" toggle switch — ON (orange)
- "Data Source Access" section:
  Label: "Accessible Sources" in secondary uppercase 11px
  3 checkbox items: ☑ "Jira" ☑ "Email" ☐ "Teams"
Button row: "Create User" (orange filled) | "Cancel" (ghost)

System note at the bottom: "New users will receive an activation email at the provided address." in 12px secondary.

Show in dark mode.
```

**Stitch follow-up prompts:**
- "Show the ⋯ action menu open on Row 2 — dropdown with: Edit, Deactivate, and (greyed out) Delete"
- "Show the deactivate confirmation dialog — modal with warning icon: 'Deactivate Tran Van An? They will immediately lose access to the system.' with Deactivate (red filled) and Cancel buttons"
- "Show light mode"

---

## Additional Stitch Tips

### Generating a dark↔light toggle demonstration
After designing in dark mode, use this follow-up in Stitch:
```
Show the same screen side by side in dark mode (left) and light mode (right) to compare the color switch. The layout and components are identical; only surface colors, background, and text colors change.
```

### Generating a responsive mobile view
```
Redesign this screen for a 390px mobile viewport. The sidebar collapses into a bottom navigation bar with 5 icons. The main content becomes a single column. Cards stack vertically. The table becomes a card list.
```

### Generating a component kit prompt
```
Design a component library sheet for Task Mom 24/7 showing: (1) buttons in all states (default, hover, disabled, loading) in both filled and outlined variants using #F26522 orange, (2) input fields in default, focus (orange outline), and error states, (3) all badge/chip types: source badges (Jira blue, Email purple, Meeting teal, Teams indigo), priority pills (High red, Medium amber, Low green), status chips (Todo grey, In Progress blue, Done green), confidence score pills, (4) the sidebar nav item in default and active states. Dark mode.
```

"""Mock data for Phase 1 testing"""

from agent.models import SourceContent

# Sample email with multiple tasks
EMAIL_1 = SourceContent(
    source="email",
    title="PR Review Request",
    sender="trungnguyen@fpt.com",
    timestamp="2026-05-25T10:30:00Z",
    body="""
Hi Linh,

Please review PR #42 for the authentication module before EOD today.
The OAuth2 implementation needs your sign-off before we can merge to main.

Also, could you update the authentication documentation in Confluence to reflect
the new OAuth2 flow? We should get this done before end of sprint.

Thanks!
Trung
"""
)

# Sample email with client communication
EMAIL_2 = SourceContent(
    source="email",
    title="Client Status Update Request",
    sender="client@xyz.com",
    timestamp="2026-05-23T14:00:00Z",
    body="""
Hi Linh,

Could you send a quick status update on the delivery? Need it by Friday.
What milestones have been completed and what's still remaining?

Thanks,
Client Team
"""
)

# Sample email with implicit tasks
EMAIL_3 = SourceContent(
    source="email",
    title="Team Update",
    sender="manager@fpt.com",
    timestamp="2026-05-22T09:00:00Z",
    body="""
Team,

Just finished the requirements review. Here are a few action items:

1. Need to fix bug #103 — it's blocking the PR merge
2. Update API versioning docs in Confluence
3. Prepare demo slides for client XYZ

ASAP on the bug fix. The rest should be done by end of week.

Thanks
"""
)

# Sample meeting minutes
MEETING_1 = SourceContent(
    source="meeting",
    title="Sprint 3 Retrospective",
    sender="team",
    timestamp="2026-05-22T15:00:00Z",
    body="""
SPRINT 3 RETROSPECTIVE NOTES
Date: 2026-05-22
Attendees: Linh, Trung, Ba, QA Team

SUMMARY:
Sprint 3 focused on OAuth2 implementation. Major progress on auth module.

ACTION ITEMS:
- Linh: Update authentication documentation (OAuth2 flow) — due by end of sprint
- Trung: Review and merge PR #42 — blocking release
- Ba: Conduct security audit of OAuth2 implementation
- QA: Test OAuth2 flow across browsers

NEXT STEPS:
- Plan Sprint 4 planning session (next Monday 14:00)
- Demo OAuth2 to client before release
"""
)

# Sample Jira-style content
JIRA_1 = SourceContent(
    source="jira",
    title="ALPHA-42: OAuth2 Implementation",
    sender="system",
    timestamp="2026-05-20T08:00:00Z",
    body="""
JIRA TICKET: ALPHA-42
Status: In Review
Assigned to: Linh

Description:
Implement OAuth2 authentication for Project Alpha. Replace legacy JWT tokens.

PR: #42 (awaiting review)

Comments:
- TrungNT: "Please review this PR before EOD today. The auth module needs sign-off."
- QA Team: "Ready for testing once PR is merged"
- Manager: "This is blocking the release. High priority."

Related Issues:
- ALPHA-103: Fix null pointer exception in token refresh
- ALPHA-38: Update API documentation
"""
)

# Sample JIRA bug
JIRA_2 = SourceContent(
    source="jira",
    title="ALPHA-103: NullPointerException in token refresh",
    sender="system",
    timestamp="2026-05-21T07:00:00Z",
    body="""
JIRA TICKET: ALPHA-103
Status: Open
Priority: High
Assigned to: (unassigned)

Description:
Null pointer exception occurs during OAuth2 token refresh under concurrent load.
Blocking PR #42 merge.

Expected behavior: Gracefully refresh token
Actual behavior: Exception thrown, token becomes invalid

Environment: Staging

Related: ALPHA-42 (blocks release)
"""
)

# Sample Teams message
TEAMS_1 = SourceContent(
    source="teams",
    title="General channel",
    sender="manager",
    timestamp="2026-05-25T09:00:00Z",
    body="""
@Linh Can you prepare demo slides for client XYZ - May release?
Need them by EOD Friday. They want to see OAuth2 in action.

Also, has the null pointer bug been fixed yet? That's critical path for release.

Thanks!
"""
)

# All mock sources for testing
ALL_MOCK_SOURCES = [
    EMAIL_1,
    EMAIL_2,
    EMAIL_3,
    MEETING_1,
    JIRA_1,
    JIRA_2,
    TEAMS_1,
]

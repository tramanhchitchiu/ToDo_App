"""Jira connector for extracting tasks"""

import csv
from typing import Optional
from agent.models import SourceContent


class JiraConnector:
    """Connect to Jira and extract tasks from issues"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Jira connector.

        Args:
            api_key: Jira API key (for real Jira integration)
                    Will be set up via MCP (Model Context Protocol)
        """
        self.api_key = api_key

    async def fetch_from_url(self, jira_url: str, jql_query: str = "status != Done") -> list[SourceContent]:
        """
        Fetch issues from real Jira instance via MCP.

        Args:
            jira_url: Jira instance URL (e.g., https://company.atlassian.net)
            jql_query: JQL query to filter issues

        Returns:
            List of SourceContent objects from Jira

        Note: MCP (Model Context Protocol) will handle authentication
        """
        # TODO: Implement MCP connection
        # For now, raise NotImplementedError
        raise NotImplementedError("MCP Jira connector not yet implemented")

    async def parse_csv_export(self, csv_path: str) -> list[SourceContent]:
        """
        Parse CSV export from Jira and convert to extraction format.

        Expected CSV columns:
        - Issue Key
        - Issue Type
        - Summary
        - Description
        - Status
        - Priority
        - Assignee
        - Due Date
        - Components
        - Labels

        Args:
            csv_path: Path to Jira CSV export file

        Returns:
            List of SourceContent objects
        """
        contents = []

        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)

                for row in reader:
                    # Skip completed issues
                    if row.get('Status', '').lower() == 'done':
                        continue

                    # Build issue content
                    issue_key = row.get('Issue Key', 'UNKNOWN')
                    summary = row.get('Summary', '')
                    description = row.get('Description', '')
                    assignee = row.get('Assignee', '').strip() or None
                    due_date = row.get('Due Date', '').strip() or None
                    priority = row.get('Priority', 'Medium').lower()
                    status = row.get('Status', 'To Do')
                    components = row.get('Components', '')

                    # Build body text
                    body = f"""Issue: {issue_key}
Type: {row.get('Issue Type', 'Task')}
Status: {status}
Priority: {priority}
Summary: {summary}

Description:
{description}

Components: {components}
"""

                    content = SourceContent(
                        source="jira",
                        title=f"{issue_key}: {summary}",
                        sender="jira-system",
                        body=body,
                        timestamp=None,
                    )
                    contents.append(content)

        except FileNotFoundError:
            raise FileNotFoundError(f"Jira CSV export not found: {csv_path}")

        return contents


class MeetingConnector:
    """Connector for meeting minutes"""

    async def read_text_file(self, file_path: str) -> SourceContent:
        """
        Read meeting minutes from text file.

        Args:
            file_path: Path to meeting minutes text file

        Returns:
            SourceContent object with meeting content
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                body = f.read()

            content = SourceContent(
                source="meeting",
                title="Meeting Minutes",
                sender="team",
                body=body,
                timestamp=None,
            )
            return content

        except FileNotFoundError:
            raise FileNotFoundError(f"Meeting minutes file not found: {file_path}")

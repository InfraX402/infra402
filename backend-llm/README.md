## HTML response components

This backend includes optional tools that return small HTML snippets for richer chat bubbles.

Templates live in `backend-llm/html_resp_templates/` and are rendered via these agent tools:
- `render_remote_connect_card(...)` (console link button)
- `render_lxc_resources_table(...)` (containers list)
- `render_node_stats_card(...)` (node CPU/RAM/Disk summary)

Notes:
- Template values are HTML-escaped to avoid accidental injection.
- For links, `connectUrl` is restricted to `http://` or `https://`.
- The frontend must allow rendering raw HTML in assistant messages for these to appear as UI components.

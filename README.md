# Questify RPG 2.0

This build replaces the dashboard visualization with the visual structure from the supplied Questify RPG v3.0:
- adventure header and profile panel
- level badge and XP progress bar
- three summary cards
- primary action row
- separate active and completed quest sections
- achievement cards

Removed from the old structure: character classes, skills, automatic daily quest rotation, and automatic fixed achievements.

New rules:
- Every quest gives exactly 10 XP once.
- Reactivating a completed quest does not grant XP again.
- Level N requires N × 50 XP to advance from level N to N+1.
- Quests and achievements can be created, edited, completed/toggled, and deleted.
- The 100 quest templates from the v3.0 daily quest catalogue are retained as a searchable manual library.
- Profile name and avatar can be edited; profile/progress can be reset.
- Data is saved in Obsidian plugin data.

Install by copying the `questify-rpg` folder into `.obsidian/plugins/` and enabling it in Community plugins. No build step is required.


## Version 2.1 changes
- The dashboard's Library action is now **History**.
- History groups currently completed quests by completion date (DD.MM.YYYY), showing the day's count and earned XP.
- Reactivating a quest removes it from completed history; completing it again does not award XP again.
- Deleting a quest that has already claimed its 10 XP refunds those 10 XP from the total.
- Completed quests from older data without a completion timestamp use their creation date as a best-effort historical date.

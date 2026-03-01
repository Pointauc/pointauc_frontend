# Working with Pull Requests from Forks

## Using Git Commands (Manual)

1. Add the contributor's fork as a remote:
   ```bash
   git remote add <contributor-username> <fork-url>
   ```
2. Fetch the branches from the fork:
   ```bash
   git fetch <contributor-username>
   ```
3. Checkout their branch:
   ```bash
   git checkout -b <local-branch-name> <contributor-username>/<branch-name>
   ```
4. Make your changes and commit them.
5. Push changes back to their fork (requires "Allow edits from maintainers" enabled on the PR):
   ```bash
   git push <contributor-username> <local-branch-name>:<branch-name>
   ```

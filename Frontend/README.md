Revenir a la dernier commit

  1. `git init`: Initializes a new Git repository.
  2. `git clone [repository]`: Clones a remote repository to your local machine.
  3. `git add [file]`: Adds a file to the staging area.
  4. `git commit -m "[message]"`: Commits changes to the repository with a descriptive message.
  5. `git push`: Pushes committed changes to a remote repository.
  6. `git pull`: Fetches and merges changes from a remote repository to your local branch.
  7. `git branch`: Lists all branches in the repository.
  8. `git checkout [branch]`: Switches to a different branch.
  9. `git merge [branch]`: Merges changes from one branch into the current branch.
  10. `git tag [tagname]`: Creates a new tag for a specific commit.
  11. `git status`: Shows the status of the working directory and staging area.
  12. `git reset [file]`: Unstages changes in a file.
  13. `git rm [file]`: Removes a file from the staging area.
  14. `git mv [file1] [file2]`: Moves or renames a file.
  15. `git log`: Shows commit history.
  16. `git diff`: Shows the differences between commits, branches, or working directory and the staging area.
  17. `git stash`: Temporarily saves changes.
  18. `git stash pop`: Applies the most recent stash and removes it from the stash list.
  19. `git cherry-pick [commit]`: Applies changes from a specific commit.
  20. `git rebase [branch]`: Reapplies commits on top of another base tip.
  21. `git bisect`: Helps find the commit that introduced a bug.
  22. `git blame [file]`: Shows who last edited each line of a file.
  23. `git config --global user.name "[name]"`: Sets the global username.
  24. `git config --global user.email "[email]"`: Sets the global user email.
  25. `git config --global color.ui true`: Enables colored output in Git commands.
  26. `git config --global core.editor "[editor]"`: Sets the default text editor for Git.
  27. `git config --global push.autoSetupRemote true`: Automatically sets up remote tracking branches for new repositories.
  28. `git config --global credential.helper store`: Stores credentials in the macOS Keychain.
  29. `git config --global credential.helper osxkeychain`: Uses the macOS Keychain for storing credentials.
  30. `git config --global credential.helper wincred`: Uses the Windows Credential Manager for storing credentials.
  31. `git config --global credential.helper cache`: Stores credentials in the cache for 15 minutes.
  32. `git config --global credential.helper 'cache --timeout=3600'`: Stores credentials in the cache for 1 hour.
  33. `git config --global credential.helper 'store --file=.git-credentials'`: Stores credentials in a file.
  34. `git config --global credential.helper 'store --file=.netrc'`: Stores credentials in a .netrc file.
  35. `git checkout -b [branch]`: Creates a new branch and switches to it.
  36. `git checkout -- [file]`: Discards changes in a file.
  37. `git checkout -- .`: Discards all unstaged changes.
  39. `git checkout --theirs [file]`: Discards local changes and replaces them with changes from the specified branch.
  40. `git checkout --ours [file]`: Discards changes from the specified branch and replaces them with local changes.
  41. `git checkout -- .`: Discards all unstaged changes.
  42. `git reset --hard [commit]`: Resets the current branch to a specific commit and discards all uncommitted changes.
  43. `git reset --soft [commit]`: Resets the current branch to a specific commit and keeps uncommitted changes.
  44. `git reset --mixed [commit]`: Resets the current branch to a specific commit and keeps uncommitted changes.
  45. `git reset --merge [commit]`: Resets the current branch to a specific commit and keeps uncommitted changes.
  46. `git reset --keep [commit]`: Resets the current branch to a specific commit and keeps uncommitted changes.
  47. `git reset --soft HEAD~1`: Resets the current branch to the previous commit and keeps uncommitted changes.
  48. `git reset --hard HEAD~1`: Resets the current branch to the previous commit and discards all uncommitted changes.
  49. `git reset --mixed HEAD~1`: Resets the current branch to the previous commit and keeps uncommitted changes.
  50. `git reset --merge HEAD~1`: Resets the current branch to the previous commit and keeps uncommitted changes.
  51. `git reset --keep HEAD~1`: Resets the current branch to the previous commit and keeps uncommitted changes.

<!-- # lancer MongoDB in ubuntu -->
  sudo systemctl start mongod
  sudo systemctl stop mongod
  sudo systemctl restart mongod

  sudo systemctl daemon-reload

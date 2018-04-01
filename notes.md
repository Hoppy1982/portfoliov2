# Notes

## Git notes
*The files in your working directory can have one of four statuses:-*
* Untracked
* Unmodified
* Modified
* Staged

*The rough idea is you choose the files that you want to be tracked with git then tinker with changes in a staging area (the index file) then finally commit your changes to the repo.*
* Create a repo
* Specify files to track or ignore
* Add and remove files from the staging area until happy
* Commit your edits to a branch
* Push, pull, merge, fetch etc?

*Files in your project should either be tracked on listed in the .gitignore file. I haven't found a way to add files to .gitignore other than editing .gitignore in a text editor.*

*If you move or rename a tracked file then `git rm <oldfilename>` then `git add <newfilename>` seems to work.*

## Git commands
* `$ git init`

  *Creates a git repo in current working dir*

* `$ git add <filename>`

   *Starts tracking the file(s) & adds the file(s) to the staged area, ready for next commit. Use this command every time before commits on the files you want to update on git, NOT just once after you initially create the file(s).*

* `$ git rm <filename>`

  *Removes file(s) from the staging area and deletes the file. If you modified the file after adding it to the staging area you must use `git rm <filename> -f` to force removal. Use `git rm --cached <filename>` to keep the file locally in the working dir but have Git stop tracking it. Useful if you accidently added something to the staging area.*

* `$ git status`

  *Shows the working tree status, --short gives consise output.*

* `$ git commit`

  *Stores the contents of the index (staging area) in a new commit with a message. Use 'git commit -a' to automatically add changes from modified files. This is basically skipping the staging area.*

* `$ git log`

*Lists commits with SHA-1 hash, author and timestamp. Use `git log --patch -2` to see the actual edits of the last 2 commits. The log command assumes the current branch but you can specify other bracnhes. `git log --stat` for summary of commit changes.*

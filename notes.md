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
* Push, pull, merge and all that crap ????

## Git commands
* git init

  *Creates a git repo in current working dir*

* git add \[file/dir\]

   *Starts tracking the file(s) & adds the file(s) to the staged area, ready for next commit. Use this command every time before commits on the files you want to update on git, NOT just once after you initially create the file(s).*

* git status

  *Shows the working tree status, --short gives consise output.*

* git commit

  *Stores the contents of the index (staging area) in a new commit with a message. Use 'git commit -a' to automatically add changes from modified files. This is basically skipping the staging area.*

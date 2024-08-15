---
title: "Fetch github PRs from the command line"
modified:
categories: code
excerpt:
tags: [code, git]
date: 2024-08-14
---

**TL;DR** For a single repo, add a special
"[refspec](https://git-scm.com/book/en/v2/Git-Internals-The-Refspec)"
for a remote (e.g. `upstream`):
```shell
git config --add remote.upstream.fetch "+refs/pull/*/head:refs/pullreqs/*"
```
which will allow you to do things like this:
```
leo@conservation:spectre> git fetch upstream
remote: Enumerating objects...
...
 * [new ref]               refs/pull/6218/head -> refs/pullreqs/6218
leo@conservation:spectre> git log refs/pullreqs/6218 # Or git diff, any git command
commit 5de7c8b1c54df99587f3a2e923e99b8db7a16f9f (HEAD)
Author: Carter Anderson <cra3@williams.edu>
Date:   Wed Aug 14 13:35:23 2024 -0400

    Add option for higher dimension EOSes to Spec initial data

...
leo@conservation:spectre> git checkout refs/pullreqs/6218
leo@conservation:spectre> git switch -c workOnHelpingThisPR
```
{: .no-copy}
and then you'll be at work on top of this PR. This means you don't
have to go find and add the remote for this PR.

I learned this magic refspec from the
[forge](https://magit.vc/manual/forge.html) package for
[magit](https://magit.vc/) (which is itself an
[emacs](https://www.gnu.org/software/emacs/) package). If you want to
become one with git, I highly recommend magit.

# Save for future convenience

You can make yourself a global git alias to automate this, so you
don't have to remember the magic incantation for the above refspec.
Run the following one-liner (though it is a very long line):
```shell
git config --global alias.addFetchGithubPRs '!MYREMOTE=${1:-origin}; if git remote get-url "$MYREMOTE" >/dev/null 2>&1; then if git config --get-all remote."$MYREMOTE".fetch | grep -q "+refs/pull/\*/head:refs/pullreqs/\*"; then echo Found correct refspec; else git config --add remote."$MYREMOTE".fetch "+refs/pull/*/head:refs/pullreqs/*"; echo Added refspec; fi ; else echo Remote not found: "$MYREMOTE"; fi #'
```
Now from inside your favorite repo, you can do:
```
leo@conservation:myrepo> git addFetchGithubPRs [remoteName]
Added refspec
```
{: .no-copy}
The default `remoteName` is `origin`, but by changing the alias above,
you can make it be something else (like `upstream`). If the remote
doesn't exist, you get an error. If the refspec already existed, it
will tell you that.

---
title: "Whitespace Cleanup on Diff Lines in Emacs"
modified:
categories: code
excerpt: "If you're in the intersection of git, emacs, and persnickety about whitespace."
tags: [code, emacs, lisp, git]
date: 2015-09-09T19:21:06-07:00
---

Some of us are particular about whitespace, especially in files under
version control (PS: you should be using version control,
e.g. [`git`](https://git-scm.com/)).  If you’re like me and you use
[`emacs`](https://www.gnu.org/software/emacs/), then you can often use
`whitespace-cleanup` (from
[`whitespace.el`](http://emacswiki.org/emacs/WhiteSpace)) to keep your
source files pristine.

The trouble comes if a collaborator doesn’t respect your whitespace
wishes.  If you just run `whitespace-cleanup` on your entire buffer,
your revision history and `git blame` will be useless.

So far, my solution is to sanitize the whitespace only on the lines
that I’m editing.  I was doing this by hand, but since I use `emacs`,
it was time to automate things and learn some rudimentary
[`elisp`](https://en.wikipedia.org/wiki/Emacs_Lisp) in the process.
Without further ado:

```elisp
(defun buffer-file-git-diff-regions () ""
  (or (magit-git-dir) (error "Dir NOT in a git repo: %s" default-directory))
  (let ((file (buffer-file-name)))
    (or file (error "Buffer \"%s\" does not have a file associated to it" file))
    (let* ((command (concat "git diff -U0 " (shell-quote-argument file) "| grep \"^@@\" | cut -d' ' -f3 | tr +, ' '"))
           (output (shell-command-to-string command))
           (lines (split-string output "\n" t))
           (line-pair-helper (lambda (x) (if (not (cadr x)) (list (car x) 1) x)))
           (line-maybe-pairs (mapcar (lambda (x) (mapcar 'string-to-number (split-string x " " t))) lines)))
      (mapcar line-pair-helper line-maybe-pairs))))

(defun buffer-file-git-diff-regions-apply (func) ""
  (interactive "aFunction to apply to dirty regions: ")
  (save-excursion
    (dolist (line-len (buffer-file-git-diff-regions))
      (goto-char (point-min))
      (forward-line (1- (car line-len)))
      (push-mark)
      (forward-line (cadr line-len))
      (funcall func (region-beginning) (region-end))
      (pop-mark))))

(defun whitespace-cleanup-git-diff-regions () ""
  (interactive)
  (buffer-file-git-diff-regions-apply 'whitespace-cleanup-region))
```

The end-user command is `whitespace-cleanup-git-diff-regions`, which
you can run interactively from a file that’s under `git` control.  Though you can also
use the general function `buffer-file-git-diff-regions-apply` to run
any function of the type `(function region-beginning region-end)` on
all the “dirty” regions.

This uses [`magit`](http://magit.vc/), but just to test if we are in a
directory under `git` control.  You could swap this out if desired.
The magic command-line incantation
`git diff -U0 <filename> | grep "^@@" | cut -d' ' -f3 | tr +, ' '`
will generate a newline-delimited list of “dirty” regions of the form
`" lineno numlines"`.  I then run `whitespace-cleanup-region` on each
of these regions, and we’re done!

So I’ve learned a bit of `elisp`, and potentially saved my future self
entire minutes of editing.  I hope somebody else benefits, too!

Sorry about the lack of documentation.  Use at your own risk (which is
basically zilch, because you use `git`, right?).  Ping me if you have
improvements.

---
title: "Reuse ssh connections for hosts with 2FA (with emacs bonus)"
modified:
categories: code
excerpt:
tags: [code, ssh, emacs]
date: 2024-08-15
---

The ssh protocol is smart enough that you can open a control 'master'
connection and reuse it to logically "connect" to the same machine as
many times as you want (e.g. have many shells, tunnel traffic[^1], etc.)
all over a single underlying connection.

This is really convenient for hosts that use two-factor authentication
(2FA) when you connect---for example, a lot of HPC head nodes will
prompt you to open Duo Mobile to authenticate.  **If you reuse your
ssh connection, you do not have to re-authenticate** your 2FA
credentials every time, as long as your control connection is still
open.

Put this into your `.ssh/config` file:
```
Host *
  ControlMaster auto
  ControlPath /tmp/ssh-%r@%h:%p
```
The `%r@%h:%p` magic will keep a separate socket for each (username,
host, port).  Of course you may want to only enable it for certain
hosts---in that case put the `ControlMaster` and `ControlPath`
keywords into the corresponding `Host` sections.

Now for the emacs bonus (and the real reason I'm writing this down,
lest I forget).  The
[tramp](https://www.gnu.org/software/emacs/manual/html_node/tramp/index.html)
package lets you access remote files in your local emacs (rather than
running emacs on the remote server).  This means you don't have to
worry about old versions of emacs on some cluster, maintain multiple
emacs configurations, etc.  In emacs you visit
`/ssh:user@host:/path/to/file` and emacs transparently edits the
remote file.[^2]  But if you need to do 2FA, your flow is interrupted or
worse emacs gets confused by the 2FA prompt.  So, best if tramp uses
control connections if they're available.  Therefore you should
configure [a certain
variable](https://www.gnu.org/software/emacs/manual/html_node/tramp/Ssh-setup.html#Using-ssh-connection-sharing-1)
interactively with
```
M-x customize-variable RET
tramp-use-ssh-controlmaster-options RET
nil RET
```
{: .no-copy}
or by evaluating the elisp
```elisp
(customize-set-variable 'tramp-use-ssh-controlmaster-options nil)
```
The value `nil` tells tramp to use whatever `Control*` variables
you've set in your `.ssh/config` file---so it can reuse a control
connection you already have open.

[^1]: See e.g.
      [this earlier post]({{ site.url }}{% post_url 2017-04-19-ssh-ipython-notebook-magic %}) 
      about tunneling jupyter notebooks running on the remote.

[^2]: You should set up host aliases with your username specified in
      your `.ssh/config` file. Then you only need to visit `/ssh:alias:/path/to/file`

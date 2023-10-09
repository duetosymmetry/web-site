---
title: "ssh ipython notebook tunneling magic"
modified: 2021-07-07
categories: code
excerpt: "How to get remote jupyter to automatically open a local browser."
tags: [code, ssh, remote, tunnel, python, ipython, jupyter, iterm2, scientific computing]
date: 2017-04-19T22:24:00-07:00
---

The problem: you have large datasets on a remote machine and want to
use a [`jupyter`](http://jupyter.org/) notebook to
interactively analyse your data.  You could transfer the data to your
local machine, or mount the remote drive.  But ideally, the `jupyter`
server should run on the remote machine, so that only the much smaller
*web page* data is transferred.  This is what you want to happen:

<iframe width="560" height="315" src="https://www.youtube.com/embed/rfGnFiO9sME?si=mnJu2a2pLI2JKQ53" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

If you've ever started `jupyter` locally, this will look familiar.
But if you launch it on the remote machine, then `jupyter` is going to
try to launch a browser on the remote instead of locally.

One solution is to use `ssh` tunneling, but you're responsible for
opening the tunnel and manually connecting your local browser to the
tunnel.

I pulled together a solution that involves
an [`iTerm2`](https://www.iterm2.com/) trigger to locally launch your
browser.  This will work in any programmable terminal that has trigger
functionality.  There may be other solutions, please contact me if you
have something cleaner.

**Update 2021-07-07**: I updated these instructions to include how to
capture the token that's output when your jupyter session is secure.

# Instructions

There are just 3 steps:

1. On your local machine, set up your `ssh_config` to always forward a
   specific port for this remote host.  It's most convenient for this
   to be the same local and remote port, and it should be one that you
   expect to be free (for example, something in the range 49152—65535).
   I picked 8889, leaving 8888
   free for a locally-running `jupyter`.  To do this, add an entry for
   the remote host in `~/.ssh/config` with the `LocalForward` keyword
   like so:
   
   ~~~
   Host wheeler
     HostName     wheeler.caltech.edu
     User         leostein
     ForwardX11   no
     LocalForward 8889 localhost:8889
   ~~~
   
   This tells `ssh` that whenever I `ssh wheeler`, it's also going to
   forward my *local* port 8889 to the *remote* interface:port pair
   localhost:8889, which is where the remote `jupyter` server is going
   to be listening.

2. On your remote machine, edit your
   `~/.jupyter/jupyter_notebook_config.py` to use a custom port,
   custom "browser", and no redirect file.
   If you don't already have a config file, then run `jupyter notebook
   --generate-config` to create one in the default place.  Open this
   file and find the variable named `NotebookApp.browser`.  Uncomment
   it and set it to emit a magic keyword.  I set this:
   
   ~~~ python
   c.NotebookApp.port = 8889
   c.NotebookApp.browser = u'echo TRIGGER-ITERM-2-WHEELER-JUPYTER %s'
   c.NotebookApp.use_redirect_file = False
   ~~~
   
   The `%s` is going to get replaced with the URL on the remote
   server.  I found that the `%s` is necessary for `jupyter` to
   actually execute this command.

3. Configure `iTerm2` with a trigger.  Go to Preferences > Profiles,
   select the relevant profile (probably default if you haven't
   customized anything).  Then go to Advanced, and under Triggers, hit
   Edit:
   
   ![]({{ site.url }}/images/iterm2-prefs-profs-advanced.png)
   
   Hit the plus to add a new trigger.  Set the regular expression to
   (for example)
   
   ~~~
   ^TRIGGER-ITERM-2-WHEELER-JUPYTER (.*)$
   ~~~
   
   using the same magic keyword as in step 2 (if you omit the caret,
   you're going to have an annoying time editing the
   `jupyter_notebook_config` in the future, if you need to do that).
   The parenthetical pattern will be captured so we can use it for the
   following command.
   Set the Action to 'Run Command...'.  Then set the Parameters to
   
   ~~~
   open "\1"
   ~~~
   
   This will get you the correct token.  If you are using a different
   local and remote port, you will need to work harder.
   You should see something like this:
   
   ![]({{ site.url }}/images/iterm2-prefs-profs-advanced-2.png)
   
That's it! Next time you `ssh` to your remote host from `iTerm2` and
start `jupyter`, your local browser will launch and automatically
connect to the remote ipython session.

# Extra credit

The solution above picked a specific local port to go with a specific
server, and tunnels to a predetermined remote port.  It won't work if
you try to have multiple remote jupyter servers on the same remote.
You will also have to have specific port numbers in your `ssh_config`
and `iTerm2` triggers, one for each remote.

There is a better solution.  `iTerm2` will capture groups in triggers'
regular expressions, and can pass them as parameters to the
command. Therefore you can:

1. Set your remote jupyter `NotebookApp.browser` to also emit your
   \<remote_user\> and \<remote_host\>
2. Write a trigger regex to match the above string and capture groups
   for username, hostname, and \<remote_interface\>:\<remote_port\> pair
   out of the URL
3. Pass those parameters to a local (python) script
4. Your python script must find a free local port, say \<local_port\>.
   Then it will execute
   
   ~~~
   ssh -N -f -L <local_port>:<remote_interface>:<remote_port> <remote_user>@<remote_host>
   ~~~
   
   where values in angled brackets get replaced with parameters that
   were passed from the regex capture groups.
5. Finally, your script will launch your local browser pointing to
   "http://localhost:\<local_port\>/tree".

If you implement this, please let me know!

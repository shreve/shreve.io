---
title: Finding the current Git branch in CodeBuild
tags:
- AWS
- git
- bash
date: 2022-02-26
---

[Skip to the code](#the-code)

I want to use the name of the current git branch in nearly every automated build
I run on CodeBuild, usually for tagging docker images. CodeBuild doesn't make
this value available, just the commit hash it fetched.

No problem! There's a command that's pretty commonly seen for grabbing the
branch name yourself:

```shell
git rev-parse --abbrev-ref HEAD
```

The command `rev-parse` fetches information about a revision, the parameter
`HEAD` means where we are now, and the option `--abbrev-ref` asks for a
non-ambiguous name for the revision in question. This typically results in the
name of the current branch.

There actually is a problem, though. This command doesn't work as expected on
CodeBuild. It will always return `HEAD` instead of the name.

No worries! We'll just take a look in the git directory and see if we can sort
this out ourselves.

```shell
ls .git
.git
```

Whoops, it turns out they're using a detached worktree which makes .git a file
that contains the name of the real data directory. Well, we can still use the
worktree porcelain to take a look at what we've got:

```shell
git worktree list --porcelain
worktree /codebuild/local-cache/workspace/037017878334821233e13c831b4e3454b9a39f7d3678db91b07531daf15e12be/.git
HEAD 6a2dbaadee105594f481e3dd524ad4f2a59922ca
detached
```

Shoot. That explains why the rev-parse command fails. [The last line of this
output should include a branch, but it's omitted when in a detached state.](
https://git-scm.com/docs/git-worktree#_porcelain_format)

However, it turns out we can still look in the git data directory and see some
information about available refs. They had to pull something, right?

If you look, you'll see `refs/heads/` with at least one head pointing to a ref.
It stands to reason that one of these will be the current commit. Of course we
also have that hash inside the `HEAD` file. Using this info, we can find the
branch name we're looking for with the following bash script: <a name="the-code"></a>

```bash
branch_name() {
  # Get the name the standard way
  name="$(git rev-parse --abbrev-ref HEAD)"

  # If we get the value "HEAD" and .git is a file,
  # we're probably in CodeBuild.
  if [ "$name" == "HEAD" ] && [ -f .git ]; then
    # Read in the real git directory location
    dir="$(awk '{print $2}' < .git)"

    # Get the current commit hash
    commit="$(cat "$dir/HEAD")"

    # Look through the heads we know about
    for head in "$dir/refs/heads"/*; do

      # Find the named branch with the same commit we're on
      if [ "$(cat "$head")" = "$commit" ]; then
        name="$(basename "$head")"
        break
      fi
    done
  fi

  # Report what we found
  echo "$name"
  return 0
}
```

If you know of a better way to get this information (particularly with a git
builtin), please let me know! This was the best solution I could figure out in
a CodeBuild build.

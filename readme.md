# update-amis

Give a string or file with some ubuntu EC2 image ids in it, replace them with the most
up-to-date image ids that share the same attributes (architecture, virtualization type, etc.)

Setup with `npm install -g`

```sh
# Prints to stdout
$ cat path/to/some-template.template | update-amis

# Updates named file
$ update-amis path/to/some-template.template
```

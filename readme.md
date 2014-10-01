# update-amis

Give a string or file with some ubuntu EC2 image ids in it, replace them with the most
up-to-date image ids that share the same attributes (architecture, virtualization type, etc.)

## Setup
```sh
$ git clone git@github.com:mapbox/update-amis
$ cd update-amis
$ npm install -g
```

## Usage
```sh
# Prints to stdout
$ cat path/to/some-template.template | update-amis

# Updates named file
$ update-amis path/to/some-template.template

# Just prints an up-to-date ami
$ update-amis ami-b6cca686
```

## Caveats
Finds a matching AMI based on:
- architecture
- owner
- root-device type
- virtualization type
- name: ubuntu names their amis predictably, so that you can match ubuntu versions and find the most up-to-date. Example: `ubuntu/images/ubuntu-trusty-14.04-amd64-server-20140927`

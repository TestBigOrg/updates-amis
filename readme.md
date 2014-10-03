# update-amis

Give a string or file with some ubuntu EC2 image ids in it, replace them with the most
up-to-date image ids that share the same attributes (architecture, virtualization type, etc.)

## Setup
```sh
$ npm install -g
```

Make sure that your environment is configured with appropriate AWS credentials.
See http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html for
details.

## Usage
From the command-line:
```sh
# Prints to stdout
$ cat path/to/some-template.template | update-amis

# Updates named file
$ update-amis path/to/some-template.template

# Just prints an up-to-date ami
$ update-amis ami-b6cca686
```

Or in javascript:
```javascript
var finder = require('update-amis');

// Get details about a particular AMI
finder.getInfo('ami-b6cca686', function(err, info) {});

// Find the most up-to-date AMI
finder.findUpdatedAmi('ami-b6cca686', function(err, newami) {});
```

## Caveats
- Only for Ubuntu AMI's that you could find here: http://cloud-images.ubuntu.com/locator/ec2/
- Finds a matching AMI based on:
    - architecture
    - owner
    - root-device type
    - virtualization type
    - name: Ubuntu names their amis predictably, so that you can match versions and sort by date. Example: `ubuntu/images/ubuntu-trusty-14.04-amd64-server-20140927`

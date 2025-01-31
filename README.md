# Template Image Builder

**Author**: Sten Healey\
**License Summary**: This is proprietary software and unavailable for any form of use or re-use of any variety. [Full License](LICENSE.txt)

## Description
This application was inspired by a need (or rather a gap in the market) left by applications like Canva and Photoshop. While vastly more complex and feature rich both Canva and Photoshop fail to provide a way to automatically create a significant number of permutations of a an image that vary significantly.

Therefore, the primary goal was to implement an application that allowed users to create significant number of images from a single (saveable) image template. This application allows the user to  configure an image template and then generate a number of permutations based upon said template.

## How To Run In A Development Environment
> [!NOTE]
> This application was designed and built on a windows device, therefore no guarantees can be provided regarding it's behaviour on another device. However, it is expected that minimal adaptation would be required in order for it to operate on a Linux or Mac.

**Dependencies**

1. Node.js must be installed

**Guide:**

1. Please download the repository

2. Navigate to the root of the repository in your terminal and execute the follow command in order to install Node.js dependencies

```console
npm install
```

3. To run the application please execute the following command:

```console
npm start
```

## How To Build/Package The Application Into An .appx

> [!Note]
> This will only package the application for Windows.

**Dependencies**

1. Node.js must be installed

**Guide:**

1. Please download the repository

2. Navigate to the root of the repository in your terminal and execute the follow command in order to install Node.js dependencies

```console
npm install
```

3. Open the file `forge.config.js`

4. On line 17 and 18 please provide a valid certificate path and certificate password.

5. To build/package the application please execute the following command:

```console
npm run make
```

6. Navigate to the relative directory `out/make/appx/x64` to find the application packaged as an appx file. This can be installed as a standard application.

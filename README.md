# Template Image Builder

**Author**: Sten Healey\
**License Summary**: This is proprietary software and unavailable for any form of use or re-use of any variety. [Full License](LICENSE.txt)

## Description
This application was inspired by a need (or rather a gap in the market) left by applications like Canva and Photoshop. While vastly more complex and feature rich both Canva and Photoshop fail to provide a way to automatically create a significant number of permutations of a an image that vary significantly.

Therefore, the primary goal was to implement an application that allowed users to create significant number of images from a single (saveable) image template. This application allows the user to  configure an image template and then generate a number of permutations based upon said template.

## How To Run In A Development Environment
> [!NOTE]
> This application was designed and built on a Windows device, therefore no guarantees can be provided regarding it's behaviour on another device. However, it is expected that minimal adaptation would be required in order for it to operate on a Linux or Mac.

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


## Application Feature Preview

![Screenshot of Template Image Builder](docs/Application%20Layout.PNG)

### Notes:

**Menu Options**
1. The `Open` option on the menu can be used to load a configuration file (the extension is `.bit` short for "Bulk Image Template").

2. The `Save` option will auto save if a configuration file has already been opened.

3. The `Save As` option allows the user to save a configuration file under a new name.

4. The `Import Text` option allows the user to open a multi-line text file (`.txt`) to pre-fill the "Image Text" field in the application. Note: each line in the text file will correspond to a new entry.

5. The `Build Text` option allows the user to build all possible permuations of the image based on the configuration of the application.


## Warnings And In-accessible Features

This version of the application is meant to act as an application pre-view. It is not the completed application and therefore the following features are not implemented:

* The `Settings` option has not been implemented but will allow the user to set:
    
   * The aspect ratio of the image

   * The default (field) values for the application

   * Caching fonts locally & manually updating fonts

   * Other premium features (e.g setting generative AI url)

**Planned Features - Premium Version**:

* AI Image Generation (with a local server implementation) - for background images

* Background colors - both preview and actual

* Changing the aspect ratio of the image

* Changing the default (field) values for the application

* Caching fonts locally & manually updating fonts



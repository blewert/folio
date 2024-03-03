
# The backstory
Like any typical software developer, I have a pretty serious obsession with coffee. I love a super strong black Americano with no sugar, no milk, nothing. One morning this year, I went down to the on-campus coffee shop and bought an Americano, like I do any other day. However, my colleague showed me that the coffee shop uses an app which enables you to collect stamps. You know, kind of like the loyalty cards that get a stamp every time you buy -- but all digital! 

What was cool about it was that the cashier *actually* stamps your device with a little rubber stamp, rather than scanning a QR code. I loved this idea, and it felt so much more rewarding when buying a coffee. I collected a total of 15 stamps over the next two weeks or so, and got a free coffee. Once you have a free coffee, you can redeem it through the app and show it to the cashier.

But what got me interested is the validation of the stamp. I thought about every time I received a stamp and how the confirmation noise was almost instantaneous. There was no delay. It made me think about what the app was doing; how does it know when a stamp touches the screen? Is there some kind of offline validation taking place? What algorithm is being used to determine what is going on? How does it know when a human has touched it, or when the stamp has? 

Because the confirmation was almost instant, I realised that the data representing the stamp press wasn't being sent off to a server for validation, and was probably using some complicated algorithm to determine what a stamp looks like. I confirmed this by putting my phone into airplane mode, and a stamp press worked perfectly fine as usual. And so began a very deep rabbit hole which resulted in many nights of poking around the APK.

This is the story of how I broke an application for free coffee, and some insights into security if you are building React Native apps. I have anonymised the app's name and details as stealing free coffee is ethically questionable at best, and the purpose of this article is for educational purposes only. I have also informed the app developers of the exploits mentioned. 


# Decompiling an APK
Decompiling APKs is surprisingly easy, especially when compared to other disassembly toolsets like IDA Pro. It turns out that there is a great utility called [jadx](https://github.com/skylot/jadx), which can decompile APKs directly to Java source code. Like most disassemblers, it won't produce the same original source code, but code which is functionally very similar. It also provides deobfuscation atop of this too.

This tool was the first step of the investigation I wanted to carry out. Prior to this I had some experience with Dalvik assembly, but largely focused on building apps with either native Java, React Native or Flutter. 

## The first steps
I started by downloading the latest version of the APK from the Google Play store and running JADX on it. From here, JADX enables you to poke around the disassembled source code and view what is going on. Due to the nature of APKs and the format in which they are bundled with, disassembling executables like these provide a lot more reflection than other mediums. 

For example, disassembling a PE32 Windows application will typically only result in a shedload of x86 disassembly code. This is useful, and you certainly can build a clear picture of what is going on, but it can be limiting. Disassembling an APK with JADX however, gives you the name of the classes used throughout development, along with a good approximation of the original source code. With this, you can blast through the disassembly of an app and pinpoint areas of interest quickly.

## Initial findings
After a run of the app through JADX, I found some interesting initial findings. As mentioned earlier, I wanted to figure out how the app figures out whether a human has touched the screen, or if the stamp has. It could be a variety of things; maybe NFC, or maybe there is a ML-based algorithm which can determine if a set of touches are human or not. 

I figured out pretty quickly that this was an app built with React Native, rather than using a native language. This was evidenced by the presence of a `index.android.bundle` file. Basically, React Native bootstraps an app by providing native code to provide a host for bundled JS, and then loads the `index.android.bundle` file into what is essentially a web browser.  

Building apps with React Native is a good idea, but there are a few things to consider with regards to security:

- The minified source code is listed in its entirety in the bundle file, to the prying eyes of malicious users.
- It is very easy to decompile the app, swap out the bundled JS for something else, and recompile it back into an APK. This is in contrast to native apps, which would typically need the users to modify the Dalvik assembly code directly. 

Ordinarily, these points don't matter too much, especially if your app is mostly a frontend for some service. If your app is essentially a dumb client and nearly everything is done server-side then you don't have to worry too much if someone alters the client code. It is worth mentioning though that server-side validation of sent data should *always* take into account that the user might be doing nefarious things. Don't assume that the client is constrained by the limitations of the app. A good tip is to try to think of the worst case: what would happen if the user did modify the code? What's the worst thing that can happen? Could they do something nefarious? 

In this case, we have something which *seems* to doing quite sophisticated validation of haptic input entirely on the device. There *appears to be* no server-side validation, and even if there was, we may still be able to trick the device into thinking that a successful response was received. If we were to break this, we could simply just trick the app into thinking that we've stamped the screen. The result? Free coffee. That's a pretty bad downside to trusting that the users of your app are using it in the way you'd expect.


# The nitty gritty
The first thing to do is to decompile the apk with the wonderful `apktool`. This will enable us to look at the raw `.smali` files and more crucially, the `index.android.bundle` file. To carry this out we can use:

```sh
# Where the-app.apk is the path to an apk
apktool d the-app.apk
```

This extracts the apk and creates a new folder in the current directory for the `.smali` & assets files. You can then navigate to the `assets/index.android.bundle` file to see the main bulk of JS loaded to run the app. This bundle will contain *all* the source javascript required to run the app, so it might take you a while to sift through to the important bits.

After enough searching, I found an interesting bit of code in the bundle:

```js
{
    key: "_check",
    value: function()
    {
        if (!this._locked)
        {
            var e = this._event;
            if (e) return this.props.debug && this.props.isEmulator && 2 == e.touches.length ? (this._locked = !0, void this._sendSimulatedBlock(e)) : void(e.touches.length >= 5 && (this._locked = !0, this._validate(e)))
        }
    }
},
```

The code does the following:

- Checks if the app has "locked" out the user after attempting to put in X amount of invalid codes. If they are not locked out; then:
- If event data was passed, then:
- If the debug flag is set, and this is an emulator, and there are two touches on the screen:
    - Call a function called `sendSimulatedBlock`, which appears (based on the name) to send a simulated stamp press
- Otherwise:
    - If the number of touches is >= 5, call the `validate` function, passing `e`, which appears (based on the name) to validate if the touches on the screen are actually a stamp.

This is very interesting, and from analysing this function we can draw some interesting conclusions about the app:

- The stamp press validation appears to be offline, as we suspected, and is based on touch event data (as the event data is passed `validate`)
- What constitutes a valid stamp press is if 5 or more touches are on the screen at once; the `validate` function is called.
- Assuming `this.props.debug` is `false` for production release, the `validate` function is always called.
- The developers who built this app were using a debug flag (`this.props.debug`) to test the app's functionality. If this flag is set to `true`, and the app is ran using an emulator, it will call the `sendSimulatedBlock` function. Here `2 == e.touches.length` checks if the number of touches pressed is 2; this is likely because it is hard to recreate multiple touches on an emulator. You can however hold CTRL and click on the emulated screen to simulate two simultaneous touch events.

Tricking the app into thinking a stamp has been pressed against the screen might be as easy as hard-replacing the `this.props.debug && this.props.isEmulator` condition with `true`. This would ensure that the `sendSimulatedBlock` function is *always* called instead of the function to validate touches.

## The validate() function
Lets examine the `validate` function to see what it does. We currently have two options of tricking the app into giving us free stamps:

- Either by just calling `sendSimulatedBlock` by turning the condition discussed earlier to `true`, so the debug mode is enabled.
- Or what might be more fitting for what we want, to essentially alter the `validate` function such that it *always* says *"yup! looks like a valid stamp to me!"*.

The `validate` function code is below.

```js
{
    key: "_validate",
    value: function(e)
    {
        var t = this,
            n = arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
            o = Date.now(),
            s = this._convertTouches(e.touches);
        this._log('StampingArea > _validate > Validating touches...', s), p.recognise(s, n).then((function(u)
        {
            if (t._log(`StampingArea > _validate > Recognise took ${Date.now()-o}ms`), u.length < 1)
            {
                if (t._log('StampingArea > _validate > Zero blocks recognised'), !n) return t._log('StampingArea > _validate > Trying with device correction disabled'), void t._validate(e, !0);
                var l = {
                    touches: s,
                    deviceCorrectionDisabled: n
                };
                return t._event = void 0, void t.props.onStamp(l)
            }
            var c = u[0];
            t._log('StampingArea > _validate > Recognised block:', c), t._event = void 0, t.props.onStamp(c)
        })).catch((function(e)
        {
            t._event = void 0, t._log('StampingArea > _validate > Error during recognise', e)
        }))
    }
},
```

The function calls `p.recognise(s, n)` and once completed, calls a callback with a parameter called `u` which appears to be an array. The length of `u` seems to determine the success of the recognition process: if zero "blocks" are recognised (`u.length < 1`) then it tries without device correction enabled. 

So far we have heard the term "block" before; we saw the `sendSimulatedBlock` function being called in debug mode. From analysing the underlying disassembled Java code with `jadx`, it can be seen that there is actually another library which does the "recognition" of multiple screen touches. The term "blocks" is used here too -- I'm unsure what exactly these mean. From examining the physical stamp used in the cafe, it appears to be a square matrix of rubber stamps which simulate multiple touches in a certain pattern. It could be that these cells are referred to internally as "blocks"; that's my best guess. For the sake of anonymity I won't mention what this library is. 

In our case we don't really care if there's any offline or online validation done here. We can see that if the stamp is successful, then `t.props.onStamp(c)` is called. All we have to do to skip the validation is remove the `p.recognise(...)` code and skip straight ahead to `t.props.onStamp(...)`. There is another function passed via props as `this.props.onIncompleteStamp(...)` which is called if an invalid stamp attempt is made:

```js
{
    key: "_onResponderRelease",
    value: function()
    {
        var e = this;
        this._log('StampingArea > _onResponderRelease > begin',
        {
            locked: this._locked
        }), this._locked ? setTimeout((function()
        {
            e._event = void 0, e._locked = !1
        }), 300) : this.props.onIncompleteStamp && this._event && this._event.touches.length >= 3 && (this._log('StampingArea > _onResponderRelease > Found incomplete stamp attempt:', this._eventToJson(this._event)), this.props.onIncompleteStamp(this._convertTouches(this._event.touches)), this._event = void 0)
    }
},
```

The last line is interesting; there is a `this.props.onIncompleteStamp` function which is called. It would be interesting to see if there is also a `this.props.onCompleteStamp`. So far, we have already seen a `onStamp` function. We can perhaps assume that this function calls `onIncompleteStamp` or `onCompleteStamp` (if it exists) based on the recognised block data. 

Before we examine the `t.props.onStamp(...)` method, we must first figure out what needs to be passed to the function in order for it to work correctly. Earlier we saw that it was invoked and `c` was passed with `onStamp(c)`. But what is `c`? Well, the function says that `c` is actually just `u[0]` (the first recognised block). But we still have no idea of what this is -- is it another array? or an object? or just a string?

## The `sendSimulatedBlock()` function
To figure this out we must look at the `sendSimulatedBlock` function, which also calls `this.props.onStamp`:

```js
 {
    key: "_sendSimulatedBlock",
    value: function(e)
    {
        var t = {
            block:
            {
                number: 2222222,
                code: '2222222',
                position:
                {
                    x: e.touches.map((function(e)
                    {
                        return e.pageX
                    })).reduce((function(e, t)
                    {
                        return e + t
                    })) / e.touches.length,
                    y: e.touches.map((function(e)
                    {
                        return e.pageY
                    })).reduce((function(e, t)
                    {
                        return e + t
                    })) / e.touches.length
                },
                rotation: 0
            },
            touches: e.touches.map((function(e)
            {
                return {
                    x: e.pageX,
                    y: e.pageY
                }
            })),
            deviceCorrectionDisabled: !1
        };
        this._event = void 0, this.props.onStamp(t)
    }
 }
```

The last line of the function calls `this.props.onStamp` again, but this time with `t`. `t` is defined on the lines above; and from what we can see:

- `t` is an object which contains three main things: a block object, an array of touches, and a bool for whether device correction is disabled.
- `t.block` contains a few interesting things:
    - A `number`/`code`. After some reverse engineering of the local data stored on the emulator, it turns out this number and code correspond to the value spat out from the recognition process. Each establishment is given a "code" which matches the physical stamp layout, and this is used to validate if the stamp is valid for the current stamp card. 
    - A position which has `x` and `y` coordinates. In this case, the centroid (mean position) of the touches is calculated and set.
-  `t.touches` is just a map of each of the touches, but in `(x, y)` form. 
    
Furthermore, by looking in `unknown/.../config_tetra.json` (path hidden for anonymity) we can see how `(x, y)` positions on the screen are mapped to different numbers:

```js
//...
"apex2List": [
    { "x": 0.00, "y": 0.00, "name":"0" },
    { "x":-2.00, "y": 4.00, "name":"1" },
    { "x":-2.00, "y": 8.00, "name":"2" },
    { "x":-2.00, "y":12.00, "name":"3" },
    { "x":-2.00, "y":16.00, "name":"4" },
    { "x": 6.90, "y":-2.00, "name":"5" },
    { "x":11.20, "y":-2.00, "name":"6" },
    { "x":15.50, "y":-2.00, "name":"7" },
    { "x":-2.00, "y":20.00, "name":"8" },
    { "x":-2.00, "y":14.00, "name":"9" },
]
//...
```

These appear to be relative values to some kind of reference frame, as it would be impossible to `(-2.00, 4.00)` on a phone screen. Perhaps the library figures out the object-oriented bounding box (OOBB) of the stamp and then converts the touches to this reference frame. It would also make sense why `t.deviceCorrectionDisabled` exists. Very interesting.

So, we know what needs to be passed to `onStamp` for it to work: an object like `t`, the one we saw earlier. This function seems to be pivotal in determining whether a stampcard has been correctly stamped by one of the devices. So, lets look into it. 

## The `onStamp()` function

```js
{
    key: "onStamp",
    value: function(e, t)
    {
        var o = this;
        D.default.currentStampCardOrNot && this.setState(
        {
            holdCard: !0
        }, (function()
        {
            o._processStamp(e, t)
        }))
    }
},
```

The `onStamp` function is pretty straight forward; it eventually calls the `processStamp` function. The `processStamp` function is too large to paste here, but it basically does all the events associated with a successful stamp press:

- Gets the selected stamp card `r` as `r = U.selectedCard.get()`.
- Checks if `r` is not null, and has a `key` property.
- If it does, calls `D.default.incrementNumberOfStampsToday()`.
- Then determines if a voucher should be given or just another stamp.
- Plays success sound.

Through spooling through the code, there seems to be some checks for detecting if the correct code has been inputted. Essentially, the app loops through all outlets saved on the phone, and sees if the code matches the stampcard code of one of these outlets. Stampcards and outlets are fundamentally independent, so it would be great if we could look up the current outlet given the current stampcard. But for now, it just means that we have to find the correct stampcard code for the outlet we want. 

In this case, it's my local on-campus coffee shop. But where can we find this code? Well, we can look at what is saved on disk by the app!

## Digging deeper with `adb`
It turns out the codes we're looking for are in the localStorage database of the application; I figured this out as the local state of the root component is initialised from localStorage. But how can we access this? Well, we can simply use `adb shell` whilst the emulator is running. The `adb` process is a bridge between your host machine and your emulator or physical device. Here `adb shell` fires up a terminal session and lets you interact with the phone via command line. With `adb shell` fired up, you can type:

```sh
# Replace with whatever your app name is
run-as com.somepackage.app

# Navigate to the folder
cd data/data/com.somepackage.app

# Open up sqlite3 on localStorage
sqlite3 RKStorage
```

Once inside, you can see all the tables with `.schema`. In my case, there was only one: `catalystLocalStorage`. To get all the keys, its as easy as finding what keys are in local storage. Local storage is a key-value map, which is sometimes also called a dictionary. There are two columns: `key` and `value`. So, a query can be built to show just the keys:

```sql
SELECT `key` FROM `catalystLocalStorage`;
```

This returned a number of keys. Revealing them would give too much away about what app I broke. I did however, find one which was very interesting: `outlets-storage`. I simply wrote a SQL query to get the JSON object associated with this key:

```sql
SELECT * FROM `catalystLocalStorage` WHERE key="outlets-storage" LIMIT 1;
```

And then I had all the outlets, along with their stampcard codes in a giant JSON object. Some of these are shown visually below.

![JSON codes](json-codes.png)

With the JSON saved out to a file, it's just a matter of looking up the correct outlet and gathering what stampcodes are valid. A correct code could then be swapped out in the `t` object of `sendSimulatedBlock`; to fool the app into thinking we stamping a valid card for this outlet. Well, that's the theory anyways.  

# Patching the app
Lets summarise the changes we need to make before we start on the process of modifying the app itself. There are a few failsafes put in place inside the app to keep out prying eyes, which we can circumvent. To summarise:

- We need to firstly remove the "You've received too many stamps today!" warning by removing the call to `incrementNumberOfStampsToday()` on the stamp event.
- We need to patch out the debug-only condition, and call `sendSimulatedBlock()` to trick the app into thinking we are actually stamping the screen.

## Patching stamp count increment
We need to patch the part of the code which deals with incrementing the number of stamps given today, to circumvent the daily limit. We looked at achieving this earlier, and it turns out its quite easy. All we have to do is open `processStamp()` and comment out the line which invokes `incrementNumberOfStampsToday()`.

## Patching the condition
Patching the condition such that `sendSimulatedBlock` is called instead of `validate()` is also pretty easy. The developers left a debug-only condition in the minified code. If the `props.debug` flag is true, the device is an emulator (`props.isEmulator`), and the screen is touched with two fingers, `sendSimulatedBlock` is called. So all we have to, really, is to just change the compound condition to `true`. This means that the app will always call the debug method when two fingers touch the screen!

To illustrate this, here's the line of code for when the screen is touched:

```js
return this.props.debug&&this.props.isEmulator&&2==e.touches.length?(this._locked=!0,void this._sendSimulatedBlock(e)):void(e.touches.length>=5&&(this._locked=!0,this._validate(e)))
```

This can simply be patched to:

```js
return true&&2==e.touches.length?(this._locked=!0,void this._sendSimulatedBlock(e)):void(e.touches.length>=5&&(this._locked=!0,this._validate(e)))
```

Or, even neater:

```js
return 2==e.touches.length?(this._locked=!0,void this._sendSimulatedBlock(e)):void(e.touches.length>=5&&(this._locked=!0,this._validate(e)))
```

Now the code will always run the `sendSimulatedBlock` function rather than the `validate` function! After we build the APK, you'll notice that no matter where you press the screen with two fingers, it will add a stamp to the current stampcard. However, how do we build the APK to test if it works?


# Putting it all together
The last thing to do is to put everything together, now that we have modified the code. To do this, there are a few things we need to do:

- We need to set the APK to debuggable by changing `AndroidManifest.xml`, prior to rebuilding.
- We need to build the APK via the `apktool`, to create an APK which can be installed via `adb`.
- The APK needs to be signed with a key and finally zip-aligned.

Let's look at each step one-by-one. 

## Setting the APK to debuggable
One thing we need to do, especially if we are poking around the local database of an app, is to set it as debuggable. This doesn't change much about the app, but it will allow us to us `run-as` when we `adh sh` into it. It also means we'll be able to build our app to a device and test it out.

To do this, all you need to do is open up `AndroidManifest.xml` in the decompiled source. Then, add or modify the `<application ...>` node to include the attribute `android:debuggable="true"`:

```xml
<application android:debuggable="true" ...>
    ...
</application>
```

More information about this tag can be found [here](https://developer.android.com/privacy-and-security/risks/android-debuggable).

## Creating a key 
Next up, we need to create a key (unless one is already made). To do this, we have to use the `keytool` application which comes with a standard JDK / JRE distribution. If you have Java installed you should find it under `%JAVA_HOME%/bin`. If you don't, you need to install the JDK. You probably should also install Android Studio for the following steps, which comes with a JDK for you!

Android Studio also comes with some device emulators which you'll be able to use to install and test out your built app. If you haven't already, download it from [here](https://developer.android.com/studio).

Once you have Android Studio and a distribution of Java installed, it's pretty easy to make a key. Just use the `keytool` application to generate a key:

```sh
keytool -genkey -v -keystore patchedKey.keystore -alias patchedKey -keyalg RSA -keysize 2048 -validity 10000
```

Here the "patchedKey" alias is used to refer to the key. Later, when we sign the APK with this key, we can use this alias. If you already have a generated key, you don't need to generate a key with `-genkey`; just use the alias in the APK signing process later on.

## Building the APK & zip-aligning it
With all that done, we can finally build the APK! We do this with the `apktool` that we used earlier. Earlier, we decompiled an APK with the `d` flag for decompiling. Building uses, you guessed it, the `b` flag. To build out an APK, you simply need to call `apktool` from the folder where you decompiled your APK. The `apktool` utility will try to bundle all of the sources into an APK and produce it for you. For example, if you wanted to build to a file called `patchedApk.apk`, you could use:

```sh
apktool -b -o patchedApk.apk
```

Once you have a built APK, you then need to zip-align it. The `zipalign` utility that comes with the Android SDK and is used for this purpose. Zip-aligning basically ensures that files within the APK are aligned relative to the start of the APK file. This helps with memory management -- everything is loaded in contiguously. This is a very similar idea to struct packing in shaders.

To zip-align something, you simply give the input and output file names, along with the alignment size. For example, a alignment value of 4 will provide 32-bit alignment. If you're unsure, just use 4. 🙂

If you are also having issues finding `zipalign`, it is in the `build-tools` folder of your Android SDK installation. For me, that is `C:\Users\<name>\Appdata\Local\Android\Sdk\build-tools\<version>`. Once located, simply run it on the APK with:

```sh
zipalign.exe -v 4 patchedApk.apk patchedAlignedApk.apk
```

This should produce another file called `patchedAlignedApk.apk`, which has been zip-aligned. The `-v` flag just spits out verbose output. 

## Signing the APK
Finally, we need to sign the zip-aligned APK with the key we made earlier. We can do this with the `apksigner` utility, which is also in your `build-tools` folder (the same as zipalign). The `apksigner` utility takes:

- The alias of the key to sign the APK with
- A path to the key's location (just alias + .keystore)
- And finally, the APK to sign. The changes will be applied to the APK

With that in mind, all you have to do is call it like so:

```sh
apksigner sign --ks-key-alias patchedKey --ks patchedKey.keystore patchedAlignedApk.apk
```

And finally, after all that work, we have a built, zip-aligned and signed APK that we can install to a device! I would highly recommend building your own command-line utility script to automate this process if you are going to do this a lot. Doing it by hand can be very tedious. This is especially true if you are making small changes to the APK via test-driven development. 

# Installing and testing it out
Finally, with the APK built and signed, we can install it to a device. You have two options here, you can either a) use an emulator or b) install it to a physical device. To install it to a physical device you will need to enable USB debugging and developer mode. A guide on how to do this can be found [here](https://developer.android.com/studio/debug/dev-options).

To install your APK, regardless of your device, you can run `adb install patchedAlignedApk.apk`. This will install it on the first device it finds. You can also drag-and-drop the APK onto an emulator to do the same thing. If you want to fire up an emulator via the command-line, navigate to the `emulator` folder of your Android SDK. For me this is `C:\Users\<name>\AppData\Local\Android\SDK\emulator`. Then, run `emulator.exe` with the flag `-list-avds` to see what virtual devices are available:

```sh
emulator.exe -list-avds
```

This should return a list of AVDs you can run. To run one, just run `emulator.exe` again with the `-avd` flag to specify which AVD to run:

```sh
emulator.exe -avd Pixel_3a_API_33_x86_64
```

With either your emulator or physical device connected via USB, install the APK with `adb install <apkPathHere>`. Then, check on your device and try it out! You should have something working.

## Testing it out
To test it out, you simply need to run the app on your device or emulator. For me, it ended up working! Here's a little video of the patched app running. The two circles shown is when you hold `Ctrl` in the emulator: it will simulate two fingers pressing on the screen. Here I'm just spamming `Ctrl + Click` to give myself stamps for a free drink!

(I've blurred out details of the app)

![Result](img/patching-apks/result.gif)

As you can see, it ended up working! I got a free coffee with this method but ended up feeling too guilty about getting more. After figuring out how it works I was happy! 🙂

Stay tuned for future posts on breaking apps for fun!

# Enumerating all visible desktop windows by z-order
Do you want to traverse all visible desktop windows, but with respect to z-order? Well, you might be able to do this via `EnumDesktopWindows`, but it is unclear if these are enumerated in a specified z-order. Plus, if you don't want to use a callback, maybe this approach isn't for you. Instead, the Windows API has some functions built into it to iterate over desktop windows with respect to z-order. However, there's not many examples of how to do this online, which has inspired the creation of this post! 🎉 

## Getting the top-most window
Getting the top-most window is really easy. First, you can just do something like:

```cpp
//Window handle of the desktop
HWND desktopWindow = GetDesktopWindow();

//Get the top-most window in the desktop
HWND topMostWindow = GetTopWindow(desktopWindow);
```

Following this, we can make subsequent calls to enumerate desktop windows in a particular way.

## Finding the window with the lowest z-index
Using the top-most window as a reference point, you can easily find the window which is the lowest z-order by using `GetWindow(hwnd, GW_HWNDLAST)`. The `GW_HWNDLAST` parameter indicates that we want the window whose z-index is the lowest. Similarly, we could specify `GW_HWNDFIRST` to get the window whose z-index is the highest. So for example, you could use:

```cpp
//Get the window with the lowest z-index, with regards to the top-most window
HWND window = GetWindow(topMostWindow, GW_HWNDLAST);
```

Or alternatively:

```cpp
//Get the window with the higher z-index, with regards to the top-most window
HWND window = GetWindow(topMostWindow, GW_HWNDFIRST);
```

Or hey, why not both?

```cpp
//Window handle of the desktop
HWND desktopWindow = GetDesktopWindow();

//Get the top-most window in the desktop
HWND topMostWindow = GetTopWindow(desktopWindow);

//Get highest and lowest
HWND lowestWindow = GetWindow(topMostWindow, GW_HWNDLAST);
HWND highestWindow = GetWindow(topMostWindow, GW_HWNDFIRST);
```

If you get confused about the relative order of `GW_HWNDLAST` and `GW_HWNDFIRST`, try to imagine desktop windows in a stack like structure. Imagine a stack of pancakes on your desktop in front of you, and you're looking down. Windows which are "further down" have a *lower* z-index, whereas those with a *higher* z-index are closer to the top. 

![pancakes](https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXJnbDJtZnpnNjdvOTBldzgxeDdpN28zOTIzbDlpa2x3dm5rZTg0eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o85xrQOrtDruRndYI/giphy.webp)

*(Above) In this stack of pancakes, the knob of butter has a high z-index. The pancakes below have a lower z-index. Yes, this is how desktop windows work, I promise.*

## Using `GetWindow` for iteration
`GetWindow` is really useful because it allows you to go to the next/previous window in the z-order by specifying either `GW_HWNDNEXT` (for the next window with a lower z-index) or `GW_HWNDLAST` (for the next window with a higher z-index). Iteration is achieved by saving the result of `GetWindow(...)` into a variable, and then using that result to get the next window relative to the result. Here's an illustration of what I mean:

```cpp
//Get the top-most window
HWND window = GetTopWindow(GetDesktopWindow());

//Find the window below this one, iteratively
window = GetWindow(window, GW_HWNDNEXT); // Maybe this is the window with z-index 5
window = GetWindow(window, GW_HWNDNEXT); // z-index 4
window = GetWindow(window, GW_HWNDNEXT); // z-index 3
window = GetWindow(window, GW_HWNDNEXT); // z-index 2

//etc..
```

Hopefully now you can see how easy this would be to put into a loop, and just check whilst `window` is not null, e.g. `while(window = GetWindow(window, GW_HWNDNEXT)) { }`! 🙂

## Iterating over windows from highest to lowest z-order
Putting together everything we've covered, this is super easy to do in C++:

```cpp
//Find the top-most window.
HWND window = GetTopWindow(GetDesktopWindow());

//Run from the highest z-order to the lowest by using GW_HWNDNEXT. We're using a do-while
//here because we don't want to skip the top-most window in this loop.
//..

do
{
  //Your code here..
}
while (window = GetWindow(window, GW_HWNDNEXT));
```
For example, if you wanted to print out the titles of all *visible* windows, here's some code to do that:

```cpp
do
{
  //Not visible? skip
  if(!IsWindowVisible(window))
    continue;
  
  //Get the title of the window
  char titleString[64];
  GetWindowTextA(window, titleString, 64);

  //Print it out
  printf("%s\r\n", titleString, 64);
}
while (window = GetWindow(window, GW_HWNDNEXT));
```

## Iterating over windows from lowest z-order to highest
This is a bit trickier, but still very much achievable. The only difference we really have to make is to replace `GW_HWNDFIRST` with `GW_HWNDLAST`, so that we start from the lowest z-index in the loop. In the pancake analogy, we'd be working from the bottom upwards, rather than top-down. We also need to use `GW_HWNDPREV` instead of `GW_HWNDNEXT`.

`GW_HWNDPREV` is like `GW_HWNDNEXT`, but instead of going to a lower z-value (top -> bottom-most), it goes to higher z-values (bottom -> top-most). It's basically just used to iterate over the windows in a reverse order. So, by modifying our code a bit, we can use something like:

```cpp
//Find the top-most window. We need the Z-order to be
//relative to this
HWND window = GetTopWindow(GetDesktopWindow());

//Then, find the window with the lowest Z-order value (GW_HWNDLAST not GW_HWNDFIRST)
window = GetWindow(window, GW_HWNDLAST);

do
{
  //Your code here
} 
while (window = GetWindow(window, GW_HWNDPREV));
```

## The gist 
I ended up writing this as a GitHub gist out of frustration because of the lack of documentation on `GetWindow(...)`. Most of time it seems the Windows API is a little scuffed; hopefully this helps you out. You can view the gist [here](https://gist.github.com/blewert/b6e7b11c565cf82e7d700c609f22d023), along with some more in-depth code examples.

I hope it helps and best of luck!

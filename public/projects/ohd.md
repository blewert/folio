
# About
Something that is much needed in academia are interesting projects which potential applicants can engage with. As an institution we typically host offer holder days -- similar to open days, but specifically for those who have offers to study at the institution. Usually the day involves the applicants engaging with some activities to get a better idea of what studying at the university will be like.

It is therefore important to give a good impression. Good impressions result in successful conversions, and a boost in recruitment numbers. Therefore the experience should be:

- Fun to engage with
- Interesting 
- And most importantly, rememerable: the activity should set us apart from other universities.

When I joined Staffs, I realised that we could greatly improve our image to applicants by offering a sleek, rememberable experience which sets us apart from other universities. 

## The plan
With this in mind, we discussed ideas and settled on a programming exercise for students. This exercise should be easily accessible, easy to use, and enable applicants to continue their progress at home. With this in mind, I ended up creating our current offer holder day activity. You can give it a go [here](https://staffsunigames.github.io/ohd-editor/#/); it works best on desktop, so get out your laptop if you're on mobile!

## Architecture
The final result was built with Webpack, React, `antd`, and a variety of other libraries. React was chosen as the bulk of the work is frontend development, with no backend -- the activity is hosted on Github Pages. However, building an isolated version with a backend & API is on the cards, so stay tuned! 👀

The activity utilises the Ace text editor to enable in-browser syntax highlighting and source code editing. The result is an online IDE which the applicants can use to build a 2D game in Phaser.js. They are given little-to-no code at the start, and throughout the tasks, are given snippets of code they can plug in to build the game up. Overall, it takes about 15-30 minutes to complete, and there are plenty of additional tasks for those more versed in code.

The code is interpreted on-the-fly by injecting it into an `iframe`, as it is plain old JavaScript. I also hook `console.log` in the `iframe` so that any syntax errors can be detected and displayed to the user. Furthermore, I also built a code history tool using `window.localStorage` so applicants can revert to previous versions, or reload code if it was accidentally closed down.

Here are two things I'm really proud of with this activity:

- Where code snippets should be inserted is nicely highlighted by utilising anchors with Ace; these are stored per-task in a JSON config file.
- When the student finishes building their game, they can download a .zip file they can take home on their USB stick to show their family and friends. What is awesome about this is that the zip is build in the browser, 100% client side!

## Summary of features
I was the sole developer for this project. The project has the following features:
- Integrated web-based IDE for code editing 
- Real-time compilation of JS and hot-updating for game view
- Custom shortcuts for demonstrators (Ctrl+Alt+Shift+?) 
- Ability to fullscreen/minimise rendered view
- Code version history via `localStorage`
- Phaser.js integration & building of 2D platformer game (and various subsystems, including physics)
- Onboarding pages & playthrough of full-game prior to experience
- Custom task view rendered as markdown pages, using `react-markdown`, including syntax highlighting with Prism
- Tasks can be ticked off as the applicant follows along
- Client-side zip file building when the experience is finished, so the applicant can download their game and show it off to their friends or family.
- Highlighting of anchored insertion regions for code snippets in task view
- Super sleek UI throughout with custom templates & sass for `antd` & React

# Links
- [Play the activity](https://staffsunigames.github.io/ohd-editor/#/) (best on desktop)
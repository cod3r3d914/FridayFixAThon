# Friday Fix-A-Thon Intro Page

A simple animated intro screen for the NextGen Healthcare support team's Friday Fix-A-Thon.

## Add The MP3

The page is already wired to play this file:

```text
assets/friday-fixathon-intro.mp3
```

Create or upload the MP3 with exactly that filename in the `assets` folder, then open `index.html` and click `Start intro`.

Browsers usually block autoplay with sound, so the click is intentional. It starts both the animation and the audio.

## Use A Hosted MP3 Instead

If your MP3 is uploaded somewhere else, it needs to be a direct public HTTPS link to the actual `.mp3` file, not a private sharing page.

Then change this line in `index.html`:

```html
<audio data-intro-audio src="assets/friday-fixathon-intro.mp3" preload="auto"></audio>
```

To something like:

```html
<audio data-intro-audio src="https://example.com/friday-fixathon-intro.mp3" preload="auto"></audio>
```

## GitHub

This folder is ready to become its own GitHub repository. The saved GitHub CLI login on this machine needs to be refreshed before I can push it.

Run this in PowerShell when you are ready:

```powershell
gh auth login -h github.com
```
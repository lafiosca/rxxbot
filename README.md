### rxxbot

Documentation does not exist currently. Hopefully in the future.

## Getting started (macOS)

* Install Homebrew
* `brew install nvm` (and follow directions)
* `nvm install v8.11`
* `brew install yarn`
* `git clone https://github.com/lafiosca/rxxbot.git`
* `cd rxxbot`
* `npx lerna bootstrap`
* `lerna run build --scope rxxbot-types --scope rxxbot-server`
* Establish config/assets
* `npx lerna run start --stream`

## Chrome autoplay

For videos to automatically play with sound in Chrome, follow these directions and add `localhost` to your allowed host list: https://int.pixilab.se/docs/blocks/autoplay

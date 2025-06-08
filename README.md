# Chess Game

This repository contains a web-based chess game implemented with **JavaScript**, **HTML** and **CSS**. A small Node.js server using [Socket.IO](https://socket.io/) powers the real-time multiplayer mode. You can try the project online or run it locally for development.

## Live Demo

<https://mshvarts.github.io/Chess/>

## Features

- Classic chess rules with special moves such as castling, promotion and en passant
- Local two player mode as well as basic online matchmaking
- Simple login and invite system
- Screens for singleplayer, multiplayer and game lobby

## Getting Started

To play around with the project locally you will need Node.js installed. Install the dependencies and start the Socket.IO server:

```bash
npm install
node server.js
```

The HTML files can then be served with any static file server. Opening `index.html` will launch the board and pieces. Multiplayer mode expects the Socket.IO server to run on port **3001**.

## Screenshot

![Board screenshot](demo.png)

![Another board screenshot](demo2.PNG)

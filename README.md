Lego Mini Game Case Study

This project is a case study of a Lego-inspired building mini game. The core idea is to allow players to construct structures by placing blocks on a grid, similar to how one would build with physical Lego bricks.

Gameplay Overview:

- Players are presented with a grid-based board representing the current level.
- A palette of colored blocks is available, each with different shapes, sizes, and orientations.
- Players can pick up blocks from the stash and place them onto the board, following certain placement rules (e.g., blocks must fit within the grid and cannot overlap existing blocks).
- Blocks may require support from below, mimicking the physical constraints of real Lego building. (Not implemented)
- The goal is to complete the level by filling the board according to specific objectives or patterns.

Key Features:

- Interactive click-to-place interface for block placement.
- Visual feedback for valid and invalid placements (e.g., highlighting in green or red).
- Refreshable block stash to provide new building options.
- Level progression, with each level presenting a new board layout and challenge.
- Reference view to show the target structure for the current level.

How to run:

1. **Install dependencies**

   Make sure you have [Node.js](https://nodejs.org/) (version 22 or higher recommended) and [npm](https://www.npmjs.com/) installed on your system.

   ```
   npm install
   ```

2. **Start the development server**

   Run the following command to start the app in development mode:

   ```
   npm run dev or yarn dev
   ```

   This will launch the app and provide a local URL (usually `http://localhost:5173/` or similar) in your terminal. Open this URL in your web browser to play the game.

3. **Build for production**

   To create an optimized production build, run:

   ```
   npm run build or yarn build
   ```

   The output will be in the `dist/` directory.

4. **Preview the production build**

   You can preview the production build locally with:

   ```
   npm run preview or yarn preview
   ```

   This will serve the built files so you can test the production version.

5. **Troubleshooting**

   - If you encounter issues, ensure your Node.js and npm versions are up to date.
   - Delete the `node_modules` folder and `package-lock.json` file, then run `npm install` again if dependencies are not resolving.
   - For further help, check the project's issues or documentation.

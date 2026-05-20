# PhysicsDraw

Free online physics diagram tools for teachers.

**[physicsdraw.com](https://www.physicsdraw.com)**

---

## Tools

### Free Body Diagram
Draw all forces acting on an object. Add labeled force vectors with one click and drag to adjust direction and magnitude.

### Motion Map
Visualize an object's position at equal time intervals. Show velocity vectors and acceleration to explore kinematics.

### Apparatus Diagram
Build physics scenario diagrams from a library of objects — boxes, springs, pulleys, inclines, and more.

---

## Tech Stack

- [Vue 3](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)

---

## Getting Started

```bash
npm install
npm run dev
```

---

## Contributing

Contributions are welcome — bug fixes, new features, new diagram tools, UI improvements, and everything in between.

1. Fork the repo
2. Create a branch using the conventions below
3. Make your changes with appropriately formatted commits
4. Push to your branch and open a pull request

Please keep pull requests focused and scoped to a single change. For larger features, open an issue first to discuss the approach.

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| New feature | `feat/` | `feat/apparatus-drag-snap` |
| Bug fix | `fix/` | `fix/fbd-vector-label` |
| Refactor | `refactor/` | `refactor/motion-map-store` |
| Chore | `chore/` | `chore/update-dependencies` |

### Commit Messages

Use the same prefixes for commit messages:

```
feat: add snap-to-grid for apparatus tool
fix: correct vector angle calculation in FBD
refactor: extract force renderer into composable
chore: upgrade Vite to v6
```

---

## License

This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).

You are free to use, study, and modify this code. Any derivative work must also be distributed under GPL-3.0 and remain open source. Commercial use is not permitted.

---

## About

PhysicsDraw is built by me, [Trevor Register](https://www.trevorregister.com). I'm a former physics teacher turned fullstack developer.

If you find it useful, consider [buying me a coffee](https://buymeacoffee.com/trevorregister).
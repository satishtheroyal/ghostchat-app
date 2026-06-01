# Contributing to GhostChat

Thanks for your interest in contributing! 🙏

## Code of Conduct

Be respectful, inclusive, and constructive.

## How to Contribute

### 1. Report Bugs
Open an issue with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment info

### 2. Suggest Features
Discuss in Issues before implementing.

### 3. Submit Code

1. Fork the repo
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes
4. Write tests (if applicable)
5. `git commit -m "Add feature"`
6. Push: `git push origin feature/your-feature`
7. Open Pull Request

## Development Setup

```bash
npm install --workspaces
npm -w packages/backend run dev
npm -w packages/frontend run dev
```

## Coding Standards

- Use ES6+ features
- Follow existing code style
- Comment complex logic
- No console.log in production code

## Security

For security issues, email security@ghostchat.app instead of opening public issues.

## License

By contributing, you agree your code is licensed under MIT.

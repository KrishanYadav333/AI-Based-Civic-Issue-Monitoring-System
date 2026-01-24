# Contributing to AI-Based Civic Issue Monitoring System

Thank you for your interest in contributing to this project! This document provides guidelines for contributing.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, versions)

### Suggesting Features

1. Check if the feature has been suggested
2. Create an issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Guidelines

### Code Style

**JavaScript/Node.js:**
- Use ES6+ features
- 2 spaces for indentation
- Semicolons required
- Use meaningful variable names
- Add comments for complex logic

**Python:**
- Follow PEP 8 style guide
- Use type hints where applicable
- Add docstrings for functions
- 4 spaces for indentation

**React:**
- Use functional components with hooks
- Keep components small and focused
- Use PropTypes or TypeScript
- Follow React best practices

### Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage
- Test edge cases

### Commit Messages

Format: `type(scope): subject`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(backend): add issue filtering by date range
fix(mobile): resolve camera permission issue
docs(readme): update installation instructions
```

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

## Project Structure

```
├── backend/         # Node.js/Express API
├── frontend/        # React web dashboard
├── mobile-app/      # React Native mobile app
├── ai-service/      # Python AI service
├── database/        # Database schemas
└── plans/          # Architecture docs
```

## Setting Up Development Environment

1. Clone your fork
2. Run setup script: `./setup.sh` or `setup.bat`
3. Configure environment variables
4. Start services locally
5. Make your changes
6. Test thoroughly

## Code Review Process

1. Maintainers review all PRs
2. Address review comments
3. Ensure CI/CD passes
4. Get approval from at least one maintainer
5. Squash and merge

## Questions?

- Open an issue for questions
- Tag with `question` label
- Be respectful and patient

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

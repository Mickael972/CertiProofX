# Contributing to CertiProof X

We love your input! We want to make contributing to CertiProof X as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Setting Up Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/0xGenesis/certiproof-x.git
   cd certiproof-x
   ```

2. **Run setup script**
   ```bash
   ./scripts/setup-dev.sh
   ```

3. **Configure environment variables**
   - Edit `contracts/.env` with your API keys
   - Edit `backend/.env` with your IPFS credentials
   - Edit `frontend/.env` after contract deployment

4. **Start development**
   ```bash
   ./scripts/dev.sh
   ```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes and commit**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```

3. **Run tests**
   ```bash
   ./scripts/test-all.sh
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Create a Pull Request**

## Coding Standards

### Smart Contracts
- Use Solidity ^0.8.19
- Follow OpenZeppelin standards
- Include comprehensive tests
- Document all public functions
- Use NatSpec comments

### Backend
- Use Node.js with Express
- Follow RESTful API design
- Include unit and integration tests
- Use proper error handling
- Follow security best practices

### Frontend
- Use React with hooks
- Follow component-based architecture
- Include unit tests for components
- Use TypeScript where applicable
- Follow accessibility guidelines

## Code Style

### JavaScript/TypeScript
- Use ESLint and Prettier
- 2 spaces for indentation
- Semicolons required
- Single quotes for strings
- Trailing commas where applicable

### Solidity
- Use Solhint for linting
- 4 spaces for indentation
- Use descriptive variable names
- Include NatSpec documentation

## Testing

### Smart Contracts
```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

### Backend
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend
```bash
cd frontend
npm test
npm test -- --coverage
```

### Integration Tests
```bash
./scripts/test-all.sh integration
```

## Documentation

- Update README.md if needed
- Update API documentation
- Include inline comments
- Update technical documentation

## Security

### Reporting Security Issues

Please do not report security vulnerabilities through public GitHub issues. Instead, send an email to certiproofx@protonmail.me.

### Security Best Practices

- Never commit private keys
- Use environment variables for secrets
- Follow smart contract security patterns
- Validate all user inputs
- Use HTTPS in production

## Issues

We use GitHub issues to track bugs and feature requests. Please provide:

### Bug Reports
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

### Feature Requests
- Clear description of the feature
- Use case and motivation
- Proposed implementation approach
- Any relevant examples

## Community

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the code of conduct

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to reach out:
- Email: certiproofx@protonmail.me
- GitHub Issues: [Create an issue](https://github.com/0xGenesis/certiproof-x/issues)
- Discord: [Join our server](https://discord.gg/certiproof-x)

Thank you for contributing to CertiProof X! 🚀
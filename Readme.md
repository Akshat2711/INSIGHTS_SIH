# Insights Growth Tracker

A comprehensive platform for tracking professional growth and achievements through LinkedIn data analysis.

## 🚀 Quick Start

### Prerequisites

Before getting started, ensure you have the following installed:
- **Python 3.8+**
- **Node.js 16+**
- **npm** or **yarn**

### Installation

#### 1. Backend Setup
```bash
# Navigate to project root
cd insights_growth_tracker

# Install Python dependencies
pip install -r requirements.txt
```

#### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install
```

## ⚙️ Configuration

### Environment Variables

Create `.env` files in the following locations:

```
insights_growth_tracker/
├── .env                    # Backend environment variables
├── frontend/
    └── .env               # Frontend environment variables
```

**📋 Reference Files:**
- Use `.env_sample` files in respective directories as templates
- Contact the repository creator for actual environment values

### Firebase Setup

1. Create `backend_firestore_cred.json` in the project root:
   ```
   insights_growth_tracker/
   └── backend_firestore_cred.json
   ```

2. Use `backend_firestore_cred_sample.json` as a reference template

3. **Important:** Contact the repository creator for actual credential values

## 🏃‍♂️ Running the Application

### Start Backend Server
```bash
cd insights_growth_tracker
python main.py
```

### Start Frontend Development Server
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:5173`

## 🤝 Contributing

### Branching Strategy

**⚠️ Important Rules:**
- **Never push directly to `main` or `master` branch**
- Always create a feature branch with your name

#### Creating a Feature Branch
```bash
# Create and switch to your feature branch
git checkout -b your_name_dev

# Example:
git checkout -b akshat_dev
```

### Pull Request Guidelines

When submitting a Pull Request, include:

✅ **Clear description** of changes made  
✅ **Detailed explanation** of new features or bug fixes  
✅ **Screenshots** (if UI changes are involved)  
✅ **Testing notes** (if applicable)

#### PR Template
```markdown
## Description
Brief description of what this PR accomplishes

## Changes Made
- List of specific changes
- New features added
- Bugs fixed

## Screenshots (if applicable)
Add screenshots for UI changes

## Testing
How to test the changes
```

## 📁 Project Structure

```
insights_growth_tracker/
├── backend/                 # Backend Flask application
├── frontend/               # Frontend React application
├── requirements.txt        # Python dependencies
├── .env_sample            # Backend environment template
├── backend_firestore_cred_sample.json  # Firebase credentials template
└── README.md              # This file
```

## 🆘 Need Help?

- **Environment Setup Issues:** Check `.env_sample` files for reference
- **Credential Problems:** Contact the repository creator
- **General Questions:** Open an issue or reach out to the maintainers

---

## 🎉 HAPPY CODING!

Ready to contribute? Follow the setup guide above and start building amazing features! 

**Remember:** Always work on your own branch and create meaningful pull requests.
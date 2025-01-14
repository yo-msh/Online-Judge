# Online Judge Platform

A modern online judge system that supports multiple programming languages and provides secure code execution for programming challenges.

## Features

- 💻 Multi-language support (Python, C++, Java, JavaScript)
- ⚡ Real-time code execution and testing
- 🔒 Secure sandboxed code evaluation using Docker
- 👥 User authentication and submission tracking
- 📊 Problem management with test cases
- 🎯 Difficulty-based problem categorization
- 📈 Submission history and statistics

## Project Structure

```bash
.
├── backend/              # Server implementation
│   ├── config/          # App configuration & environment
│   ├── controllers/     # API logic & handlers
│   ├── models/          # Database models
│   ├── routes/          # API route definitions
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Helper functions
│   └── docker/          # Code execution containers
├── frontend/            # React.js client
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/      # Route pages
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Frontend utilities
│   └── public/         # Static assets
├── .env                # Environment variables
├── .gitignore         # Git ignore rules
└── docker-compose.yml  # Docker services config
```

## Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/online-judge.git
   cd online-judge
   ```
2. **Backend Setup**
    ```bash
   cd backend
   npm install
   ```

3. **Configure Environment**
    ```bash
   copy .env.example .env
   ```

4. **Database Setup**
    ```bash
    net start postgresql

    #create database
    createdb -U postgres onilne_judge
    ```
5. **Docker Setup**
    ```bash
    #build docker image accordingly

    # Build code execution containers
    docker build -t sandbox-python ./docker/python
    docker build -t sandbox-cpp ./docker/cpp
    docker build -t sandbox-java ./docker/java
    docker build -t sandbox-js ./docker/javascript
    
    # Verify images
    docker images
    ```
6. **Start Services**
    ```bash
    # Start backend server
    cd backend
    npm run dev

    # Open new terminal, start frontend
    cd frontend
    npm run dev
    ```
7. **Verify Setup**
    - Backend running on: http://localhost:5000
    - Client running on: http://localhost:4321
    - Test submission system is working

## Usage

1. **User Registration**
   - Navigate to http://localhost:5000/register
   - Create an account with email and password

2. **Solving Problems**
   - Browse problems list
   - Select problem by difficulty
   - Choose programming language
   - Write solution in code editor
   - Submit code for evaluation

3. **View Results**
   - Check submission status
   - View test case results
   - See execution time and memory usage
   - Review submission history

4. **Problem Management** (Admin)
   - Create new problems
   - Add test cases
   - Set difficulty levels
   - Manage submissions

## Tech Stack

- **Backend**
  - Express.js
  - PostgreSQL
  - Docker for code execution
  - JWT authentication

- **Frontend** 
  - React.js
  - TailwindCSS
  - Monaco Editor
  - Axios
 
** Images
![image](https://github.com/user-attachments/assets/7355756c-1cb6-41ef-b3ab-124c7f3ff5f9)
![image](https://github.com/user-attachments/assets/dcfc1d80-923b-42c0-a488-41c79097315c)
![image](https://github.com/user-attachments/assets/ba12c098-2667-419f-9399-9e374e58bb51)



## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

# PlanEats Application

## Project Description

PlanEats is a web application for comprehensive pantry management and recipe recommendation. The system aims to help users manage their food inventory, reduce waste, and discover recipes based on available ingredients and personal preferences, incorporating AI for personalized recipe generation.

This project is being developed as part of the Projeto II - Programação Web 23-25 module at ETIC Algarve.

## Project Structure

-   **/frontend**: Contains the Next.js frontend application.
-   **/backend**: Contains the FastAPI backend application.
-   `.env.example`: Provides a template for environment variables. Copy this to `.env` and fill in your actual secrets.
-   `MVP_Scope_Document.md`: Defines the scope for the Minimum Viable Product.
-   `.gitignore`: Specifies intentionally untracked files that Git should ignore.

## Setup and Running the Project (Docker)

1.  **Clone the repository** (if you haven't already):
    ```bash
    # git clone <repository-url>
    # cd planeats_app
    ```

2.  **Create your local environment file**:
    Copy `.env.example` to `.env` and update the variables with your actual credentials and keys:
    ```bash
    cp .env.example .env
    ```
    *(Remember to set strong passwords and actual API keys in your `.env` file. This file is ignored by Git.)*

3.  **Build and run the application using Docker Compose**:
    ```bash
    docker-compose up --build -d
    ```
    The `-d` flag runs the containers in detached mode.

4.  **Accessing the services**:
    -   Frontend: [http://localhost:3000](http://localhost:3000)
    -   Backend API: [http://localhost:8000](http://localhost:8000)
    -   Backend API Docs (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)
    -   PostgreSQL database will be running on port 5432 (accessible from other containers as `db:5432` or from host as `localhost:5432`).

5.  **Stopping the application**:
    ```bash
    docker-compose down
    ```

## Development

-   **Frontend**: Navigate to the `frontend/` directory to work on the Next.js application.
-   **Backend**: Navigate to the `backend/` directory to work on the FastAPI application.
-   Ensure you have pre-commit hooks installed for code quality:
    ```bash
    pip install pre-commit
    pre-commit install
    ```

## Team (Grupo 1)
-   João Cardoso (Owner, Ponto Focal Dados e Infraestrutura Inicial)
-   Santiago (Ponto Focal Backend e Lógica de Negócio)
-   Jessiellen (Ponto Focal Frontend e Experiência do Utilizador)
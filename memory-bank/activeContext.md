# Active Context

*This document details the current work focus, recent changes, next steps, active decisions, important patterns, learnings, and project insights. It is a synthesis of all information currently in the Memory Bank.*

## 1. Current Work Focus & Project Phase

-   **Project Phase**: Fase 1: Definição do Âmbito e Planeamento (Aproximadamente as primeiras 3 sessões).
-   **Current Focus**:
    -   Consolidating all initial project documentation into the Memory Bank (largely completed).
    -   Finalizing the "Documento de Âmbito do Projeto" which includes comparing pitch functionalities vs. MVP scope.
    -   Defining clear roles and initial tasks for team members (João Cardoso, Santiago, Jessiellen).
    -   Setting up the foundational technical infrastructure: Git repository, Docker environment, and pre-commit hooks.
    -   Initial UI/UX design in Figma.
    -   Structuring the initial project presentation.
-   **Reference**: `projectbrief.md` (Sections 10, 11, 14), `progress.md`.

## 2. Recent Changes & Accomplishments

-   **Documentation Consolidation**: All provided `.docx` and `.txt` files detailing project brief, system architecture, tech stack, API, database structure, authentication flow, containerization strategy, pre-commit setup, and team roles have been processed and integrated into the `memory-bank`.
    -   `memory-bank/projectbrief.md` created/updated.
    -   `memory-bank/productContext.md` created/updated.
    -   `memory-bank/systemPatterns.md` created/updated.
    -   `memory-bank/techContext.md` created/updated.
    -   `memory-bank/apiDocumentation.md` created/updated.
-   **Initial Progress Tracking**: `memory-bank/progress.md` has been initialized to track tasks.
-   **Team Roles Defined**: Points of Focal Area and collaboration model established (João: Data/Infra, Santiago: Backend/API, Jessiellen: Frontend/UX).
-   **Reference**: `progress.md`, `projectbrief.md` (Section 14).

## 3. Next Steps (Immediate & Phase 1)

-   **Finalize MVP Scope Document**: Critically important to compare the original PlanEats pitch with what will be feasible for the MVP. This includes identifying 'core' functionalities and documenting future enhancements. (Deliverable for Fase 1)
-   **Technical Setup**:
    -   Initialize and configure the Git repository on GitHub with appropriate branching strategy and Git Tags for versions. (João Cardoso leading)
    -   Implement the Dockerfiles for frontend, backend, and the `docker-compose.yml` file as per `techContext.md` and `Estratégia de Containerização.docx`. (João, Santiago, Jessiellen collaborating on their respective services)
    -   Set up and test the pre-commit hooks across the development environment.
-   **Design**:
    -   Complete the initial UI design in Figma. (Jessiellen leading) (Deliverable for Fase 1)
-   **Planning & Documentation**:
    -   Develop a detailed "Plano Técnico". (Deliverable for Fase 1)
    -   Create the "Estrutura Inicial da Apresentação". (Deliverable for Fase 1)
    -   Begin drafting the "Documento de Modelo de Dados, Contentorização e Arquitetura" (consolidating existing info and adding diagrams).
-   **Development Kick-off (leading into Fase 2)**:
    -   Implement base database models (SQLModel) and migrations (Alembic). (João Cardoso leading)
    -   Set up basic Next.js frontend structure. (Jessiellen leading)
    -   Set up basic FastAPI backend structure with initial authentication endpoints. (Santiago leading)
-   **Reference**: `projectbrief.md` (Sections 4, 10, 11), `techContext.md`, `apiDocumentation.md`.

## 4. Key Active Decisions & Considerations

-   **MVP Scope Definition**: This is the most critical active decision. The team needs to formally agree on which features from the original pitch (`projectbrief.md` Section 5) will be included in the MVP.
-   **UI/UX Design Finalization**: The Figma designs will drive frontend development.
-   **Database Schema Refinement**: While a good base is defined in `apiDocumentation.md` (from `Estrutura de base de dados.docx`), minor adjustments might be needed as MVP scope is finalized.
-   **Authentication Flow Details**: Ensuring the NextAuth.js and FastAPI JWT interaction is seamless and secure from the start.
-   **API Contract Stability**: As frontend and backend development begin in parallel, maintaining a stable API contract (documented via Swagger/OpenAPI from FastAPI) is crucial.

## 5. Important Patterns & Technical Choices (Summary)

-   **Architecture**: Client-Server (Next.js frontend, FastAPI backend, PostgreSQL database).
    -   **Reference**: `systemPatterns.md`, `projectbrief.md` (Section 8).
-   **Authentication**: Hybrid approach using NextAuth.js (frontend session management, OAuth, credential provider) and FastAPI (JWT validation, token generation).
    -   **Reference**: `systemPatterns.md`, `apiDocumentation.md`, `projectbrief.md` (Section 9).
-   **Data Management**: SQLModel for ORM and data validation (Pydantic), Alembic for database migrations.
    -   **Reference**: `techContext.md`, `apiDocumentation.md`.
-   **AI Integration**: Google Gemini API for personalized recipe generation (integrated via the backend).
    -   **Reference**: `projectbrief.md` (Section 5, 7), `techContext.md`.
-   **DevOps & Tooling**:
    -   Git for version control.
    -   Docker and Docker Compose for containerization.
    -   Pre-commit hooks (Black, Flake8, isort, ESLint, Prettier, Bandit, SQLFluff, Hadolint, etc.) for code quality and consistency.
    -   **Reference**: `techContext.md`, `projectbrief.md` (Section 7).

## 6. Learnings & Insights (So Far)

-   **Comprehensive Initial Planning**: The project benefits from a detailed set of initial documents covering various aspects from product vision to technical implementation.
-   **Clear Role Delineation**: The "Pontos Focais de Área" model provides clear leadership for key project aspects while encouraging collaboration.
-   **Emphasis on Modern Practices**: The chosen tech stack and development practices (containerization, pre-commit, API-first for backend) are modern and aim for robustness and maintainability.
-   **Security and Quality Focus**: Detailed plans for authentication, security measures, and code quality checks (pre-commit) are in place from the outset.

## 7. Immediate Blockers/Risks

-   **MVP Scope Creep/Ambiguity**: Failure to clearly define and stick to the MVP scope could derail timelines. This is the primary focus for resolution.
-   **Environment Setup Consistency**: Ensuring all team members can successfully set up and run the Dockerized environment with pre-commit hooks is crucial for smooth development.
-   **External API Dependency (Gemini)**: While planned, any issues with accessing or integrating the Gemini API could impact a key feature. Early testing of this integration will be important.

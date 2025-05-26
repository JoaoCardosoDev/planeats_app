# Progress

*This document tracks what works, what's left to build, current status, known issues, and the evolution of project decisions.*

## Current Status (as of 2025-05-26)

-   **Phase**: Fase 1: Definição do Âmbito e Planeamento.
-   **Overall**: Initial project documentation has been processed and consolidated into the Memory Bank. The team is now focused on finalizing Phase 1 deliverables and preparing for development.

## Completed Tasks

-   **[DONE] Task**: Process all initial project documents (`.docx`, `.txt`) into the Memory Bank.
    -   **Details**: Created/updated `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `apiDocumentation.md`.
    -   **Completed**: 2025-05-26
-   **[DONE] Task**: Initialize `activeContext.md` with a synthesis of all Memory Bank information.
    -   **Completed**: 2025-05-26
-   **[DONE] Task**: Define initial team roles and points of focal area.
    -   **Details**: Documented in `projectbrief.md`.
    -   **Completed**: 2025-05-26 (as per document processing)

## To Do / In Progress (Fase 1 Deliverables & Setup)

-   **[IN PROGRESS] Task**: Define and finalize the "Documento de Âmbito do Projeto" (MVP Scope).
    -   **Owner/Notes**: Team effort. Critical Fase 1 deliverable. Compare pitch functionalities vs. MVP. Initial draft `MVP_Scope_Document.md` created on 2025-05-26 for team review and completion.
-   **[TO DO] Task**: Initialize and configure Git repository on GitHub.
    -   **Owner/Notes**: João Cardoso (leading). Includes branching strategy, Git Tags.
-   **[TO DO] Task**: Implement Dockerfiles (frontend, backend) and `docker-compose.yml`.
    -   **Owner/Notes**: João Cardoso (DB, docker-compose coordination), Santiago (Backend Dockerfile), Jessiellen (Frontend Dockerfile).
-   **[TO DO] Task**: Set up and test pre-commit hooks across the development environment.
    -   **Owner/Notes**: Team.
-   **[TO DO] Task**: Complete initial UI design in Figma.
    -   **Owner/Notes**: Jessiellen (leading). Fase 1 Deliverable.
-   **[TO DO] Task**: Develop detailed "Plano Técnico".
    -   **Owner/Notes**: Team. Fase 1 Deliverable.
-   **[TO DO] Task**: Create "Estrutura Inicial da Apresentação".
    -   **Owner/Notes**: Team. Fase 1 Deliverable.
-   **[TO DO] Task**: Draft "Documento de Modelo de Dados, Contentorização e Arquitetura".
    -   **Owner/Notes**: Team, João Cardoso (coordinating consolidation and diagrams).

## To Do (Leading into Fase 2 - Initial Development Tasks)

-   **[TO DO] Task**: Implement base database models (SQLModel) and migrations (Alembic).
    -   **Owner/Notes**: João Cardoso (leading).
-   **[TO DO] Task**: Set up basic Next.js frontend structure.
    -   **Owner/Notes**: Jessiellen (leading).
-   **[TO DO] Task**: Set up basic FastAPI backend structure with initial authentication endpoints.
    -   **Owner/Notes**: Santiago (leading).
-   **[TO DO] Task**: Early testing of Gemini API integration.
    -   **Owner/Notes**: Santiago (backend integration).

## Known Issues / Blockers

-   **MVP Scope Definition**: Needs to be finalized to prevent scope creep and ensure clear direction for development. (Active discussion)
-   **Environment Setup Consistency**: Potential risk if team members face issues with Docker/pre-commit setup. (Mitigation: collaborative setup sessions if needed).

## Evolution of Project Decisions
*(This section will be updated as decisions are made or changed throughout the project lifecycle)*

-   **Initial Decision (2025-05-26)**: Adopted a comprehensive Memory Bank structure to centralize all project knowledge from provided documents.
-   **Initial Decision (2025-05-26)**: Confirmed tech stack, architecture, and team roles as per initial documentation.

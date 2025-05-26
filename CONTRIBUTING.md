# Contributing to PlanEats

This document outlines the development workflow and best practices for contributing to the PlanEats project. Adhering to these guidelines helps maintain code quality, consistency, and a smooth development process for all team members.

## Core Branches

-   `main`: This branch represents the production-ready code. Direct commits to `main` are prohibited. It is updated by the project leader by merging changes from the `dev` branch when a stable set of features is ready for release or a significant milestone is achieved.
-   `dev`: This is the primary development branch. It integrates features from various feature branches and should always be in a state that could potentially be deployed to a staging environment. All feature branches are created from `dev` and merged back into `dev`.

## Development Workflow

The general workflow for developing a new feature or fixing a bug is as follows:

1.  **Ensure `dev` is Up-to-Date**:
    Before starting any new work, make sure your local `dev` branch is synchronized with the remote `dev` branch:
    ```bash
    git checkout dev
    git pull origin dev
    ```

2.  **Create a Feature Branch**:
    Create a new branch from the `dev` branch for your specific feature or bugfix. Use a descriptive naming convention for your branch, typically including your initials or name and a short description of the feature/fix.
    Examples:
    -   `feature/jc-user-authentication`
    -   `fix/sa-pantry-item-validation`
    -   `chore/jj-update-readme`

    ```bash
    git checkout -b feature/your-initials-feature-name dev
    ```

3.  **Develop the Feature**:
    -   Write your code on the feature branch.
    -   Commit your changes frequently with clear and concise commit messages. Follow conventional commit message formats if agreed upon by the team (e.g., `feat: ...`, `fix: ...`, `docs: ...`).
    -   Ensure your code adheres to the project's coding standards and that pre-commit hooks run successfully before each commit.
    -   Write unit tests for new functionality.

4.  **Keep Your Feature Branch Updated**:
    Periodically, rebase your feature branch onto the latest `dev` branch to incorporate recent changes and simplify the final merge. This helps to resolve conflicts incrementally.
    ```bash
    git fetch origin
    git rebase origin/dev
    # Resolve any conflicts if they occur
    ```

5.  **Push Your Feature Branch**:
    Push your feature branch to the remote repository:
    ```bash
    git push origin feature/your-initials-feature-name
    ```

6.  **Create a Merge Request (MR) / Pull Request (PR)**:
    -   Once your feature is complete and tested, create a Merge Request (or Pull Request, depending on the Git hosting platform, e.g., GitHub, GitLab) from your feature branch to the `dev` branch.
    -   Provide a clear title and description for your MR/PR, outlining the changes made and any relevant context.
    -   If your MR/PR addresses a specific issue, link it.
    -   Assign reviewers as per team policy (e.g., other team members, project leader).

7.  **Code Review and Discussion**:
    -   Team members will review the code, provide feedback, and ask questions.
    -   Address any feedback by making further commits to your feature branch. The MR/PR will update automatically.

8.  **Merge to `dev`**:
    -   Once the MR/PR is approved and all checks pass (e.g., CI tests, pre-commit checks if integrated with CI), it can be merged into the `dev` branch.
    -   Typically, the person who created the MR/PR or a designated maintainer will perform the merge.
    -   Prefer using "squash and merge" or "rebase and merge" if available and agreed upon, to keep the `dev` branch history clean.

9.  **Delete Feature Branch (Optional but Recommended)**:
    After your feature branch is merged into `dev`, it's good practice to delete it both locally and remotely to keep the repository tidy.
    ```bash
    git branch -d feature/your-initials-feature-name
    git push origin --delete feature/your-initials-feature-name
    ```

## Syncing `dev` to `main` (Project Leader Responsibility)

-   The project leader is responsible for merging changes from the `dev` branch into the `main` branch.
-   This typically occurs when a set of features is stable, well-tested, and ready for a "release" or to mark a significant project milestone.
-   The merge to `main` should ideally be a fast-forward merge if `dev` has been kept clean, or a merge commit.
-   After merging to `main`, a Git tag should be created to mark the version (e.g., `v0.1.0`, `v1.0.0`).

## General Best Practices

-   **Commit Often**: Make small, logical commits.
-   **Write Clear Commit Messages**: Explain *what* the commit does and *why*.
-   **Test Your Code**: Write unit tests and ensure all tests pass before creating an MR/PR.
-   **Run Pre-commit Hooks**: Ensure all pre-commit checks pass before committing your code.
    ```bash
    pre-commit run --all-files
    ```
-   **Communicate**: Keep the team informed about your progress and any blockers.
-   **Code Review**: Participate actively in code reviews, both as a reviewer and as an author.

By following these guidelines, we can ensure a collaborative and efficient development process for PlanEats.
